import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Search fans out to several aggregations, so it gets its own per-IP ceiling. Skipped under test.
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  handler: (_req, _res, next) => next(new ApiError(429, 'Too many searches. Please slow down.')),
});