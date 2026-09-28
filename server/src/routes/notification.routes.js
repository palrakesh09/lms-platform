// server/src/routes/notification.routes.js
import { Router } from 'express';
import * as ctl from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { noStore } from '../middleware/noStore.js';
import { validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { listNotificationsQuerySchema } from '../validators/notification.validators.js';

const router = Router();
router.use(authenticate, noStore); // every role has its own notifications; ownership is enforced in the queries

router.get('/', validateQuery(listNotificationsQuerySchema), ctl.list);
router.get('/unread-count', ctl.unreadCount);
router.patch('/read-all', ctl.markAllRead);
router.patch('/:id/read', validateObjectId('id'), ctl.markRead);
router.delete('/:id', validateObjectId('id'), ctl.remove);

export default router;