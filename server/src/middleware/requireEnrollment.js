import { ROLES } from '../constants/lms.js';
import { loadContentChain } from '../services/contentAccess.service.js';
import { loadQuizContext } from '../services/quizAccess.service.js';
import { isEnrolledOrThrow, touchLastAccessed } from '../services/enrollment.service.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticationRequiredError } from '../utils/authErrors.js';
import { isObjectIdString } from '../utils/objectId.js';

// Runs AFTER requireCourseAccess('read', ...) or requireQuizAccess('read', ...) on a route, so the
// entity itself has already been verified to exist and to be readable by this role. This middleware
// ONLY adds the enrollment gate for students. Admin and mentor requests are untouched — they never
// call isEnrolledOrThrow, so nothing here can ever block staff.
//
//   source: 'content'  -> resolve the course from req.content.course (set by requireCourseAccess)
//   source: 'quiz'     -> resolve the course from req.quiz.course (set by requireQuizAccess)
//   source: 'param'    -> resolve the course directly from req.params[param] (e.g. /courses/:courseId/structure)
export const requireEnrollment = ({ source = 'content', param = 'courseId' } = {}) => {
  return async (req, _res, next) => {
    if (!req.user) throw authenticationRequiredError();
    if (req.user.role !== ROLES.STUDENT) return next(); // admin/mentor: no enrollment gate at all

    let courseId;
    if (source === 'content') courseId = req.content?.course?._id;
    else if (source === 'quiz') courseId = req.quiz?.course;
    else {
      const raw = req.params[param];
      if (!isObjectIdString(raw)) throw new ApiError(400, `Invalid ${param}`);
      courseId = raw;
    }

    if (!courseId) throw new ApiError(500, 'Enrollment check could not resolve a course');

    await isEnrolledOrThrow(req.user.id, courseId);
    touchLastAccessed(req.user.id, courseId).catch(() => {}); // best-effort, never blocks the request
    next();
  };
};