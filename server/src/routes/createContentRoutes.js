import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { requireEnrollment } from '../middleware/requireEnrollment.js';
import { validate, validateQuery } from '../middleware/validate.js';

const { ADMIN, MENTOR } = ROLES;

// requireEnrollment is a no-op for admin/mentor (see its own file) and enforces enrollment for students
// only. Added here — rather than per entity — closes it for modules, topics, concepts AND resources at
// once: exactly what Phase 11 §5/§14 describe ("a concept from Course B", "a resourceId") but which the
// original Phase 11 change missed for this shared factory.
export const createContentRoutes = ({ controller, entity, parent, createSchema, updateSchema, listQuerySchema }) => {
  const nested = Router({ mergeParams: true });
  const listValidators = listQuerySchema ? [validateQuery(listQuerySchema)] : [];

  nested.get('/', requireCourseAccess('read', parent), requireEnrollment(), ...listValidators, controller.listByParent);
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

  router.get('/:id', access('read'), requireEnrollment(), controller.get);
  router.patch('/:id', authorize(ADMIN, MENTOR), access('manage'), validate(updateSchema), controller.update);
  router.delete('/:id', authorize(ADMIN, MENTOR), access('manage'), controller.remove);

  return { nested, router };
};