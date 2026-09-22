import { ORDER_SORT } from '../constants/listing.js';
import { CONTENT_STATUS } from '../constants/lms.js';
import Concept from '../models/Concept.js';
import Module from '../models/Module.js';
import Resource from '../models/Resource.js';
import Topic from '../models/Topic.js';
import { isStaff } from '../policies/courseAccess.js';

const idOf = (doc) => String(doc._id);

// Map of parentId → children, preserving the (already sorted) order of `docs`.
const groupBy = (docs, field) => {
  const groups = new Map();

  for (const doc of docs) {
    const key = String(doc[field]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  }
  return groups;
};

// One batched query per level: children of ALL parents found so far, in a single $in query.
const findChildren = (Model, parentField, parents, projection, visibility) =>
  parents.length === 0
    ? []
    : Model.find({ [parentField]: { $in: parents.map((parent) => parent._id) }, ...visibility }, projection)
        .sort({ ...ORDER_SORT })
        .lean();

// Builds course → modules → topics → concepts → resources in FOUR collection queries total,
// however large the course is. `course` is the document the middleware already loaded and authorized.
//
// Visibility cascades naturally: children are only fetched for parents that survived the status
// filter, so for students a published concept under a draft topic never appears.
export const getCourseStructure = async (course, user) => {
  const staff = isStaff(user);
  const visibility = staff ? {} : { status: CONTENT_STATUS.PUBLISHED };

  const modules = await Module.find({ course: course._id, ...visibility }, 'title slug order status')
    .sort({ ...ORDER_SORT })
    .lean();
  const topics = await findChildren(Topic, 'module', modules, 'module title slug order status', visibility);
  const concepts = await findChildren(Concept, 'topic', topics, 'topic title slug order status', visibility);
  const resources = await findChildren(
    Resource,
    'concept',
    concepts,
    'concept type title url openInNewTab order status',
    visibility,
  );

  const topicsByModule = groupBy(topics, 'module');
  const conceptsByTopic = groupBy(concepts, 'topic');
  const resourcesByConcept = groupBy(resources, 'concept');
  const childrenOf = (groups, doc) => groups.get(idOf(doc)) ?? [];

  // Only staff need to see status. For students everything shown is published by definition.
  const withStatus = (view, doc) => (staff ? { ...view, status: doc.status } : view);

  const toResourceView = (resource) =>
    withStatus(
      {
        id: idOf(resource),
        type: resource.type,
        title: resource.title,
        url: resource.url,
        openInNewTab: resource.openInNewTab,
        order: resource.order,
      },
      resource,
    );

  const toConceptView = (concept) =>
    withStatus(
      {
        id: idOf(concept),
        title: concept.title,
        slug: concept.slug,
        order: concept.order,
        resources: childrenOf(resourcesByConcept, concept).map(toResourceView),
      },
      concept,
    );

  const toTopicView = (topic) =>
    withStatus(
      {
        id: idOf(topic),
        title: topic.title,
        slug: topic.slug,
        order: topic.order,
        concepts: childrenOf(conceptsByTopic, topic).map(toConceptView),
      },
      topic,
    );

  const toModuleView = (mod) =>
    withStatus(
      {
        id: idOf(mod),
        title: mod.title,
        slug: mod.slug,
        order: mod.order,
        topics: childrenOf(topicsByModule, mod).map(toTopicView),
      },
      mod,
    );

  return {
    course: { id: idOf(course), title: course.title, slug: course.slug, status: course.status },
    modules: modules.map(toModuleView),
  };
};

// Used by the progress feature (Phase 8) to compute a student's course totals against only the
// concepts they can actually see, reusing the same batched, indexed queries as getCourseStructure
// instead of a fresh Module→Topic→Concept walk per feature.
export const getPublishedConceptIds = async (courseId) => {
  const modules = await Module.find({ course: courseId, status: CONTENT_STATUS.PUBLISHED }, '_id').lean();
  if (modules.length === 0) return [];

  const topics = await Topic.find(
    { module: { $in: modules.map((m) => m._id) }, status: CONTENT_STATUS.PUBLISHED },
    '_id',
  ).lean();
  if (topics.length === 0) return [];

  const concepts = await Concept.find(
    { topic: { $in: topics.map((t) => t._id) }, status: CONTENT_STATUS.PUBLISHED },
    '_id',
  ).lean();
  return concepts.map((concept) => String(concept._id));
};