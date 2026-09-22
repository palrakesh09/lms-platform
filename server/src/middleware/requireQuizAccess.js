import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import { canManageQuiz, canReadQuiz } from '../policies/quizAccess.js';
import { loadQuizContext } from '../services/quizAccess.service.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticationRequiredError, forbiddenError } from '../utils/authErrors.js';
import { notFoundError } from '../utils/contentErrors.js';
import { isObjectIdString } from '../utils/objectId.js';

const ACTIONS = {
  read: { isAllowed: canReadQuiz, denied: notFoundError }, // a student can't tell draft from missing
  manage: { isAllowed: (user, _quiz, context) => canManageQuiz(user, context), denied: forbiddenError },
};

// Loads the quiz referenced by :param — directly, or (via: 'question') by loading a question first and
// following it to its quiz — and applies the same read/manage policy every quiz route needs.
// On success: req.quiz (the quiz doc) and, for via:'question', req.questionDoc (with correctAnswer
// selected; the serializer decides whether to expose it based on role, never this middleware).
export const requireQuizAccess = (action, { param = 'quizId', via } = {}) => {
  const rule = ACTIONS[action];

  return async (req, _res, next) => {
    if (!req.user) throw authenticationRequiredError();

    const targetId = req.params[param];
    if (!isObjectIdString(targetId)) throw new ApiError(400, `Invalid ${param}`);

    let quiz;
    if (via === 'question') {
      const question = await Question.findById(targetId).select('+correctAnswer');
      if (!question) throw notFoundError();
      quiz = await Quiz.findById(question.quiz);
      req.questionDoc = question;
    } else {
      quiz = await Quiz.findById(targetId);
    }
    if (!quiz) throw notFoundError();

    const context = await loadQuizContext(quiz);
    if (!context) throw notFoundError();

    if (!rule.isAllowed(req.user, quiz, context)) throw rule.denied();

    req.quiz = quiz;
    req.quizContext = context;
    next();
  };
};