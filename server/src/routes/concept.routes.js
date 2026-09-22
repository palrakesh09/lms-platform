import { conceptController } from '../controllers/content.controller.js';
import { createNodeSchema, updateNodeSchema } from '../validators/content.validators.js';
import conceptQuizzesRouter from './conceptQuizzes.routes.js';
import { createContentRoutes } from './createContentRoutes.js';
import { conceptResourcesRouter } from './resource.routes.js';

const { nested, router } = createContentRoutes({
  controller: conceptController,
  entity: 'concept',
  parent: { entity: 'topic', param: 'topicId' },
  createSchema: createNodeSchema,
  updateSchema: updateNodeSchema,
});

// Mounted after the factory's `authenticate`, so both are authenticated.
router.use('/:conceptId/resources', conceptResourcesRouter);
router.use('/:conceptId/quizzes', conceptQuizzesRouter);

// GET|POST /api/topics/:topicId/concepts (mounted by topic.routes.js)
export const topicConceptsRouter = nested;

// GET|PATCH|DELETE /api/concepts/:id
export default router;