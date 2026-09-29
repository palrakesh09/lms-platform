import mongoose from 'mongoose';
import { AI_CONTEXT_TYPES, AI_LANGUAGES, AI_LIMITS, AI_MESSAGE_ROLES, AI_MODES } from '../constants/ai.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// A single reference "source" cited alongside an assistant reply. Only what's needed to build an
// in-app link and label it — never a raw internal id beyond what the link itself requires.
const sourceSchema = new Schema({ type: String, title: String, url: String }, { _id: false });

const messageSchema = new Schema(
  {
    role: { type: String, enum: AI_MESSAGE_ROLES, required: true },
    content: { type: String, required: true, trim: true, maxlength: 20000 }, // clean text only, never the wrapped prompt
    sources: { type: [sourceSchema], default: undefined },
    tokenUsage: { type: { inputTokens: Number, outputTokens: Number }, default: undefined },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Embedded, capped conversation. No API keys, system prompts, or wrapped course-material text are ever
// stored here — only the clean user text and the model's clean reply.
const aiConversationSchema = new Schema(
  {
    user: requiredRef('User'),
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    contextType: { type: String, enum: AI_CONTEXT_TYPES, default: 'general' },
    contextId: { type: Schema.Types.ObjectId, default: null },
    mode: { type: String, enum: Object.values(AI_MODES), default: AI_MODES.CHAT },
    language: { type: String, enum: AI_LANGUAGES, default: 'en' },
    title: { type: String, trim: true, maxlength: AI_LIMITS.MAX_TITLE_LENGTH, default: 'New conversation' },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

aiConversationSchema.index({ user: 1, updatedAt: -1 }); // "my conversations", newest first

export default mongoose.model('AiConversation', aiConversationSchema);