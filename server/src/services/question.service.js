import { ORDER_SORT } from '../constants/listing.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { nextOrder } from '../utils/nextOrder.js';

export const listQuestions = (quizId) => Question.find({ quiz: quizId }).sort({ ...ORDER_SORT }).lean();

export const listQuestionsForManagement = (quizId) =>
  Question.find({ quiz: quizId }).select('+correctAnswer').sort({ ...ORDER_SORT }).lean();

// Selected with the answer key ONLY for scoring — see quizAttempt.service.js, the sole caller.
export const listQuestionsForScoring = (quizId) =>
  Question.find({ quiz: quizId }).select('+correctAnswer').sort({ ...ORDER_SORT }).lean();

export const createQuestion = async (quizId, input, user) => {
  const order = input.order ?? (await nextOrder(Question, { quiz: quizId }));
  const created = await Question.create({ ...input, quiz: quizId, order, createdBy: user.id });
  return created.toObject();
};

// Loaded with correctAnswer and updated via .save() (not findByIdAndUpdate) so the pre('validate')
// options/correctAnswer cross-check runs against the FULL merged document, even for a partial edit
// that only touches one of the two fields.
export const updateQuestion = async (id, input, user) => {
  const question = await Question.findById(id).select('+correctAnswer');
  if (!question) throw notFoundError();

  Object.assign(question, input, { updatedBy: user.id });
  await question.save();
  return question.toObject();
};

export const deleteQuestion = async (id) => {
  if (await QuizAttempt.exists({ 'answers.question': id })) {
    throw new ApiError(409, 'Cannot delete this question because it has already been answered by students.');
  }
  const deleted = await Question.findByIdAndDelete(id);
  if (!deleted) throw notFoundError();
};