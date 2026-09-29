import { getAdminView, updateSettings } from '../services/ai/aiSettings.service.js';
import { getUsageSummary } from '../services/ai/aiUsage.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Never includes ANTHROPIC_API_KEY or ANTHROPIC_MODEL — those aren't part of AiSettings at all.
export const getSettings = async (_req, res) => sendSuccess(res, { data: await getAdminView() });
export const patchSettings = async (req, res) => sendSuccess(res, { message: 'AI settings updated', data: await updateSettings(req.body, req.user) });
export const getUsage = async (req, res) => sendSuccess(res, { data: await getUsageSummary(req.validatedQuery.range) });