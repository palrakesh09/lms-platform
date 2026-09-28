// server/src/routes/activity.routes.js
import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as ctl from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validateQuery } from '../middleware/validate.js';
import { activityQuerySchema } from '../validators/analytics.validators.js';
import { myActivityQuerySchema } from '../validators/activity.validators.js';

const router = Router();
router.use(authenticate, noStore);

router.get('/my', authorize(ROLES.STUDENT), validateQuery(myActivityQuerySchema), ctl.my);
// Staff: aggregate counts for a course they manage. No per-student data.
router.get('/course/:courseId', authorize(ROLES.ADMIN, ROLES.MENTOR), requireCourseAccess('manage', { param: 'courseId' }), validateQuery(activityQuerySchema), ctl.courseSummary);

export default router;