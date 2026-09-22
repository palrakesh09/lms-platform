import * as progressService from '../services/progress.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

// req.user.id is always the actor. No route here reads a student id from the body, query, or params.

export const myLearning = async (req, res) => {
  const data = await progressService.getMyLearning(req.user.id);
  sendSuccess(res, { message: 'My learning fetched successfully', data });
};

export const courseProgress = async (req, res) => {
  const data = await progressService.getCourseProgressSummary(req.user.id, req.content.node);
  sendSuccess(res, { message: 'Course progress fetched successfully', data });
};

export const conceptProgress = async (req, res) => {
  const data = await progressService.getConceptProgress(req.user.id, req.content.node._id);
  sendSuccess(res, { message: 'Concept progress fetched successfully', data });
};

export const markComplete = async (req, res) => {
  const data = await progressService.setConceptCompletion(req.user.id, req.content.node._id, req.content.course._id, true);
  sendSuccess(res, { message: 'Concept marked as complete', data });
};

export const markIncomplete = async (req, res) => {
  const data = await progressService.setConceptCompletion(req.user.id, req.content.node._id, req.content.course._id, false);
  sendSuccess(res, { message: 'Concept marked as incomplete', data });
};

export const updateAccess = async (req, res) => {
  const data = await progressService.recordAccess(req.user.id, req.content.node._id, req.body.conceptId, req.body.resourceId);
  sendSuccess(res, { message: 'Access recorded successfully', data });
};