import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

let server;

const shutdown = (reason, exitCode = 0) => {
  console.log(`[server] ${reason} - shutting down`);

  // Force exit if open connections keep the server from closing.
  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();

  if (!server) {
    process.exit(exitCode);
  }

  server.close(async () => {
    try {
      await disconnectDB();
    } finally {
      process.exit(exitCode);
    }
  });
};

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`[server] Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  // Express 5 passes listen errors (e.g. EADDRINUSE) to this callback.
  server = app.listen(env.port, (error) => {
    if (error) {
      console.error(`[server] Failed to listen on port ${env.port}: ${error.message}`);
      process.exit(1);
    }
    console.log(`[server] LMS API listening on port ${env.port} (${env.nodeEnv})`);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
  shutdown('unhandledRejection', 1);
});

start();