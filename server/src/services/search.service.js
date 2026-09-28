import mongoose from 'mongoose';
import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import { SEARCH_LIMITS, TYPE_RANK } from '../constants/search.js';
import Concept from '../models/Concept.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Module from '../models/Module.js';
import Quiz from '../models/Quiz.js';
import Resource from '../models/Resource.js';
import Topic from '../models/Topic.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination } from '../utils/pagination.js';
import { toSearchResult } from '../utils/searchSerializers.js';

const PUBLISHED = CONTENT_STATUS.PUBLISHED;
const oid = (id) => new mongoose.Types.ObjectId(String(id));
const MODELS = { course: Course, module: Module, topic: Topic, concept: Concept, resource: Resource, quiz: Quiz };

// ---------------------------------------------------------------------------------------------------
// Scope: WHICH courses may this caller see content from? Computed once per request, then applied INSIDE
// every aggregation (never as a post-filter on fetched rows).
//   courseIds  null = unrestricted (admin), otherwise the allowed course ids (possibly empty)
//   publishedOnly  true for students: every node in the chain must be published
// ---------------------------------------------------------------------------------------------------
export const resolveScope = async (user, requestedCourseId = null) => {
  const requested = requestedCourseId ? oid(requestedCourseId) : null;
  const narrow = (ids) => (requested ? ids.filter((id) => String(id) === String(requested)) : ids);

  if (user.role === ROLES.ADMIN) {
    return { role: user.role, publishedOnly: false, requested, courseIds: requested ? [requested] : null, enrolledIds: new Set() };
  }

  if (user.role === ROLES.MENTOR) {
    const courses = await Course.find({ instructors: oid(user.id) }, '_id').lean();
    return { role: user.role, publishedOnly: false, requested, courseIds: narrow(courses.map((c) => c._id)), enrolledIds: new Set() };
  }

  // Student: learning content needs an active/completed enrollment in a currently published course.
  const enrollments = await Enrollment.find({ student: oid(user.id), status: { $ne: 'cancelled' } }, 'course').lean();
  const courses = enrollments.length
    ? await Course.find({ _id: { $in: enrollments.map((e) => e.course) }, status: PUBLISHED }, '_id').lean()
    : [];
  const ids = courses.map((c) => c._id);
  return { role: user.role, publishedOnly: true, requested, courseIds: narrow(ids), enrolledIds: new Set(ids.map(String)) };
};

// ---------------------------------------------------------------------------------------------------
// Pipeline building blocks
// ---------------------------------------------------------------------------------------------------
const contains = (fields, rx) => ({ $or: fields.map((field) => ({ [field]: rx })) });

// Relevance: 4 exact title, 3 title prefix, 2 title contains, 1 description-only.
// {$literal} matters: a query such as "$title" must never be read as a field path.
const scoreExpr = (qLower) => {
  const title = { $toLower: { $ifNull: ['$title', ''] } };
  const at = { $indexOfCP: [title, { $literal: qLower }] };
  return {
    $switch: {
      branches: [
        { case: { $eq: [title, { $literal: qLower }] }, then: 4 },
        { case: { $eq: [at, 0] }, then: 3 },
        { case: { $gte: [at, 0] }, then: 2 },
      ],
      default: 1,
    },
  };
};

const SORTS = {
  relevance: { _score: -1, _sortTitle: 1, _id: 1 },
  title: { _sortTitle: 1, _id: 1 },
  updated: { updatedAt: -1, _id: 1 },
};

// Parent chains. localField / pipeline in $lookup needs MongoDB 5.0+. Each lookup projects only what the
// authorization check and result context need. $unwind (without preserve) drops orphaned nodes.
const CHAINS = {
  module: [],
  topic: [{ as: 'm', from: 'modules', local: 'module' }],
  concept: [{ as: 't', from: 'topics', local: 'topic' }, { as: 'm', from: 'modules', local: 't.module' }],
  resource: [
    { as: 'c', from: 'concepts', local: 'concept' },
    { as: 't', from: 'topics', local: 'c.topic' },
    { as: 'm', from: 'modules', local: 't.module' },
  ],
};

const LOOKUP_FIELDS = { title: 1, status: 1, module: 1, topic: 1, course: 1 };
const lookup = (from, localField, as, preserve = false) => [
  { $lookup: { from, localField, foreignField: '_id', as, pipeline: [{ $project: LOOKUP_FIELDS }] } },
  { $unwind: preserve ? { path: `$${as}`, preserveNullAndEmptyArrays: true } : `$${as}` },
];

const courseFilter = (scope, rx) => {
  const text = contains(['title', 'shortDescription', 'description'], rx);
  if (scope.role === ROLES.ADMIN) return { ...text, ...(scope.requested ? { _id: scope.requested } : {}) };
  if (scope.role === ROLES.MENTOR) return { ...text, _id: { $in: scope.courseIds } };
  return { ...text, status: PUBLISHED, ...(scope.requested ? { _id: scope.requested } : {}) };
};

