import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../validators/user.validators.js';

const router = Router();

// Every user-management route is admin-only. There is no self-service variant of any of them.
router.use(authenticate, noStore, authorize(ROLES.ADMIN));

router.get('/', validateQuery(listUsersQuerySchema), userController.list);
router.get('/:id', validateObjectId('id'), userController.get);
router.patch('/:id/status', validateObjectId('id'), validate(updateUserStatusSchema), userController.updateStatus);
router.patch('/:id/role', validateObjectId('id'), validate(updateUserRoleSchema), userController.updateRole);

export default router;