import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { noStore } from '../middleware/noStore.js';
import { searchLimiter } from '../middleware/searchRateLimit.js';
import { validateQuery } from '../middleware/validate.js';
import { globalSearchQuerySchema } from '../validators/search.validator.js';

const router = Router();

// Any authenticated role may search; WHAT they find is decided by resolveScope() in the service.
router.use(authenticate, noStore, searchLimiter);
router.get('/', validateQuery(globalSearchQuerySchema), searchController.global);

export default router;