// Everything up to and INCLUDING the authorization match.
const authorizedStages = (kind, scope, rx) => {
  if (kind === 'course') return [{ $match: courseFilter(scope, rx) }];

  const first = contains(['title', 'description'], rx);
  if (scope.publishedOnly) first.status = PUBLISHED;
  if (scope.courseIds && (kind === 'module' || kind === 'quiz')) first.course = { $in: scope.courseIds };
  const stages = [{ $match: first }];

  if (kind === 'quiz') {
    // A quiz attaches to a course, module, topic or concept. ObjectIds are unique across collections, so
    // looking the attachment id up in each collection resolves whichever level it points at.
    stages.push(
      ...lookup('concepts', 'attachmentId', 'c', true),
      { $addFields: { _topicId: { $ifNull: ['$c.topic', '$attachmentId'] } } },
      ...lookup('topics', '_topicId', 't', true),
      { $addFields: { _moduleId: { $ifNull: ['$t.module', '$attachmentId'] } } },
      ...lookup('modules', '_moduleId', 'm', true),
    );
    if (scope.publishedOnly) {
      stages.push({
        $match: {
          $or: [
            { attachmentLevel: 'course' },
            { attachmentLevel: 'module', 'm.status': PUBLISHED },
            { attachmentLevel: 'topic', 't.status': PUBLISHED, 'm.status': PUBLISHED },
            { attachmentLevel: 'concept', 'c.status': PUBLISHED, 't.status': PUBLISHED, 'm.status': PUBLISHED },
          ],
        },
      });
    }
    return stages;
  }

  const chain = CHAINS[kind];
  for (const link of chain) stages.push(...lookup(link.from, link.local, link.as));

  const auth = {};
  if (kind !== 'module' && scope.courseIds) auth['m.course'] = { $in: scope.courseIds };
  if (scope.publishedOnly) for (const link of chain) auth[`${link.as}.status`] = PUBLISHED;
  if (Object.keys(auth).length) stages.push({ $match: auth });
  return stages;
};

const CONTEXT = {
  course: { courseId: '$_id' },
  module: { courseId: '$course', moduleId: '$_id' },
  topic: { courseId: '$m.course', moduleTitle: '$m.title', topicId: '$_id' },
  concept: { courseId: '$m.course', moduleTitle: '$m.title', topicTitle: '$t.title', conceptId: '$_id' },
  resource: { courseId: '$m.course', moduleTitle: '$m.title', topicTitle: '$t.title', conceptTitle: '$c.title', resourceType: '$type' },
  quiz: { courseId: '$course', moduleTitle: '$m.title', topicTitle: '$t.title', conceptTitle: '$c.title' },
};
const COURSE_LOCAL = { module: 'course', quiz: 'course', topic: 'm.course', concept: 'm.course', resource: 'm.course' };

const descriptionExpr = (kind) => ({
  $substrCP: [
    kind === 'course'
      ? { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$shortDescription', ''] } }, 0] }, '$shortDescription', { $ifNull: ['$description', ''] }] }
      : { $ifNull: ['$description', ''] },
    0,
    SEARCH_LIMITS.DESCRIPTION_PREVIEW,
  ],
});

// Presentation lookups run AFTER $limit, so they only touch the rows actually returned.
const presentStages = (kind, cap, sort, scope) => {
  const stages = [{ $sort: SORTS[sort] }, { $limit: cap }];

  if (kind === 'concept') {
    stages.push({
      $lookup: {
        from: 'resources',
        let: { conceptId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$concept', '$$conceptId'] }, ...(scope.publishedOnly ? { status: PUBLISHED } : {}) } },
          { $sort: { order: 1, _id: 1 } },
          { $limit: 1 },
          { $project: { _id: 1 } },
        ],
        as: '_first',
      },
    });
  }
  if (kind !== 'course') {
    stages.push({ $lookup: { from: 'courses', localField: COURSE_LOCAL[kind], foreignField: '_id', as: '_course', pipeline: [{ $project: { title: 1 } }] } });
  }

  stages.push({
    $project: {
      _id: 0,
      id: '$_id',
      kind: { $literal: kind },
      title: 1,
      description: descriptionExpr(kind),
      status: 1,
      updatedAt: 1,
      _score: 1,
      _sortTitle: 1,
      courseTitle: kind === 'course' ? '$title' : { $arrayElemAt: ['$_course.title', 0] },
      ...CONTEXT[kind],
      ...(kind === 'concept' ? { firstResourceId: { $arrayElemAt: ['$_first._id', 0] } } : {}),
    },
  });
  return stages;
};

const runKind = async (kind, { rx, qLower, scope, sort, cap }) => {
  const [out] = await MODELS[kind].aggregate([
    ...authorizedStages(kind, scope, rx),
    { $addFields: { _score: scoreExpr(qLower), _sortTitle: { $toLower: { $ifNull: ['$title', ''] } } } },
    { $facet: { total: [{ $count: 'n' }], items: presentStages(kind, cap, sort, scope) } },
  ]);
  return { total: out?.total?.[0]?.n ?? 0, items: out?.items ?? [] };
};

const comparators = {
  relevance: (a, b) =>
    b._score - a._score || TYPE_RANK[a.kind] - TYPE_RANK[b.kind] || a._sortTitle.localeCompare(b._sortTitle) || String(a.id).localeCompare(String(b.id)),
  title: (a, b) => a._sortTitle.localeCompare(b._sortTitle) || String(a.id).localeCompare(String(b.id)),
  updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) || String(a.id).localeCompare(String(b.id)),
};

// `types` is already validated. Content types are skipped outright when the caller has no accessible course.
export const search = async ({ q, types, sort, page, limit }, scope) => {
  const rx = new RegExp(escapeRegex(q), 'i'); // user text is only ever an escaped regex, never an operator
  const qLower = q.toLowerCase();
  const cap = page * limit;
  const noContentAccess = scope.courseIds !== null && scope.courseIds.length === 0;
  const active = types.filter((type) => type === 'course' || !noContentAccess);

  const results = await Promise.all(active.map((kind) => runKind(kind, { rx, qLower, scope, sort, cap })));
  const total = results.reduce((sum, r) => sum + r.total, 0);
  const merged = results.flatMap((r) => r.items).sort(comparators[sort]);

  return {
    results: merged.slice((page - 1) * limit, page * limit).map((row) => toSearchResult(row, scope)),
    pagination: buildPagination({ page, limit, total }),
  };
};