import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizeDatabaseError } from '../utils/normalizeDatabaseError.js';

const ERROR_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
  503: 'SERVICE_UNAVAILABLE',
};

// Handles ApiError as well as errors from libraries (e.g. malformed JSON from express.json).
const resolveStatusCode = (error) => {
  const status = error.statusCode ?? error.status;
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
};

// Express identifies error handlers by their 4-argument signature.
export const errorHandler = (rawError, _req, res, next) => {
  if (res.headersSent) {
    return next(rawError);
  }

  const error = normalizeDatabaseError(rawError);
  const statusCode = resolveStatusCode(error);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error('[error]', rawError);
  }

  // ApiError messages are written by our own code and are safe to show.
  // Client errors (4xx) from libraries are meant for the caller.
  // Anything else at 5xx never leaks internals in production.
  const exposeMessage = error instanceof ApiError || !isServerError || !env.isProduction;

  const body = {
    success: false,
    error: {
      code: ERROR_CODES[statusCode] ?? (isServerError ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: exposeMessage ? error.message : 'Internal server error',
    },
  };

  if (exposeMessage && error.details) {
    body.error.details = error.details;
  }

  if (isServerError && !env.isProduction) {
    body.error.stack = error.stack;
  }

  return res.status(statusCode).json(body);
};