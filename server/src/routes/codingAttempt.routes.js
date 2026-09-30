// routes/codingAttempt.routes.js — direct attempt lookup, self-service only (mirrors Phase 9's attempt.routes.js)
import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as attemptController from '../controllers/codingAttempt.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();
router.use(authenticate, noStore, authorize(ROLES.STUDENT));
router.get('/:attemptId', validateObjectId('attemptId'), attemptController.getOne);
export default router;