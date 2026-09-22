import { CONTENT_STATUS } from '../constants/lms.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Resource from '../models/Resource.js';
import { ApiError } from '../utils/ApiError.js';
import { loadContentChain } from './contentAccess.service.js';
import { getPublishedConceptIds } from './structure.service.js';

const round1 = (value) => Math.round(value * 10) / 10;

const summarize = (total, completed) => ({
  totalConcepts: total,
  completedConcepts: completed,
  remainingConcepts: total - completed,
  percentage: total === 0 ? 0 : round1((completed / total) * 100),
});

const toConceptProgressView = (doc) => ({
  conceptId: String(doc.concept),
  completed: doc.completed,
  completedAt: doc.completedAt,
  lastAccessedAt: doc.lastAccessedAt,
  lastAccessedResource: doc.lastAccessedResource ? String(doc.lastAccessedResource) : null,
});

// Upserts the (student, concept) row. findOneAndUpdate's upsert can race under the unique index when
// two requests arrive at once; on a duplicate-key error from a concurrent request, retry as a plain
// update — the row now exists, so this never surfaces the race to the caller.
const upsertProgress = async (filter, update) => {
  try {
    const doc = await Progress.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean();
    return toConceptProgressView(doc);
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const doc = await Progress.findOneAndUpdate(filter, update, { new: true, runValidators: true }).lean();
    return toConceptProgressView(doc);
  }
};

export const getConceptProgress = async (studentId, conceptId) => {
  const doc = await Progress.findOne({ student: studentId, concept: conceptId }).lean();

  return doc
    ? toConceptProgressView(doc)
    : { conceptId: String(conceptId), completed: false, completedAt: null, lastAccessedAt: null, lastAccessedResource: null };
};

// `courseId` is req.content.course._id — the concept's OWN verified course, resolved by
// requireCourseAccess from the concept itself. It is never a value the client could substitute,
// so a concept can never be recorded against the wrong course.
export const setConceptCompletion = (studentId, conceptId, courseId, completed) =>
  upsertProgress(
    { student: studentId, concept: conceptId },
    {
      $set: { completed, completedAt: completed ? new Date() : null, lastAccessedAt: new Date(), course: courseId },
      $setOnInsert: { student: studentId, concept: conceptId },
    },
  );

// Records that the student opened `resourceId` under `conceptId` inside `courseId`. Every relationship
// is re-verified against the database — none of the three ids are trusted just because they arrived
// together in one request. This NEVER sets `completed`; only setConceptCompletion does that.
export const recordAccess = async (studentId, courseId, conceptId, resourceId) => {
  const chain = await loadContentChain('resource', resourceId);
  if (!chain) throw new ApiError(404, 'Resource not found');

  const [, concept] = chain.path; // path[0] is the resource itself, path[1] its concept
  const belongsHere = String(chain.course._id) === String(courseId) && String(concept._id) === String(conceptId);

  if (!belongsHere) {
    throw new ApiError(400, 'The resource does not belong to the specified concept and course');
  }

  // The course itself was already confirmed readable by requireCourseAccess on the route. This
  // additionally confirms the resource and every node between it and the course (concept, topic,
  // module) are currently published, so a student can never record — or later have counted —
  // progress against hidden content.
  if (!chain.path.every((node) => node.status === CONTENT_STATUS.PUBLISHED)) {
    throw new ApiError(404, 'Resource not found');
  }

  return upsertProgress(
    { student: studentId, concept: conceptId },
    {
      $set: { lastAccessedAt: new Date(), lastAccessedResource: resourceId, course: courseId },
      $setOnInsert: { student: studentId, concept: conceptId, completed: false },
    },
  );
};

// `course` is the lean document requireCourseAccess already loaded and authorized for this student.
export const getCourseProgressSummary = async (studentId, course) => {
  const publishedConceptIds = await getPublishedConceptIds(course._id);
  const publishedSet = new Set(publishedConceptIds);

  const rows = await Progress.find(
    { student: studentId, course: course._id },
    'concept completed completedAt lastAccessedAt lastAccessedResource',
  )
    .sort({ lastAccessedAt: -1 })
    .lean();

  // Only concepts CURRENTLY published count toward the total and the completed count, so a concept
  // unpublished after being completed can never push the percentage above 100%.
  const visibleRows = rows.filter((row) => publishedSet.has(String(row.concept)));
  const completed = visibleRows.filter((row) => row.completed).length;
  const mostRecent = visibleRows[0]; // already sorted by lastAccessedAt desc

  return {
    course: { id: String(course._id), title: course.title, slug: course.slug, thumbnail: course.thumbnail, level: course.level },
    summary: summarize(publishedConceptIds.length, completed),
    conceptProgress: visibleRows.map(toConceptProgressView),
    lastAccessed: mostRecent
      ? {
          conceptId: String(mostRecent.concept),
          resourceId: mostRecent.lastAccessedResource ? String(mostRecent.lastAccessedResource) : null,
        }
      : null,
  };
};

// One entry per course that has at least one progress row, restricted to courses still published —
// a course withdrawn after the student started it drops off "My Learning" rather than link to
// content the student can no longer open.
export const getMyLearning = async (studentId) => {
  const grouped = await Progress.aggregate([
    { $match: { student: studentId } },
    { $sort: { lastAccessedAt: -1 } },
    {
      $group: {
        _id: '$course',
        completedConcepts: { $sum: { $cond: ['$completed', 1, 0] } },
        // $first, after the preceding $sort, picks the most-recently-accessed row per course.
        lastConcept: { $first: '$concept' },
        lastResource: { $first: '$lastAccessedResource' },
      },
    },
  ]);

  if (grouped.length === 0) return [];

  const courseIds = grouped.map((group) => group._id);
  const courses = await Course.find(
    { _id: { $in: courseIds }, status: CONTENT_STATUS.PUBLISHED },
    'title slug thumbnail level',
  ).lean();
  const courseById = new Map(courses.map((course) => [String(course._id), course]));

  const resourceIds = grouped.map((group) => group.lastResource).filter(Boolean);
  const resources = await Resource.find({ _id: { $in: resourceIds } }, 'title').lean();
  const resourceById = new Map(resources.map((resource) => [String(resource._id), resource]));

  const entries = await Promise.all(
    grouped
      .filter((group) => courseById.has(String(group._id)))
      .map(async (group) => {
        const course = courseById.get(String(group._id));
        const totalConcepts = (await getPublishedConceptIds(course._id)).length;
        const completedConcepts = Math.min(group.completedConcepts, totalConcepts);
        const resource = group.lastResource ? resourceById.get(String(group.lastResource)) : null;

        return {
          course: { id: String(course._id), title: course.title, slug: course.slug, thumbnail: course.thumbnail, level: course.level },
          progress: {
            totalConcepts,
            completedConcepts,
            percentage: totalConcepts === 0 ? 0 : round1((completedConcepts / totalConcepts) * 100),
          },
          lastAccessed: resource
            ? { conceptId: String(group.lastConcept), resourceId: String(group.lastResource), title: resource.title }
            : null,
        };
      }),
  );

  return entries.sort((a, b) => a.course.title.localeCompare(b.course.title));
};