import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Future feature routers are mounted here, one line each, for example:
// router.use('/users', userRoutes);
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/topics', topicRoutes);
// router.use('/concepts', conceptRoutes);
// router.use('/resources', resourceRoutes);

export default router;