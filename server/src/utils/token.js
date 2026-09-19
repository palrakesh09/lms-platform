import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Payload is only { sub, iat, exp }. No role, email or other user data.
export const signAccessToken = (userId) =>
  jwt.sign({}, env.jwtSecret, {
    algorithm: ALGORITHM,
    subject: String(userId),
    expiresIn: env.jwtExpiresInSeconds, // a number means seconds
  });

// Returns the user id. Throws a JsonWebTokenError (or subclass such as TokenExpiredError) if invalid.
export const verifyAccessToken = (token) => {
  const { sub } = jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });

  if (typeof sub !== 'string' || !OBJECT_ID_PATTERN.test(sub)) {
    throw new jwt.JsonWebTokenError('invalid subject');
  }
  return sub;
};