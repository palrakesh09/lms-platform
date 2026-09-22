import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as questionController from '../controllers/question.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireQuizAccess } from '../middleware/requireQuizAccess.js';
import { validate } from '../middleware/validate.js';
import { updateQuestionSchema } from '../validators/quiz.validators.js';

const { ADMIN, MENTOR } = ROLES;
const router = Router();
router.use(authenticate, noStore);

const access = (action) => requireQuizAccess(action, { param: 'id', via: 'question' });

router.get('/:id', access('read'), questionController.get);
router.patch('/:id', authorize(ADMIN, MENTOR), access('manage'), validate(updateQuestionSchema), questionController.update);
router.delete('/:id', authorize(ADMIN, MENTOR), access('manage'), questionController.remove);

export default router;