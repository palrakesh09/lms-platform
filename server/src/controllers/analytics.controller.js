import { CONTENT_STATUS } from '../constants/lms.js';
import { ANALYTICS_RANGES } from '../constants/analytics.js';
import Course from '../models/Course.js';
import * as analyticsService from '../services/analytics.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { notFoundError } from '../utils/contentErrors.js';

export const adminOverview = async (_req, res) => sendSuccess(res, { message: 'Admin analytics overview fetched successfully', data: await analyticsService.getAdminOverview() });

export const adminCourses = async (req, res) => {
  const { items, pagination } = await analyticsService.getAdminCourseAnalytics(req.validatedQuery);
  sendSuccess(res, { message: 'Course analytics fetched successfully', data: items, pagination });
};

export const adminActivity = async (req, res) => {
  const days = ANALYTICS_RANGES[req.validatedQuery.range];
  sendSuccess(res, { message: 'Activity analytics fetched successfully', data: { range: req.validatedQuery.range, series: await analyticsService.getActivitySeries({ days }) } });
};

export const mentorOverview = async (req, res) => sendSuccess(res, { message: 'Mentor analytics overview fetched successfully', data: await analyticsService.getMentorOverview(req.user.id) });

export const mentorCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId).lean();
  analyticsService.assertMentorOwnsCourse(req.user, course);
  sendSuccess(res, { message: 'Course analytics fetched successfully', data: await analyticsService.getMentorCourseAnalytics(course) });
};

export const mentorActivity = async (req, res) => {
  const courseIds = await analyticsService.getMentorCourseIds(req.user.id);
  const days = ANALYTICS_RANGES[req.validatedQuery.range];
  sendSuccess(res, { message: 'Activity analytics fetched successfully', data: { range: req.validatedQuery.range, series: courseIds.length ? await analyticsService.getActivitySeries({ courseIds, days }) : [] } });
};

export const studentOverview = async (req, res) => sendSuccess(res, { message: 'Performance overview fetched successfully', data: await analyticsService.getStudentOverview(req.user.id) });
export const studentCourses = async (req, res) => sendSuccess(res, { message: 'Course performance fetched successfully', data: await analyticsService.getStudentCoursePerformance(req.user.id) });
export const studentQuizzes = async (req, res) => sendSuccess(res, { message: 'Quiz performance fetched successfully', data: await analyticsService.getStudentQuizPerformance(req.user.id) });
export const studentActivity = async (req, res) => {
  const days = ANALYTICS_RANGES[req.validatedQuery.range];
  sendSuccess(res, { message: 'Activity analytics fetched successfully', data: { range: req.validatedQuery.range, series: await analyticsService.getStudentActivitySeries(req.user.id, days) } });
};