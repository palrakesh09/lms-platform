import * as enrollmentService from '../services/enrollment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toAdminEnrollment, toEnrollment } from '../utils/enrollmentSerializers.js';
import * as events from '../services/notification.events.js';

export const enroll = async (req, res) => {
  const enrollment = await enrollmentService.enrollStudent(req.user.id, req.body.courseId);
  await events.courseEnrolled(req.user.id, enrollment);
  sendSuccess(res, { statusCode: 201, message: 'Enrolled successfully', data: { enrollment: toEnrollment(enrollment) } });
};

export const my = async (req, res) => {
  const enrollments = await enrollmentService.listMyEnrollments(req.user.id);
  sendSuccess(res, { message: 'Enrollments fetched successfully', data: enrollments.map(toEnrollment) });
};

export const status = async (req, res) => {
  const enrollment = await enrollmentService.getEnrollment(req.user.id, req.params.courseId);
  sendSuccess(res, { message: 'Enrollment status fetched successfully', data: enrollment ? toEnrollment(enrollment) : null });
};

export const cancel = async (req, res) => {
  const enrollment = await enrollmentService.cancelEnrollment(req.user.id, req.params.courseId);
  sendSuccess(res, { message: 'Enrollment cancelled', data: toEnrollment(enrollment) });
};

export const adminList = async (req, res) => {
  const { items, pagination } = await enrollmentService.listAdminEnrollments(req.validatedQuery);
  sendSuccess(res, { message: 'Enrollments fetched successfully', data: items.map(toAdminEnrollment), pagination });
};

export const adminCancel = async (req, res) => {
  const enrollment = await enrollmentService.adminCancelEnrollment(req.params.id);
  sendSuccess(res, { message: 'Enrollment cancelled', data: toAdminEnrollment(enrollment) });
};