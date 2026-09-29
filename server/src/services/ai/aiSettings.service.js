import { env } from '../../config/env.js';
import AiSettings from '../../models/AiSettings.js';

// Lazily creates the one settings document on first access. Enabled defaults to true so an admin who
// has already set AI_ENABLED=true in the environment doesn't ALSO have to flip a database flag.
const load = () => AiSettings.findOneAndUpdate({}, { $setOnInsert: { enabled: true } }, { upsert: true, new: true }).lean();

// Effective config = DB override where set, else the env default. API key/model are NEVER part of this —
// they stay env-only.
export const getEffectiveAiConfig = async () => {
  const settings = await load();
  return {
    enabled: env.aiEnabled && settings.enabled,
    maxOutputTokens: settings.maxOutputTokens ?? env.aiMaxOutputTokens,
    dailyLimitPerUser: settings.dailyLimitPerUser ?? env.aiDailyLimitPerUser,
  };
};

export const getAdminView = async () => {
  const settings = await load();
  const effective = await getEffectiveAiConfig();
  return {
    enabled: settings.enabled,
    maxOutputTokens: settings.maxOutputTokens,
    dailyLimitPerUser: settings.dailyLimitPerUser,
    effective, // what actually applies right now, combining env + overrides
    envAiEnabled: env.aiEnabled, // so the UI can explain "disabled at the infrastructure level" vs "disabled by admin"
    updatedAt: settings.updatedAt,
  };
};

export const updateSettings = async (patch, user) => {
  await AiSettings.findOneAndUpdate({}, { $setOnInsert: {} }, { upsert: true }); // ensure it exists
  await AiSettings.updateOne({}, { $set: { ...patch, updatedBy: user.id } });
  return getAdminView();
};