import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as courseController from '../controllers/course.controller.js';
import * as courseMentorsController from '../controllers/courseMentors.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validate, validateByRole, validateQuery } from '../middleware/validate.js';
import {
  adminUpdateCourseSchema,
  createCourseSchema,
  listCoursesQuerySchema,
  mentorUpdateCourseSchema,
  setMentorsSchema,
} from '../validators/course.validators.js';
import { courseModulesRouter } from './module.routes.js';

const { ADMIN, MENTOR } = ROLES;

const router = Router();

router.use(authenticate, noStore); // everything below is authenticated, including the mounted module router

const access = (action) => requireCourseAccess(action, { param: 'id' });

// The list is scoped by role inside the service: students see published courses, mentors their own, admins all.
router.get('/', validateQuery(listCoursesQuerySchema), courseController.list);

router.post('/', authorize(ADMIN), validate(createCourseSchema), courseController.create);

router.get('/:id', access('read'), courseController.get);

// Mentors may edit descriptive fields of a course they instruct. Admins may edit everything except status.
router.patch(
  '/:id',
  authorize(ADMIN, MENTOR),
  access('manage'),
  validateByRole({ [ADMIN]: adminUpdateCourseSchema, [MENTOR]: mentorUpdateCourseSchema }),
  courseController.update,
);

router.delete('/:id', authorize(ADMIN), access('manage'), courseController.remove);

// Publishing and archiving are explicit, admin-only operations.
router.patch('/:id/publish', authorize(ADMIN), access('manage'), courseController.publish);
router.patch('/:id/archive', authorize(ADMIN), access('manage'), courseController.archive);

// Mentor assignment is admin-only. A mentor can never assign themselves or anyone else.
router.get('/:id/mentors', authorize(ADMIN), access('manage'), courseMentorsController.list);
router.patch(
  '/:id/mentors',
  authorize(ADMIN),
  access('manage'),
  validate(setMentorsSchema),
  courseMentorsController.replace,
);

router.get('/:courseId/structure', requireCourseAccess('read', { param: 'courseId' }), courseController.structure);

router.use('/:courseId/modules', courseModulesRouter);

export default router;