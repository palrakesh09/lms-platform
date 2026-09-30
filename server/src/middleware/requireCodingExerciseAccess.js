import CodingExercise from '../models/CodingExercise.js';
import { canManageQuiz as canManageExercise, canReadQuiz as canReadExercise } from '../policies/quizAccess.js'; // same policy shape works verbatim: quiz vs exercise differ only in the model queried
import { loadExerciseContext } from '../services/codingExerciseAccess.service.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticationRequiredError, forbiddenError } from '../utils/authErrors.js';
import { notFoundError } from '../utils/contentErrors.js';
import { isObjectIdString } from '../utils/objectId.js';

const ACTIONS = {
  read: { isAllowed: canReadExercise, denied: notFoundError },
  manage: { isAllowed: (user, _ex, context) => canManageExercise(user, context), denied: forbiddenError },
};

export const requireCodingExerciseAccess = (action, { param = 'id' } = {}) => async (req, _res, next) => {
  if (!req.user) throw authenticationRequiredError();
  const targetId = req.params[param];
  if (!isObjectIdString(targetId)) throw new ApiError(400, `Invalid ${param}`);

  const exercise = await CodingExercise.findById(targetId);
  if (!exercise) throw notFoundError();

  const context = await loadExerciseContext(exercise);
  if (!context) throw notFoundError();

  const rule = ACTIONS[action];
  if (!rule.isAllowed(req.user, exercise, context)) throw rule.denied();

  req.exercise = exercise;
  req.exerciseContext = context;
  next();
};