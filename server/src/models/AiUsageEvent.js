import mongoose from 'mongoose';
import { AI_MODES } from '../constants/ai.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// One row per model call. Never stores the message text, only outcome + token counts, for the daily
// limit check and the admin usage dashboard.
const aiUsageEventSchema = new Schema(
  {
    user: requiredRef('User'),
    date: { type: String, required: true }, // 'YYYY-MM-DD', UTC
    mode: { type: String, enum: Object.values(AI_MODES), required: true },
    success: { type: Boolean, required: true },
    errorType: { type: String, default: null }, // 'timeout' | 'rate_limited' | 'provider_error' | null
    inputTokens: { type: Number, default: null },
    outputTokens: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

aiUsageEventSchema.index({ user: 1, date: 1 }); // daily-limit count for one user
aiUsageEventSchema.index({ date: 1, success: 1 }); // admin usage aggregation

export default mongoose.model('AiUsageEvent', aiUsageEventSchema, 'ai_usage_events');