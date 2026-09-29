import { ApiError } from '../utils/ApiError.js';
import { getEffectiveAiConfig } from '../services/ai/aiSettings.service.js';

// A cheap early check so a disabled assistant fails fast, before authorization/retrieval work runs.
// ai.service.runTurn ALSO checks this itself, so this middleware is a fast path, not the only guard.
export const requireAiEnabled = async (_req, _res, next) => {
  const { enabled } = await getEffectiveAiConfig();
  if (!enabled) return next(new ApiError(503, 'The AI assistant is currently disabled.'));
  next();
};