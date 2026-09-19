import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../config/authCookie.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toSafeUser } from '../utils/toSafeUser.js';

export const register = async (req, res) => {
  const user = await authService.registerUser(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: { user: toSafeUser(user) },
  });
};

export const login = async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  // The token travels only in the httpOnly cookie, never in the response body.
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

  sendSuccess(res, {
    message: 'Logged in successfully',
    data: { user: toSafeUser(user) },
  });
};

export const logout = (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  sendSuccess(res, { message: 'Logged out successfully' });
};

// `authenticate` already loaded fresh user data from MongoDB into req.user.
export const getMe = (req, res) => {
  sendSuccess(res, { data: { user: req.user } });
};