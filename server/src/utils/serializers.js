import { ROLES } from '../constants/lms.js';
import { isStaff } from '../policies/courseAccess.js';

// Explicit whitelists: a field added to a model later is NOT exposed unless listed here.
// Students never see audit fields, instructors, or user ids.

const idOf = (value) => (value === null || value === undefined ? null : String(value));

const auditFields = (doc, user) =>
  isStaff(user) ? { createdBy: idOf(doc.createdBy), updatedBy: idOf(doc.updatedBy) } : {};

// Fields that were not selected (e.g. `description` in list queries) are undefined and drop out of the JSON.
export const toCourse = (doc, user) => ({
  id: idOf(doc._id),
  title: doc.title,
  slug: doc.slug,
  shortDescription: doc.shortDescription,
  description: doc.description,
  thumbnail: doc.thumbnail,
  level: doc.level,
  category: doc.category,
  status: doc.status,
  order: doc.order,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  ...auditFields(doc, user),
  ...(user.role === ROLES.ADMIN && { instructors: (doc.instructors ?? []).map(idOf) }),
});

const nodeSerializer = (parentField) => (doc, user) => ({
  id: idOf(doc._id),
  [parentField]: idOf(doc[parentField]),
  title: doc.title,
  slug: doc.slug, // resources have no slug, so it is omitted for them
  description: doc.description,
  order: doc.order,
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  ...auditFields(doc, user),
});

export const toModule = nodeSerializer('course');
export const toTopic = nodeSerializer('module');
export const toConcept = nodeSerializer('topic');

const conceptChild = nodeSerializer('concept');

export const toResource = (doc, user) => ({
  ...conceptChild(doc, user),
  type: doc.type,
  url: doc.url,
  openInNewTab: doc.openInNewTab,
});