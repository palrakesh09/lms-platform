// Must be imported before anything from src/. It has no imports on purpose, so its statements
// run before src/config/env.js is evaluated. dotenv never overrides variables that already exist,
// so these values win over server/.env and the tests are independent of your local setup.
//
// The Phase 4 suites never connect to a database. The Phase 5 API suite does, using the URI below,
// and refuses to run unless the database name ends with "-test".
process.env.NODE_ENV = 'test';
process.env.PORT = '5999';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ?? 'mongodb://127.0.0.1:27017/lms-platform-test';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-only-secret-not-used-anywhere-else-0123456789';
process.env.JWT_EXPIRES_IN = '1h';
process.env.COOKIE_SAME_SITE = 'lax';