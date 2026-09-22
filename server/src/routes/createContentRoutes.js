import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validate, validateQuery } from '../middleware/validate.js';

const { ADMIN, MENTOR } = ROLES;

// Builds the two routers every content level needs.
//
//   nested  list + create under the parent:   GET|POST /<parents>/:parentId/<children>
//           The parent route file mounts it. It inherits that router's `authenticate` (mounted first),
//           and fails closed anyway: authorize and requireCourseAccess both answer 401 without req.user.
//   router  item routes:                       GET|PATCH|DELETE /<children>/:id
//
// Middleware order is deliberate: authorize (role) → requireCourseAccess (ownership) → validate (body).
// Unauthorized callers never see validation errors, and students never trigger a content lookup on writes.
//
//   parent  { entity, param } of the parent the URL supplies, e.g. { entity: 'module', param: 'moduleId' }
export const createContentRoutes = ({ controller, entity, parent, createSchema, updateSchema, listQuerySchema }) => {
  const nested = Router({ mergeParams: true });
  const listValidators = listQuerySchema ? [validateQuery(listQuerySchema)] : [];

  nested.get('/', requireCourseAccess('read', parent), ...listValidators, controller.listByParent);
  nested.post(
    '/',
    authorize(ADMIN, MENTOR),
    requireCourseAccess('manage', parent),
    validate(createSchema),
    controller.create,
  );

  const router = Router();
  router.use(authenticate, noStore);

  const access = (action) => requireCourseAccess(action, { entity, param: 'id' });

  router.get('/:id', access('read'), controller.get);
  router.patch('/:id', authorize(ADMIN, MENTOR), access('manage'), validate(updateSchema), controller.update);
  router.delete('/:id', authorize(ADMIN, MENTOR), access('manage'), controller.remove);

  return { nested, router };
};