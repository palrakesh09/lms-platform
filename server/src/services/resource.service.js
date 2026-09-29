import { ORDER_SORT } from '../constants/listing.js';
import { CONTENT_STATUS } from '../constants/lms.js';
import Resource from '../models/Resource.js';
import { isStaff } from '../policies/courseAccess.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { nextOrder } from '../utils/nextOrder.js';
import * as events from './notification.events.js';
import Media from '../models/Media.js';
import { resolveMediaContext } from './mediaAccess.service.js';

const missingContentError = () =>
  new ApiError(422, 'Validation failed', [
    { field: 'content', message: 'Provide an external URL, at least one content block, or both' },
  ]);

// A resource must give a student SOMETHING to see. Checked against the final merged state (the full
// input on create; the existing document plus the requested changes on update), never against the
// request body alone — so a partial update that only touches, say, the title is never wrongly rejected.
const hasUsableContent = (doc) => {
  const hasUrl = typeof doc.url === 'string' && doc.url.trim() !== '';
  const hasBlocks = Array.isArray(doc.content?.blocks) && doc.content.blocks.length > 0;
  return hasUrl || hasBlocks;
};

export const listByParent = async (conceptId, user, filters = {}) => {
  const query = { concept: conceptId };
  if (filters.type !== undefined) query.type = filters.type;
  if (!isStaff(user)) query.status = CONTENT_STATUS.PUBLISHED;
  return Resource.find(query).sort({ ...ORDER_SORT }).lean();
};

export const create = async (conceptId, input, user) => {
  if (!hasUsableContent(input)) throw missingContentError();

  const data = {
    ...input,
    concept: conceptId, // from the URL, verified by the middleware
    createdBy: user.id,
    order: input.order ?? (await nextOrder(Resource, { concept: conceptId })),
  };
  const created = await Resource.create(data);
  if (created.status === CONTENT_STATUS.PUBLISHED) await events.resourcePublished(created.toObject());
  return created.toObject();
};

// Loaded and saved via .save() (not findByIdAndUpdate) so the merged, post-update state is what
// hasUsableContent() actually checks — findByIdAndUpdate would only ever see the $set patch, not the
// document it's being applied to.
export const update = async (id, input, user) => {
  const resource = await Resource.findById(id);
  if (!resource) throw notFoundError();

  const previousStatus = resource.status;

  Object.assign(resource, input, { updatedBy: user.id });
  if (!hasUsableContent(resource)) throw missingContentError();

  await resource.save();
  if (previousStatus !== CONTENT_STATUS.PUBLISHED && resource.status === CONTENT_STATUS.PUBLISHED) {
    await events.resourcePublished(resource.toObject()); // only a real transition; never for drafts
  }
  return resource.toObject();
};

export const remove = async (id) => {
  const deleted = await Resource.findByIdAndDelete(id);
  if (!deleted) throw notFoundError();
};

const assertMediaReferencesValid = async (conceptId, { content , attachments }) => {
  const { course } = await resolveMediaContext('concept', conceptId);
  const imageIds = (content?.blocks ?? []).filter((b) => b.type === 'image' && b.mediaId).map((b) => b.mediaId);
  const attachmentIds = (attachments ?? []).map((a) => a.mediaId);
  const allIds = [...new Set([...imageIds, ...attachmentIds])];
  if (allIds.length === 0) return;

  const docs = await Media.find({ _id: { $in: allIds }, status: 'active', course: course._id }).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  for (const id of imageIds) {
    if (byId.get(id)?.category !== 'image') throw new ApiError(422, 'Validation failed', [{ field: 'content', message: 'One or more images are invalid or do not belong to this course' }]);
  }
  for (const id of attachmentIds) {
    if (byId.get(id)?.category !== 'document') throw new ApiError(422, 'Validation failed', [{ field: 'attachments', message: 'One or more attachments are invalid or do not belong to this course' }]);
  }
};