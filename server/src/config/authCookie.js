import { env } from './env.js';

export const AUTH_COOKIE_NAME = 'lms_token';

// Setting and clearing a cookie must use identical attributes, or browsers keep the old one.
const baseOptions = {
  httpOnly: true, // not readable by JavaScript
  secure: env.isProduction, // HTTPS only in production; plain http://localhost works in development
  sameSite: env.cookieSameSite,
  path: '/api', // only sent to API requests
};

export const authCookieOptions = Object.freeze({
  ...baseOptions,
  maxAge: env.jwtExpiresInSeconds * 1000, // milliseconds; always equal to the JWT lifetime
});

export const clearAuthCookieOptions = Object.freeze(baseOptions);