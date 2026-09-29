import path from 'node:path';
import dotenv from 'dotenv';

// Load server/.env regardless of the directory the process was started from.
// In production the platform injects real environment variables and no .env file exists.
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env'), quiet: true });

const MIN_JWT_SECRET_LENGTH = 32;
const SAME_SITE_VALUES = ['lax', 'strict', 'none'];
const STORAGE_PROVIDERS = ['local', 's3'];
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

const parsePositiveIntEnv = (name, value, fallback) => {
  if (!value?.trim()) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer`);
  return n;
};

const loadEnv = () => {
  const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
  const isProduction = nodeEnv === 'production';

  const jwtSecret = parseJwtSecret(requireEnv('JWT_SECRET'));
  const storageProvider = (process.env.STORAGE_PROVIDER?.trim() || 'local').toLowerCase();
  if (!STORAGE_PROVIDERS.includes(storageProvider)) {
    throw new Error(`STORAGE_PROVIDER must be one of: ${STORAGE_PROVIDERS.join(', ')}`);
  }
  if (storageProvider === 's3') {
    for (const name of ['STORAGE_BUCKET', 'STORAGE_REGION', 'STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY']) {
      requireEnv(name); // throws with a clear message if missing; never logs the value
    }
  }

  const parseAiConfig = () => {
  const enabled = (process.env.AI_ENABLED?.trim() || 'false').toLowerCase() === 'true';
  if (enabled) {
    requireEnv('ANTHROPIC_API_KEY'); // throws with a clear message; never logs the value
    requireEnv('ANTHROPIC_MODEL');
  }
  const int = (name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
    const raw = process.env[name]?.trim();
    if (!raw) return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer between ${min} and ${max}`);
    return n;
  };
  return {
    aiEnabled: enabled,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || '',
    anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || '',
    aiMaxOutputTokens: int('AI_MAX_OUTPUT_TOKENS', 1024, { min: 64, max: 4096 }),
    aiRequestTimeoutMs: int('AI_REQUEST_TIMEOUT_MS', 30000, { min: 1000, max: 120000 }),
    aiMaxMessageLength: int('AI_MAX_MESSAGE_LENGTH', 4000, { min: 1, max: 20000 }),
    aiMaxContextChars: int('AI_MAX_CONTEXT_CHARS', 6000, { min: 500, max: 30000 }),
    aiMaxHistoryMessages: int('AI_MAX_HISTORY_MESSAGES', 10, { min: 2, max: 40 }),
    aiRateLimitPerMinute: int('AI_RATE_LIMIT_PER_MINUTE', 10, { min: 1, max: 100 }),
    aiDailyLimitPerUser: int('AI_DAILY_LIMIT_PER_USER', 50, { min: 1, max: 1000 }),
  };
};

  return Object.freeze({
    nodeEnv,
    isProduction,
    port: parsePort(requireEnv('PORT')),
    mongodbUri: requireEnv('MONGODB_URI'),
    clientOrigins: parseOrigins(requireEnv('CLIENT_URL')),
    jwtSecret,
    jwtExpiresInSeconds: parseDurationToSeconds('JWT_EXPIRES_IN', requireEnv('JWT_EXPIRES_IN')),
    cookieSameSite: parseSameSite(process.env.COOKIE_SAME_SITE, isProduction),
    storageProvider,
    storageLocalDirectory: process.env.STORAGE_LOCAL_DIRECTORY?.trim() || './uploads',
    storageBucket: process.env.STORAGE_BUCKET?.trim() || '',
    storageRegion: process.env.STORAGE_REGION?.trim() || '',
    storageEndpoint: process.env.STORAGE_ENDPOINT?.trim() || '',
    storageAccessKeyId: process.env.STORAGE_ACCESS_KEY_ID?.trim() || '',
    storageSecretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY?.trim() || '',
    mediaSigningSecret: process.env.MEDIA_SIGNING_SECRET?.trim() || jwtSecret,
    mediaMaxImageBytes: parsePositiveIntEnv('MEDIA_MAX_IMAGE_SIZE_MB', process.env.MEDIA_MAX_IMAGE_SIZE_MB, 5) * 1024 * 1024,
    mediaMaxDocumentBytes: parsePositiveIntEnv('MEDIA_MAX_DOCUMENT_SIZE_MB', process.env.MEDIA_MAX_DOCUMENT_SIZE_MB, 20) * 1024 * 1024,
    aiConfig: parseAiConfig(),
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