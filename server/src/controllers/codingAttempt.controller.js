// controllers/codingAttempt.controller.js
import * as service from '../services/codingAttempt.service.js';
import * as exerciseService from '../services/codingExercise.service.js';
import { toAttempt, toAttemptSummary } from '../utils/codingExerciseSerializers.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { conceptCodingStarted } from '../services/notification.events.js';

// "Start" is implicit here: the client fetches the exercise (already authorized) and the first
// Run/Submit call is what actually creates an attempt row. This endpoint issues the FULL exercise
// including hidden test CODE, scoped to the sandbox only — it is the one time hidden tests leave the
// server, and only to a student already authorized (enrolled) for this exact exercise.
export const getForPlay = async (req, res) => {
  const exercise = await exerciseService.loadWithTests(req.exercise._id);
  await conceptCodingStarted(req.user.id, exercise);
  sendSuccess(res, { data: { ...(await import('../utils/codingExerciseSerializers.js')).toManagementExercise(exercise, req.user), testCases: exercise.testCases.map((t) => ({ id: String(t._id), name: t.name, hidden: t.hidden, code: t.code })) } });
};

export const submit = async (req, res) => sendSuccess(res, { data: toAttempt(await service.submitAttempt(req.user, req.exercise, req.body)) });
export const listMine = async (req, res) => sendSuccess(res, { data: (await service.listOwnAttempts(req.user, req.exercise._id)).map(toAttemptSummary) });
export const getOne = async (req, res) => sendSuccess(res, { data: toAttempt(await service.getOwnAttempt(req.user, req.params.attemptId)) });