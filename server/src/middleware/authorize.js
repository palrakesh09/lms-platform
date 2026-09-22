import { ROLES } from '../constants/lms.js';
import { authenticationRequiredError, forbiddenError } from '../utils/authErrors.js';

const VALID_ROLES = new Set(Object.values(ROLES));

// Usage: router.post('/x', authenticate, authorize('admin', 'mentor'), controller)
// Reads req.user.role, which authenticate loaded from MongoDB. Never reads the token, body or query.
export const authorize = (...allowedRoles) => {
  // A typo like authorize('admn') would silently lock everyone out (or worse, be copy-pasted).
  // Fail at startup, not on the first request.
  if (allowedRoles.length === 0 || !allowedRoles.every((role) => VALID_ROLES.has(role))) {
    throw new Error(`authorize() needs one or more of: ${[...VALID_ROLES].join(', ')}`);
  }

  const allowed = new Set(allowedRoles);

  return (req, _res, next) => {
    // Fail closed if a route forgot `authenticate`.
    if (!req.user) {
      return next(authenticationRequiredError());
    }
    if (!allowed.has(req.user.role)) {
      return next(forbiddenError());
    }
    return next();
  };
};