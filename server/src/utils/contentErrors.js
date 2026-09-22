import { ApiError } from './ApiError.js';

export const notFoundError = () => new ApiError(404, 'Resource not found');