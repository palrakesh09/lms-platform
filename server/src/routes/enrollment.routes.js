import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { createEnrollmentSchema, listAdminEnrollmentsQuerySchema } from '../validators/enrollment.validators.js';

const { ADMIN, STUDENT } = ROLES;
const router = Router();
router.use(authenticate, noStore);

// Self-service only. Student identity is ALWAYS req.user.id — see enrollment.controller.js.
router.post('/', authorize(STUDENT), validate(createEnrollmentSchema), enrollmentController.enroll);
router.get('/my', authorize(STUDENT), enrollmentController.my);
router.get('/:courseId', authorize(STUDENT), validateObjectId('courseId'), enrollmentController.status);
router.delete('/:courseId', authorize(STUDENT), validateObjectId('courseId'), enrollmentController.cancel);

// Admin: read + cancel only. No admin-initiated create — see the Phase 11 write-up.
router.get('/admin/all', authorize(ADMIN), validateQuery(listAdminEnrollmentsQuerySchema), enrollmentController.adminList);
router.delete('/admin/:id', authorize(ADMIN), validateObjectId('id'), enrollmentController.adminCancel);

export default router;