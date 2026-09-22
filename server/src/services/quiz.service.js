import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import Course from '../models/Course.js';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination } from '../utils/pagination.js';
import { nextOrder } from '../utils/nextOrder.js';
import { resolveSlug, toSlugConflict } from '../utils/slug.js';

const SLUG_CONFLICT_MESSAGE = 'A quiz with this slug already exists in this course';

// Coarse, index-friendly scoping for the LIST view. This never substitutes for the authoritative,
// full-chain check every single-quiz route performs via requireQuizAccess: a quiz that slips through
// this list because a deeper ancestor is a draft simply 404s the moment a student opens it.
const scopeToCourses = async (user) => {
  if (user.role === ROLES.ADMIN) return null;
  if (user.role === ROLES.MENTOR) {
    const courses = await Course.find({ instructors: user.id }, '_id').lean();
    return courses.map((c) => c._id);
  }
  const courses = await Course.find({ status: CONTENT_STATUS.PUBLISHED }, '_id').lean();
  return courses.map((c) => c._id);
};

export const listQuizzes = async (query, user) => {
  const { page, limit, search, status, courseId, moduleId, topicId, conceptId } = query;
  const scopedCourseIds = await scopeToCourses(user);

  const filter = {};
  if (courseId) {
    if (scopedCourseIds && !scopedCourseIds.some((id) => String(id) === courseId)) {
      return { items: [], pagination: buildPagination({ page, limit, total: 0 }) };
    }
    filter.course = courseId;
  } else if (scopedCourseIds) {
    filter.course = { $in: scopedCourseIds };
  }

  if (moduleId) Object.assign(filter, { attachmentLevel: 'module', attachmentId: moduleId });
  if (topicId) Object.assign(filter, { attachmentLevel: 'topic', attachmentId: topicId });
  if (conceptId) Object.assign(filter, { attachmentLevel: 'concept', attachmentId: conceptId });
  if (search) filter.title = new RegExp(escapeRegex(search), 'i');

  // Students can never see anything but published, regardless of what ?status= asks for.
  if (user.role === ROLES.STUDENT) filter.status = CONTENT_STATUS.PUBLISHED;
  else if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Quiz.find(filter).sort({ order: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Quiz.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
};

// courseId and attachmentId/attachmentLevel come from the URL (see conceptQuizzes.routes.js), never
// the request body.
export const createQuiz = async (attachmentLevel, attachmentId, courseId, input, user) => {
  const slug = resolveSlug(input);
  const order = input.order ?? (await nextOrder(Quiz, { course: courseId }));

  try {
    const quiz = await Quiz.create({
      ...input,
      slug,
      order,
      course: courseId,
      attachmentLevel,
      attachmentId,
      status: CONTENT_STATUS.DRAFT,
      createdBy: user.id,
    });
    return quiz.toObject();
  } catch (error) {
    throw toSlugConflict(error, SLUG_CONFLICT_MESSAGE);
  }
};

export const updateQuiz = async (quizId, input, user) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: { ...input, updatedBy: user.id } },
      { returnDocument: 'after', runValidators: true, lean: true },
    );
    if (!quiz) throw notFoundError();
    return quiz;
  } catch (error) {
    throw toSlugConflict(error, SLUG_CONFLICT_MESSAGE);
  }
};

export const setQuizStatus = async (quizId, status, user) => {
  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { $set: { status, updatedBy: user.id } },
    { returnDocument: 'after', runValidators: true, lean: true },
  );
  if (!quiz) throw notFoundError();
  return quiz;
};

// No cascade rule beyond the quiz's own questions: a quiz's questions have no other dependents. The
// real historical-data protection is refusing to delete a quiz that any attempt (submitted or still
// in progress) has ever been made against.
export const deleteQuiz = async (quizId) => {
  if (await QuizAttempt.exists({ quiz: quizId })) {
    throw new ApiError(409, 'Cannot delete this quiz because student attempts exist. Archive it instead.');
  }
  await Question.deleteMany({ quiz: quizId });
  const deleted = await Quiz.findByIdAndDelete(quizId);
  if (!deleted) throw notFoundError();
};