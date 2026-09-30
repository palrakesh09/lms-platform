import { CONTENT_STATUS } from '../constants/lms.js';
import CodingExercise from '../models/CodingExercise.js';
import CodingAttempt from '../models/CodingAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { nextOrder } from '../utils/nextOrder.js';
import { resolveSlug, toSlugConflict } from '../utils/slug.js';

const SLUG_CONFLICT = 'A coding exercise with this slug already exists in this course';

export const listByConcept = (conceptId, user) => {
  const filter = { attachmentLevel: 'concept', attachmentId: conceptId };
  return CodingExercise.find(filter).sort({ order: 1, _id: 1 }).lean();
};

export const create = async (conceptId, courseId, input, user) => {
  const slug = resolveSlug(input);
  const order = input.order ?? (await nextOrder(CodingExercise, { course: courseId }));
  try {
    const created = await CodingExercise.create({ ...input, slug, order, course: courseId, attachmentLevel: 'concept', attachmentId: conceptId, status: CONTENT_STATUS.DRAFT, createdBy: user.id });
    return created.toObject();
  } catch (error) { throw toSlugConflict(error, SLUG_CONFLICT); }
};

export const update = async (id, input, user) => {
  try {
    const exercise = await CodingExercise.findByIdAndUpdate(id, { $set: { ...input, updatedBy: user.id } }, { returnDocument: 'after', runValidators: true, lean: true });
    if (!exercise) throw notFoundError();
    return exercise;
  } catch (error) { throw toSlugConflict(error, SLUG_CONFLICT); }
};

export const setStatus = async (id, status, user) => {
  const exercise = await CodingExercise.findByIdAndUpdate(id, { $set: { status, updatedBy: user.id } }, { returnDocument: 'after', runValidators: true, lean: true });
  if (!exercise) throw notFoundError();
  return exercise;
};

export const remove = async (id) => {
  if (await CodingAttempt.exists({ exercise: id })) throw new ApiError(409, 'Cannot delete this exercise because student attempts exist. Archive it instead.');
  const deleted = await CodingExercise.findByIdAndDelete(id);
  if (!deleted) throw notFoundError();
};

// For run/submit only: loads WITH hidden test code, never returned to the client directly — only
// forwarded into the sandbox payload and then discarded from the response.
export const loadWithTests = (id) => CodingExercise.findById(id).select('+testCases.code').lean();