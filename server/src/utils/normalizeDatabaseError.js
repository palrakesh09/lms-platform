import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

const DATABASE_UNAVAILABLE_ERRORS = new Set([
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongooseServerSelectionError',
]);

// Converts known Mongoose/MongoDB errors into ApiErrors with safe messages and correct status codes.
// Anything unrecognized is returned unchanged and ends up as a generic 500.
export const normalizeDatabaseError = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
    return new ApiError(422, 'Validation failed', details);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for "${error.path}"`);
  }

  // E11000: a unique index rejected the write (e.g. two simultaneous registrations).
  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern ?? {});
    const details = fields.map((field) => ({ field, message: `${field} already exists` }));
    return new ApiError(409, 'A record with this value already exists', details);
  }

  if (DATABASE_UNAVAILABLE_ERRORS.has(error?.name)) {
    return new ApiError(503, 'Database is temporarily unavailable');
  }

  return error;
};