import morgan from 'morgan';
import { env } from '../config/env.js';

// Silent under `npm test` so test output stays readable.
export const requestLogger = morgan(env.isProduction ? 'combined' : 'dev', {
  skip: () => env.nodeEnv === 'test',
});