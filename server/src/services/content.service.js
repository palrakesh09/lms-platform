import { ORDER_SORT } from '../constants/listing.js';
import { CONTENT_STATUS } from '../constants/lms.js';
import Concept from '../models/Concept.js';
import Module from '../models/Module.js';
import Progress from '../models/Progress.js';
import Resource from '../models/Resource.js';
import Topic from '../models/Topic.js';
import { isStaff } from '../policies/courseAccess.js';
import { notFoundError } from '../utils/contentErrors.js';
import { nextOrder } from '../utils/nextOrder.js';
import { resolveSlug, toSlugConflict } from '../utils/slug.js';
import { deleteGuarded } from './deletion.service.js';

// Modules, topics, concepts and resources differ only in configuration, so one factory serves all four.
//   parentField    the field pointing at the parent (set from the URL, immutable afterwards)
//   filterFields   extra list filters allowed for this entity (e.g. resource `type`)
//   blockers       what must be empty before a delete (see deleteGuarded)
//
// Callers have ALREADY been authorized by requireCourseAccess: the parent id passed to
// listByParent/create is one the middleware verified, and update/remove receive a verified target id.
const createContentService = ({ Model, label, parentLabel, parentField, filterFields = [], blockers = [] }) => {
  const hasSlug = Boolean(Model.schema.path('slug'));
  const slugConflictMessage = `A ${label} with this slug already exists in this ${parentLabel}`;

  const listByParent = async (parentId, user, filters = {}) => {
    const query = { [parentField]: parentId };

    for (const field of filterFields) {
      if (filters[field] !== undefined) query[field] = filters[field];
    }
    // Staff see every status. Everyone else sees published only.
    if (!isStaff(user)) query.status = CONTENT_STATUS.PUBLISHED;

    return Model.find(query).sort({ ...ORDER_SORT }).lean();
  };

  const create = async (parentId, input, user) => {
    const data = {
      ...input,
      [parentField]: parentId, // from the URL, verified by the middleware
      createdBy: user.id, // from the token
      order: input.order ?? (await nextOrder(Model, { [parentField]: parentId })),
    };
    if (hasSlug) data.slug = resolveSlug(input);

    try {
      const created = await Model.create(data);
      return created.toObject();
    } catch (error) {
      throw toSlugConflict(error, slugConflictMessage);
    }
  };

  const update = async (id, input, user) => {
    try {
      const updated = await Model.findByIdAndUpdate(
        id,
        { $set: { ...input, updatedBy: user.id } },
        { returnDocument: 'after', runValidators: true, lean: true },
      );

      if (!updated) throw notFoundError();
      return updated;
    } catch (error) {
      throw toSlugConflict(error, slugConflictMessage);
    }
  };

  const remove = (id) => deleteGuarded(Model, id, blockers);

  return { listByParent, create, update, remove };
};

export const moduleService = createContentService({
  Model: Module,
  label: 'module',
  parentLabel: 'course',
  parentField: 'course',
  blockers: [
    {
      Model: Topic,
      field: 'module',
      message: 'Cannot delete module because it contains topics. Remove its topics first.',
    },
  ],
});

export const topicService = createContentService({
  Model: Topic,
  label: 'topic',
  parentLabel: 'module',
  parentField: 'module',
  blockers: [
    {
      Model: Concept,
      field: 'topic',
      message: 'Cannot delete topic because it contains concepts. Remove its concepts first.',
    },
  ],
});

export const conceptService = createContentService({
  Model: Concept,
  label: 'concept',
  parentLabel: 'topic',
  parentField: 'topic',
  blockers: [
    {
      Model: Resource,
      field: 'concept',
      message: 'Cannot delete concept because it contains resources. Remove its resources first.',
    },
    {
      // Deleting it would orphan students' progress records.
      Model: Progress,
      field: 'concept',
      message: 'Cannot delete concept because students have recorded progress on it. Archive it instead.',
    },
  ],
});

export const resourceService = createContentService({
  Model: Resource,
  label: 'resource',
  parentLabel: 'concept',
  parentField: 'concept',
  filterFields: ['type'],
});