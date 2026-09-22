import { isStaff } from '../policies/courseAccess.js';
import * as questionService from '../services/question.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toManagementQuestion, toStudentQuestion } from '../utils/quizSerializers.js';

const serialize = (question, user) => (isStaff(user) ? toManagementQuestion(question, user) : toStudentQuestion(question));

export const listByQuiz = async (req, res) => {
  const questions = isStaff(req.user)
    ? await questionService.listQuestionsForManagement(req.quiz._id)
    : await questionService.listQuestions(req.quiz._id);

  sendSuccess(res, { message: 'Questions fetched successfully', data: questions.map((q) => serialize(q, req.user)) });
};

export const get = (req, res) => sendSuccess(res, { message: 'Question fetched successfully', data: serialize(req.questionDoc, req.user) });

export const create = async (req, res) => {
  const question = await questionService.createQuestion(req.quiz._id, req.body, req.user);
  sendSuccess(res, { statusCode: 201, message: 'Question created successfully', data: toManagementQuestion(question, req.user) });
};

export const update = async (req, res) => {
  const question = await questionService.updateQuestion(req.questionDoc._id, req.body, req.user);
  sendSuccess(res, { message: 'Question updated successfully', data: toManagementQuestion(question, req.user) });
};

export const remove = async (req, res) => {
  await questionService.deleteQuestion(req.questionDoc._id);
  sendSuccess(res, { message: 'Question deleted successfully' });
};