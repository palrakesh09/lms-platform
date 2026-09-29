import { Router } from 'express';
import { ROLES } from '../constants/lms.js';
import * as aiController from '../controllers/ai.controller.js';
import * as aiAdminController from '../controllers/aiAdmin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { requireAiEnabled } from '../middleware/requireAiEnabled.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  chatSchema, explainSchema, hintSchema, listConversationsQuerySchema,
  practiceSchema, updateAiSettingsSchema, usageQuerySchema,
} from '../validators/ai.validators.js';

const router = Router();
router.use(authenticate, noStore);

router.get('/status', aiController.status); // any authenticated role; drives whether the UI shows the launcher

router.post('/chat', requireAiEnabled, aiRateLimiter, validate(chatSchema), aiController.chat);
router.post('/explain', requireAiEnabled, aiRateLimiter, validate(explainSchema), aiController.explain);
router.post('/practice', requireAiEnabled, aiRateLimiter, validate(practiceSchema), aiController.practice);
router.post('/hint', requireAiEnabled, aiRateLimiter, validate(hintSchema), aiController.hint);

router.get('/conversations', validateQuery(listConversationsQuerySchema), aiController.listConversations);
router.get('/conversations/:id', validateObjectId('id'), aiController.getConversation);
router.delete('/conversations/:id', validateObjectId('id'), aiController.deleteConversation);

router.get('/admin/settings', authorize(ROLES.ADMIN), aiAdminController.getSettings);
router.patch('/admin/settings', authorize(ROLES.ADMIN), validate(updateAiSettingsSchema), aiAdminController.patchSettings);
router.get('/admin/usage', authorize(ROLES.ADMIN), validateQuery(usageQuerySchema), aiAdminController.getUsage);

export default router;