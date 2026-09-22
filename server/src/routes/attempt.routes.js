import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as attemptController from '../controllers/quizAttempt.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();
// Self-service only: getOwnAttempt already checks ownership, but the role gate stops staff from
// even reaching this route — there is no admin/mentor attempt-inspection feature in this phase.
router.use(authenticate, noStore, authorize(ROLES.STUDENT));

router.get('/:attemptId', validateObjectId('attemptId'), attemptController.getOne);

export default router;