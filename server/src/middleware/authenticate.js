import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME, clearAuthCookieOptions } from '../config/authCookie.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { toSafeUser } from '../utils/toSafeUser.js';
import { verifyAccessToken } from '../utils/token.js';

// Drops the unusable cookie so the browser stops sending it, then builds the 401.
const reject = (res, message) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  return new ApiError(401, message);
};

// Express 5 forwards errors thrown in async middleware to the error handler.
export const authenticate = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let userId;
  try {
    userId = verifyAccessToken(token);
  } catch (error) {
    // TokenExpiredError extends JsonWebTokenError, so check it first.
    if (error instanceof jwt.TokenExpiredError) {
      throw reject(res, 'Session expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw reject(res, 'Invalid authentication token');
    }
    throw error; // unexpected: becomes a generic 500
  }

  // Loading the user on every request means deactivation and deletion take effect immediately.
  // The password hash is excluded by the schema (select: false).
  const user = await User.findById(userId);

  if (!user) {
    throw reject(res, 'Authentication required');
  }
  if (!user.isActive) {
    throw reject(res, 'This account is disabled');
  }

  req.user = toSafeUser(user);
  next();
};