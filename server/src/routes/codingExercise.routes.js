// routes/codingExercise.routes.js
import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as exerciseController from '../controllers/codingExercise.controller.js';
import * as attemptController from '../controllers/codingAttempt.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCodingExerciseAccess } from '../middleware/requireCodingExerciseAccess.js';
import { requireEnrollment } from '../middleware/requireEnrollment.js';
import { validate } from '../middleware/validate.js';
import { createExerciseSchema, submitAttemptSchema, updateExerciseSchema } from '../validators/codingExercise.validators.js';

const { ADMIN, MENTOR, STUDENT } = ROLES;
const router = Router();
router.use(authenticate, noStore);

const access = (action) => requireCodingExerciseAccess(action);

router.get('/:id', access('read'), exerciseController.get);
router.patch('/:id', authorize(ADMIN, MENTOR), access('manage'), validate(updateExerciseSchema), exerciseController.update);
router.delete('/:id', authorize(ADMIN, MENTOR), access('manage'), exerciseController.remove);
router.patch('/:id/publish', authorize(ADMIN), access('manage'), exerciseController.publish);
router.patch('/:id/archive', authorize(ADMIN), access('manage'), exerciseController.archive);

router.get('/:id/play', authorize(STUDENT), access('read'), requireEnrollment({ source: 'content' }), attemptController.getForPlay);
router.post('/:id/attempts', authorize(STUDENT), access('read'), requireEnrollment({ source: 'content' }), validate(submitAttemptSchema), attemptController.submit);
router.get('/:id/attempts', authorize(STUDENT), access('read'), requireEnrollment({ source: 'content' }), attemptController.listMine);

export default router;