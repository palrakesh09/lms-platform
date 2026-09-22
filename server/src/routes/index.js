import { Router } from 'express';
import { env } from '../config/env.js';
import adminRoutes from './admin.routes.js';
import attemptRoutes from './attempt.routes.js';
import authRoutes from './auth.routes.js';
import conceptRoutes from './concept.routes.js';
import courseRoutes from './course.routes.js';
import healthRoutes from './health.routes.js';
import moduleRoutes from './module.routes.js';
import progressRoutes from './progress.routes.js';
import questionRoutes from './question.routes.js';
import quizRoutes from './quiz.routes.js';
import rbacCheckRoutes from './rbacCheck.routes.js';
import resourceRoutes from './resource.routes.js';
import topicRoutes from './topic.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

router.use('/courses', courseRoutes); // also serves /courses/:id/mentors, /structure and /:courseId/modules
router.use('/modules', moduleRoutes); // also serves /modules/:moduleId/topics
router.use('/topics', topicRoutes); // also serves /topics/:topicId/concepts
router.use('/concepts', conceptRoutes); // also serves /concepts/:conceptId/resources and /quizzes
router.use('/resources', resourceRoutes);

router.use('/quizzes', quizRoutes); // also serves /:quizId/questions, /start, /submit, /attempts
router.use('/questions', questionRoutes);
router.use('/attempts', attemptRoutes);

router.use('/progress', progressRoutes); // student-only

router.use('/users', userRoutes); // admin-only
router.use('/admin', adminRoutes); // admin-only

if (!env.isProduction) {
  router.use('/rbac-check', rbacCheckRoutes);
}

export default router;