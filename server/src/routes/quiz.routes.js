import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as attemptController from '../controllers/quizAttempt.controller.js';
import * as questionController from '../controllers/question.controller.js';
import * as quizController from '../controllers/quiz.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireQuizAccess } from '../middleware/requireQuizAccess.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createQuestionSchema, listQuizzesQuerySchema, submitQuizSchema, updateQuizSchema } from '../validators/quiz.validators.js';

const { ADMIN, MENTOR, STUDENT } = ROLES;

const router = Router();
router.use(authenticate, noStore);

const access = (action) => requireQuizAccess(action, { param: 'id' });
const quizAccess = (action) => requireQuizAccess(action, { param: 'quizId' });

router.get('/', validateQuery(listQuizzesQuerySchema), quizController.list);
router.get('/:id', access('read'), quizController.get);
router.patch('/:id', authorize(ADMIN, MENTOR), access('manage'), validate(updateQuizSchema), quizController.update);
router.delete('/:id', authorize(ADMIN, MENTOR), access('manage'), quizController.remove);
// Publishing/archiving is admin-only, matching Course.
router.patch('/:id/publish', authorize(ADMIN), access('manage'), quizController.publish);
router.patch('/:id/archive', authorize(ADMIN), access('manage'), quizController.archive);

router.get('/:quizId/questions', quizAccess('read'), questionController.listByQuiz);
router.post('/:quizId/questions', authorize(ADMIN, MENTOR), quizAccess('manage'), validate(createQuestionSchema), questionController.create);

// Attempts are student-only, and self-service only.
router.post('/:quizId/start', authorize(STUDENT), quizAccess('read'), attemptController.start);
router.post('/:quizId/submit', authorize(STUDENT), quizAccess('read'), validate(submitQuizSchema), attemptController.submit);
router.get('/:quizId/attempts', authorize(STUDENT), quizAccess('read'), attemptController.listMine);

export default router;