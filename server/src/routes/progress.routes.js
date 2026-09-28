import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as progressController from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { requireEnrollment } from '../middleware/requireEnrollment.js';
import { validate } from '../middleware/validate.js';
import { accessBodySchema } from '../validators/progress.validators.js';

const router = Router();
router.use(authenticate, noStore, authorize(ROLES.STUDENT));

router.get('/my-learning', progressController.myLearning);

router.get('/course/:courseId', requireCourseAccess('read', { param: 'courseId' }), requireEnrollment(), progressController.courseProgress);
router.patch(
  '/course/:courseId/access',
  requireCourseAccess('read', { param: 'courseId' }),
  requireEnrollment(),
  validate(accessBodySchema),
  progressController.updateAccess,
);

router.get(
  '/concept/:conceptId',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  requireEnrollment(),
  progressController.conceptProgress,
);
router.patch(
  '/concept/:conceptId/complete',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  requireEnrollment(),
  progressController.markComplete,
);
router.patch(
  '/concept/:conceptId/incomplete',
  requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }),
  requireEnrollment(),
  progressController.markIncomplete,
);

export default router;