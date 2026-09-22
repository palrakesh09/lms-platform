import * as attemptService from '../services/quizAttempt.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toAttemptDetailView, toHistoryView, toResultView, toStartView } from '../utils/quizSerializers.js';

export const start = async (req, res) => {
  const { attempt, questions } = await attemptService.startQuiz(req.user, req.quiz);
  sendSuccess(res, { message: 'Quiz started successfully', data: toStartView(attempt, req.quiz, questions) });
};

export const submit = async (req, res) => {
  const attempt = await attemptService.submitQuiz(req.user, req.quiz, req.body.attemptId, req.body.answers);
  sendSuccess(res, { message: 'Quiz submitted successfully', data: toResultView(attempt, req.quiz) });
};

export const listMine = async (req, res) => {
  const attempts = await attemptService.listOwnAttempts(req.user, req.quiz._id);
  sendSuccess(res, { message: 'Attempts fetched successfully', data: attempts.map(toHistoryView) });
};

export const getOne = async (req, res) => {
  const attempt = await attemptService.getOwnAttempt(req.user, req.params.attemptId);
  sendSuccess(res, { message: 'Attempt fetched successfully', data: toAttemptDetailView(attempt) });
};