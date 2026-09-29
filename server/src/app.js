import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { verifyOrigin } from './middleware/verifyOrigin.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json({ limit: '210kb' })); // Supports resource content's 200 KB schema limit plus request fields.
app.use(cookieParser());

app.use('/api', verifyOrigin, apiRoutes);

// Order matters: 404 first, then the centralized error handler last.
app.use(notFound);
app.use(errorHandler);

export default app;