import { ApiError } from '../utils/ApiError.js';
import { isObjectIdString } from '../utils/objectId.js';

// 400 for a malformed :param before any query runs.
export const validateObjectId = (param) => (req, _res, next) => {
  if (!isObjectIdString(req.params[param])) {
    return next(new ApiError(400, `Invalid ${param}`));
  }
  return next();
};