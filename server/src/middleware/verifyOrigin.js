import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// CSRF defense in depth. Browsers always send an Origin header on cross-origin state-changing
// requests, so a forged request from another site is rejected even if it carries our cookie.
// Requests without an Origin (curl, Postman, server-to-server) are not browser CSRF vectors and pass.
export const verifyOrigin = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const { origin } = req.headers;

  if (origin && !env.clientOrigins.includes(origin)) {
    return next(new ApiError(403, 'Request origin is not allowed'));
  }

  return next();
};