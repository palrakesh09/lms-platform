// controllers/codingExercise.controller.js
import * as service from '../services/codingExercise.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toExercise, toManagementExercise } from '../utils/codingExerciseSerializers.js';
import { isStaff } from '../policies/courseAccess.js';

const serialize = (ex, user) => (isStaff(user) ? toManagementExercise(ex, user) : toExercise(ex, user));

export const listByConcept = async (req, res) => sendSuccess(res, { data: (await service.listByConcept(req.content.node._id, req.user)).map((e) => serialize(e, req.user)) });
export const get = (req, res) => sendSuccess(res, { data: serialize(req.exercise, req.user) });
export const create = async (req, res) => sendSuccess(res, { statusCode: 201, data: toManagementExercise(await service.create(req.content.node._id, req.content.course._id, req.body, req.user), req.user) });
export const update = async (req, res) => sendSuccess(res, { data: toManagementExercise(await service.update(req.exercise._id, req.body, req.user), req.user) });
export const publish = async (req, res) => sendSuccess(res, { data: toManagementExercise(await service.setStatus(req.exercise._id, 'published', req.user), req.user) });
export const archive = async (req, res) => sendSuccess(res, { data: toManagementExercise(await service.setStatus(req.exercise._id, 'archived', req.user), req.user) });
export const remove = async (req, res) => { await service.remove(req.exercise._id); sendSuccess(res, { message: 'Exercise deleted' }); };