import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as progressController from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validate } from '../middleware/validate.js';
import { accessBodySchema } from '../validators/progress.validators.js';

const router = Router();

// Progress is a personal, student-only feature: authorize(STUDENT) before anything else, so admins and
// mentors never reach a progress route at all, regardless of course ownership.
router.use(authenticate, noStore, authorize(ROLES.STUDENT));

router.get('/my-learning', progressController.myLearning);

// requireCourseAccess('read') is the same policy the learning pages use: published-only for students.
router.get('/course/:courseId', requireCourseAccess('read', { param: 'courseId' }), progressController.courseProgress);
router.patch(
  '/course/:courseId/access',
  requireCourseAccess('read', { param: 'courseId' }),
  validate(accessBodySchema),
  progressController.updateAccess,
);

router.get(
  '/concept/:conceptId',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  progressController.conceptProgress,
);
router.patch(
  '/concept/:conceptId/complete',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  progressController.markComplete,
);
router.patch(
  '/concept/:conceptId/incomplete',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  progressController.markIncomplete,
);

export default router;