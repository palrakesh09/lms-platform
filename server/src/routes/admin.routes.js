import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';

const router = Router();

router.use(authenticate, noStore, authorize(ROLES.ADMIN));

router.get('/stats', adminController.stats);

export default router;