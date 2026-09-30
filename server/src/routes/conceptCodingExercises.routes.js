// routes/conceptCodingExercises.routes.js — creation, mounted under /concepts/:conceptId/coding-exercises
import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as exerciseController from '../controllers/codingExercise.controller.js';
import { authorize } from '../middleware/authorize.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validate } from '../middleware/validate.js';
import { createExerciseSchema } from '../validators/codingExercise.validators.js';

const router = Router({ mergeParams: true });
router.get('/', requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }), exerciseController.listByConcept);
router.post('/', authorize(ROLES.ADMIN, ROLES.MENTOR), requireCourseAccess('manage', { entity: 'concept', param: 'conceptId' }), validate(createExerciseSchema), exerciseController.create);
export default router;