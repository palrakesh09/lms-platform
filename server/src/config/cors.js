import { env } from './env.js';

export const corsOptions = {
  origin: env.clientOrigins, // explicit allowlist. Never combine `credentials` with a wildcard origin.
  credentials: true, // lets the browser send and receive the auth cookie on cross-origin requests
};