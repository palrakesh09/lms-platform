import { moduleController } from '../controllers/content.controller.js';
import { createNodeSchema, updateNodeSchema } from '../validators/content.validators.js';
import { createContentRoutes } from './createContentRoutes.js';
import { moduleTopicsRouter } from './topic.routes.js';

const { nested, router } = createContentRoutes({
  controller: moduleController,
  entity: 'module',
  parent: { entity: 'course', param: 'courseId' },
  createSchema: createNodeSchema,
  updateSchema: updateNodeSchema,
});

router.use('/:moduleId/topics', moduleTopicsRouter);

// GET|POST /api/courses/:courseId/modules (mounted by course.routes.js)
export const courseModulesRouter = nested;

// GET|PATCH|DELETE /api/modules/:id
export default router;