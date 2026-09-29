import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Coarse, per-IP defense in depth. The real per-user daily cap is enforced in aiUsage.service.js
// against the database, which survives restarts and works across multiple server instances.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.aiRateLimitPerMinute,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  handler: (_req, _res, next) => next(new ApiError(429, 'Too many AI requests. Please slow down.')),
});