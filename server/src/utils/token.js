import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isObjectIdString } from './objectId.js';

const ALGORITHM = 'HS256';

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

  if (!isObjectIdString(sub)) {
    throw new jwt.JsonWebTokenError('invalid subject');
  }
  return sub;
};