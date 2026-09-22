import * as quizService from '../services/quiz.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toQuiz } from '../utils/quizSerializers.js';

export const list = async (req, res) => {
  const { items, pagination } = await quizService.listQuizzes(req.validatedQuery, req.user);
  sendSuccess(res, { message: 'Quizzes fetched successfully', data: items.map((quiz) => toQuiz(quiz, req.user)), pagination });
};

export const get = (req, res) => sendSuccess(res, { message: 'Quiz fetched successfully', data: toQuiz(req.quiz, req.user) });

// Mounted under /concepts/:conceptId/quizzes; req.content comes from Phase 5's requireCourseAccess.
export const create = async (req, res) => {
  const quiz = await quizService.createQuiz('concept', req.content.node._id, req.content.course._id, req.body, req.user);
  sendSuccess(res, { statusCode: 201, message: 'Quiz created successfully', data: toQuiz(quiz, req.user) });
};

export const update = async (req, res) => {
  const quiz = await quizService.updateQuiz(req.quiz._id, req.body, req.user);
  sendSuccess(res, { message: 'Quiz updated successfully', data: toQuiz(quiz, req.user) });
};

export const publish = async (req, res) => {
  const quiz = await quizService.setQuizStatus(req.quiz._id, 'published', req.user);
  sendSuccess(res, { message: 'Quiz published successfully', data: toQuiz(quiz, req.user) });
};

export const archive = async (req, res) => {
  const quiz = await quizService.setQuizStatus(req.quiz._id, 'archived', req.user);
  sendSuccess(res, { message: 'Quiz archived successfully', data: toQuiz(quiz, req.user) });
};

export const remove = async (req, res) => {
  await quizService.deleteQuiz(req.quiz._id);
  sendSuccess(res, { message: 'Quiz deleted successfully' });
};