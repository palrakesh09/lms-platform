import mongoose from 'mongoose';

// Singleton document (there is ever exactly one). Only the knobs that are safe to flip without a
// restart live here — the API key and model string remain env-only (see env.js and docs/ai-assistant.md).
const aiSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    maxOutputTokens: { type: Number, default: null, min: 64, max: 4096 }, // null = fall back to env default
    dailyLimitPerUser: { type: Number, default: null, min: 1, max: 1000 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

export default mongoose.model('AiSettings', aiSettingsSchema, 'ai_settings');