import { ApiError } from './ApiError.js';

// Single source for the two messages the API returns for authorization problems.
export const authenticationRequiredError = () => new ApiError(401, 'Authentication required');

export const forbiddenError = () =>
  new ApiError(403, 'You do not have permission to perform this action');