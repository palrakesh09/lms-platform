import { topicController } from '../controllers/content.controller.js';
import { createNodeSchema, updateNodeSchema } from '../validators/content.validators.js';
import { topicConceptsRouter } from './concept.routes.js';
import { createContentRoutes } from './createContentRoutes.js';

const { nested, router } = createContentRoutes({
  controller: topicController,
  entity: 'topic',
  parent: { entity: 'module', param: 'moduleId' },
  createSchema: createNodeSchema,
  updateSchema: updateNodeSchema,
});

router.use('/:topicId/concepts', topicConceptsRouter);

// GET|POST /api/modules/:moduleId/topics (mounted by module.routes.js)
export const moduleTopicsRouter = nested;

// GET|PATCH|DELETE /api/topics/:id
export default router;