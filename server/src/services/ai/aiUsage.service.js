import { ANALYTICS_RANGES } from '../../constants/analytics.js';
import { rangeStart, dayKeyOf } from '../../utils/analyticsDefinitions.js';
import AiUsageEvent from '../../models/AiUsageEvent.js';
import { ApiError } from '../../utils/ApiError.js';
import { getEffectiveAiConfig } from './aiSettings.service.js';

const today = () => dayKeyOf(new Date());

export const enforceDailyLimit = async (userId, dailyLimit) => {
  const count = await AiUsageEvent.countDocuments({ user: userId, date: today(), success: true });
  if (count >= dailyLimit) {
    throw new ApiError(429, `You've reached today's limit of ${dailyLimit} AI requests. Please try again tomorrow.`);
  }
};

export const logUsage = (userId, mode, success, errorType = null, usage = {}) =>
  AiUsageEvent.create({ user: userId, date: today(), mode, success, errorType, inputTokens: usage.inputTokens ?? null, outputTokens: usage.outputTokens ?? null });

// Admin aggregate: counts only, never message content, never per-user breakdowns of what was asked.
export const getUsageSummary = async (range) => {
  const days = ANALYTICS_RANGES[range];
  const since = rangeStart(days);
  const rows = await AiUsageEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { success: '$success', errorType: '$errorType' }, count: { $sum: 1 }, users: { $addToSet: '$user' } } },
  ]);

  let totalRequests = 0, successCount = 0;
  const errorsByType = {};
  const allUsers = new Set();
  for (const row of rows) {
    totalRequests += row.count;
    row.users.forEach((u) => allUsers.add(String(u)));
    if (row._id.success) successCount += row.count;
    else errorsByType[row._id.errorType ?? 'unknown'] = (errorsByType[row._id.errorType ?? 'unknown'] ?? 0) + row.count;
  }
  return { range, totalRequests, successCount, errorCount: totalRequests - successCount, errorsByType, distinctUsers: allUsers.size, ...(await getEffectiveAiConfig()) };
};