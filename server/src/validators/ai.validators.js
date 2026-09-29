import { z } from 'zod';
import { AI_CONTEXT_TYPES, AI_LANGUAGES } from '../constants/ai.js';
import { env } from '../config/env.js';
import { PAGINATION } from '../constants/listing.js';
import { objectIdSchema } from './fields.js';

const language = z.enum(AI_LANGUAGES, 'language must be en, hi or hinglish').default('en');
const contextType = z.enum(AI_CONTEXT_TYPES);

// The message length ceiling is read from env at request time (not baked into the schema at import
// time), so it tracks whatever the server was actually started with.
const message = () => z.string('Message is required').trim().min(1, 'Message is required').max(env.aiMaxMessageLength, `Message cannot exceed ${env.aiMaxMessageLength} characters`);

export const chatSchema = z.strictObject({
  conversationId: objectIdSchema.optional(),
  contextType: contextType.optional(),
  contextId: objectIdSchema.optional(),
  message: message(),
  language,
}).refine((v) => !v.contextType || v.contextType === 'general' || Boolean(v.contextId), { message: 'contextId is required for this contextType', path: ['contextId'] });

export const explainSchema = z.strictObject({
  conversationId: objectIdSchema.optional(),
  contextType: contextType.exclude(['general']),
  contextId: objectIdSchema,
  style: z.enum(['simple', 'step-by-step', 'detailed']).default('simple'),
  language,
});

export const practiceSchema = z.strictObject({
  conversationId: objectIdSchema.optional(),
  contextType: contextType.exclude(['general']),
  contextId: objectIdSchema,
  questionType: z.enum(['mcq', 'short-answer', 'conceptual', 'coding', 'mixed']).default('mixed'),
  count: z.number().int().min(1).max(5).default(3),
  language,
});

export const hintSchema = z.strictObject({
  conversationId: objectIdSchema.optional(),
  contextType: contextType.exclude(['general']),
  contextId: objectIdSchema,
  language,
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(20),
});

export const updateAiSettingsSchema = z.strictObject({
  enabled: z.boolean().optional(),
  maxOutputTokens: z.number().int().min(64).max(4096).nullable().optional(),
  dailyLimitPerUser: z.number().int().min(1).max(1000).nullable().optional(),
}).refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const usageQuerySchema = z.object({ range: z.enum(['7d', '30d', '90d']).default('30d') });