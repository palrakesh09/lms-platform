import mongoose from 'mongoose';
import { env } from './env.js';

const SERVER_SELECTION_TIMEOUT_MS = 5000;

const registerConnectionListeners = () => {
  const { connection } = mongoose;
  connection.on('error', (error) => console.error('[db] Connection error:', error.message));
  connection.on('disconnected', () => console.warn('[db] Disconnected from MongoDB'));
  connection.on('reconnected', () => console.log('[db] Reconnected to MongoDB'));
};

export const connectDB = async () => {
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
  });

  registerConnectionListeners();

  // Log host and database name only. Never log the URI, it may contain credentials.
  const { host, name } = mongoose.connection;
  console.log(`[db] Connected to MongoDB (${host}/${name})`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};