import path from 'node:path';
import dotenv from 'dotenv';

// Load server/.env regardless of the directory the process was started from.
// In production the platform injects real environment variables and no .env file exists.
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env'), quiet: true });

const MIN_JWT_SECRET_LENGTH = 32;
const SAME_SITE_VALUES = ['lax', 'strict', 'none'];
const SECONDS_PER_UNIT = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 };

const requireEnv = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parsePort = (value) => {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535 (received "${value}")`);
  }
  return port;
};

const parseOrigins = (value) =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Never include the secret's value in the message.
const parseJwtSecret = (value) => {
  if (value.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
  }
  return value;
};

// "15m" -> 900. The same number drives the JWT `exp` claim and the cookie maxAge.
const parseDurationToSeconds = (name, value) => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match || Number(match[1]) === 0) {
    throw new Error(`${name} must be a positive duration such as "30m", "12h" or "7d" (received "${value}")`);
  }
  return Number(match[1]) * SECONDS_PER_UNIT[match[2]];
};

const parseSameSite = (value, isProduction) => {
  const sameSite = value?.trim().toLowerCase() || 'lax';

  if (!SAME_SITE_VALUES.includes(sameSite)) {
    throw new Error(`COOKIE_SAME_SITE must be one of: ${SAME_SITE_VALUES.join(', ')}`);
  }
  if (sameSite === 'none' && !isProduction) {
    throw new Error('COOKIE_SAME_SITE=none requires NODE_ENV=production, because SameSite=None cookies must be Secure (HTTPS)');
  }
  return sameSite;
};

const loadEnv = () => {
  const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
  const isProduction = nodeEnv === 'production';

  return Object.freeze({
    nodeEnv,
    isProduction,
    port: parsePort(requireEnv('PORT')),
    mongodbUri: requireEnv('MONGODB_URI'),
    clientOrigins: parseOrigins(requireEnv('CLIENT_URL')),
    jwtSecret: parseJwtSecret(requireEnv('JWT_SECRET')),
    jwtExpiresInSeconds: parseDurationToSeconds('JWT_EXPIRES_IN', requireEnv('JWT_EXPIRES_IN')),
    cookieSameSite: parseSameSite(process.env.COOKIE_SAME_SITE, isProduction),
  });
};

// Fail fast with a readable message instead of a stack trace when configuration is invalid.
const createEnv = () => {
  try {
    return loadEnv();
  } catch (error) {
    console.error(`[config] ${error.message}`);
    process.exit(1);
  }
};

export const env = createEnv();