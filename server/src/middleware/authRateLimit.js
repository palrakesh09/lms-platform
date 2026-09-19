import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

const createLimiter = ({ windowMs, limit, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7', // RateLimit-* headers
    legacyHeaders: false,
    // Route through the central error handler so the response matches every other error.
    handler: (_req, _res, next) => next(new ApiError(429, 'Too many attempts. Please try again later.')),
  });

// Counts only failed attempts (status >= 400), so normal users are never throttled by their own logins.
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
});