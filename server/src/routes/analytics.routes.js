import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { validateQuery } from '../middleware/validate.js';
import { activityQuerySchema, courseAnalyticsQuerySchema } from '../validators/analytics.validators.js';

const { ADMIN, MENTOR, STUDENT } = ROLES;
const router = Router();
router.use(authenticate, noStore);

router.get('/admin/overview', authorize(ADMIN), analyticsController.adminOverview);
router.get('/admin/courses', authorize(ADMIN), validateQuery(courseAnalyticsQuerySchema), analyticsController.adminCourses);
router.get('/admin/activity', authorize(ADMIN), validateQuery(activityQuerySchema), analyticsController.adminActivity);

router.get('/mentor/overview', authorize(MENTOR), analyticsController.mentorOverview);
router.get('/mentor/courses/:courseId', authorize(MENTOR), validateObjectId('courseId'), analyticsController.mentorCourse);
router.get('/mentor/activity', authorize(MENTOR), validateQuery(activityQuerySchema), analyticsController.mentorActivity);

// Student routes never accept a student id from anywhere but req.user.id (see the controller).
router.get('/student/overview', authorize(STUDENT), analyticsController.studentOverview);
router.get('/student/courses', authorize(STUDENT), analyticsController.studentCourses);
router.get('/student/quizzes', authorize(STUDENT), analyticsController.studentQuizzes);
router.get('/student/activity', authorize(STUDENT), validateQuery(activityQuerySchema), analyticsController.studentActivity);

export default router;