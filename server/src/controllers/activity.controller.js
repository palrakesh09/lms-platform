// server/src/controllers/activity.controller.js
import { ANALYTICS_RANGES } from '../constants/analytics.js';
import * as service from '../services/activity.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toActivity } from '../utils/notificationSerializers.js';

export const my = async (req, res) => {
  const { items, pagination } = await service.listOwnActivity(req.user.id, req.validatedQuery);
  sendSuccess(res, { message: 'Activity fetched successfully', data: items.map(toActivity), pagination });
};

// requireCourseAccess('manage') already proved: admin, or the mentor assigned to this course.
export const courseSummary = async (req, res) => {
  const { range } = req.validatedQuery;
  const summary = await service.getCourseActivitySummary(req.content.course._id, ANALYTICS_RANGES[range]);
  sendSuccess(res, { message: 'Course activity fetched successfully', data: { range, ...summary } });
};