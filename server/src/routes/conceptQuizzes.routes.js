import { Router } from 'express';
import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import * as quizController from '../controllers/quiz.controller.js';
import { authorize } from '../middleware/authorize.js';
import { requireCourseAccess } from '../middleware/requireCourseAccess.js';
import { validate } from '../middleware/validate.js';
import { ORDER_SORT } from '../constants/listing.js';
import Quiz from '../models/Quiz.js';
import { isStaff } from '../policies/courseAccess.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toQuiz } from '../utils/quizSerializers.js';
import { createQuizSchema } from '../validators/quiz.validators.js';

const { ADMIN, MENTOR } = ROLES;
const router = Router({ mergeParams: true });

// GET/POST /concepts/:conceptId/quizzes — reuses the SAME requireCourseAccess middleware every other
// concept-scoped resource uses (Phase 5): a concept-attached quiz's access rule is identical to a
// resource's. This is why creating a quiz needs no new middleware at all.
router.get('/', requireCourseAccess('read', { entity: 'concept', param: 'conceptId' }), async (req, res) => {
  const filter = { attachmentLevel: 'concept', attachmentId: req.content.node._id };
  if (!isStaff(req.user)) filter.status = CONTENT_STATUS.PUBLISHED;

  const quizzes = await Quiz.find(filter).sort({ ...ORDER_SORT }).lean();
  sendSuccess(res, { message: 'Quizzes fetched successfully', data: quizzes.map((quiz) => toQuiz(quiz, req.user)) });
});

router.post(
  '/',
  authorize(ADMIN, MENTOR),
  requireCourseAccess('manage', { entity: 'concept', param: 'conceptId' }),
  validate(createQuizSchema),
  quizController.create,
);

export default router;