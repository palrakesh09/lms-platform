import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { sendSuccess } from '../utils/apiResponse.js';

// DEVELOPMENT/TEST ONLY. Mounted in routes/index.js only when NODE_ENV is not "production".
// These probe routes exist so the RBAC middleware can be exercised before real CRUD exists.
// They show the exact middleware chains the real routes will use. They change no data.
// Delete this file (and its mount) once the content routes use the same middleware.

const { ADMIN, MENTOR, STUDENT } = ROLES;

const allowed = (req, res) =>
  sendSuccess(res, { message: 'Allowed', data: { role: req.user.role } });

const router = Router();

router.use(authenticate);

router.get('/whoami', (req, res) => sendSuccess(res, { data: { user: req.user } }));

// Role gates only
router.get('/admin-only', authorize(ADMIN), allowed);
router.get('/mentor-area', authorize(ADMIN, MENTOR), allowed);
router.get('/student-area', authorize(STUDENT), allowed);

// Reads: any authenticated role, narrowed by the course policy
router.get('/courses/:courseId/read', requireCourseAccess('read'), allowed);

// Writes: role gate first, then course ownership for mentors
router.post('/courses/:courseId/write', authorize(ADMIN, MENTOR), requireCourseAccess('manage'), allowed);
router.delete('/courses/:courseId', authorize(ADMIN), allowed); // courses are admin-only

router.post(
  '/modules/:moduleId/topics', // create pattern: guard the parent from the URL
  authorize(ADMIN, MENTOR),
  requireCourseAccess('manage', { entity: 'module', param: 'moduleId' }),
  allowed,
);
router.put(
  '/topics/:topicId',
  authorize(ADMIN, MENTOR),
  requireCourseAccess('manage', { entity: 'topic', param: 'topicId' }),
  allowed,
);
router.delete(
  '/resources/:resourceId',
  authorize(ADMIN, MENTOR),
  requireCourseAccess('manage', { entity: 'resource', param: 'resourceId' }),
  allowed,
);

export default router;