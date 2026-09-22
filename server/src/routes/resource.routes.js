import { resourceController } from '../controllers/content.controller.js';
import {
  createResourceSchema,
  listResourcesQuerySchema,
  updateResourceSchema,
} from '../validators/content.validators.js';
import { createContentRoutes } from './createContentRoutes.js';

const { nested, router } = createContentRoutes({
  controller: resourceController,
  entity: 'resource',
  parent: { entity: 'concept', param: 'conceptId' },
  createSchema: createResourceSchema,
  updateSchema: updateResourceSchema,
  listQuerySchema: listResourcesQuerySchema,
});

// GET|POST /api/concepts/:conceptId/resources (mounted by concept.routes.js)
export const conceptResourcesRouter = nested;

// GET|PATCH|DELETE /api/resources/:id
export default router;