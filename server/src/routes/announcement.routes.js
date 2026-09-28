// server/src/routes/announcement.routes.js
import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as ctl from '../controllers/announcement.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { createAnnouncementSchema, listAnnouncementsQuerySchema, updateAnnouncementSchema } from '../validators/announcement.validators.js';

const { ADMIN, MENTOR } = ROLES;
const router = Router();
router.use(authenticate, noStore);

// Reads are role-scoped in the service; writes are staff-only here and ownership-checked in the service.
router.get('/', validateQuery(listAnnouncementsQuerySchema), ctl.list);
router.get('/:id', validateObjectId('id'), ctl.get);
router.post('/', authorize(ADMIN, MENTOR), validate(createAnnouncementSchema), ctl.create);
router.patch('/:id', authorize(ADMIN, MENTOR), validateObjectId('id'), validate(updateAnnouncementSchema), ctl.update);
router.delete('/:id', authorize(ADMIN, MENTOR), validateObjectId('id'), ctl.remove);
router.post('/:id/publish', authorize(ADMIN, MENTOR), validateObjectId('id'), ctl.publish);

export default router;