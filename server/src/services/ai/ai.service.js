import { AI_LIMITS, AI_MODES } from '../../constants/ai.js';
import { env } from '../../config/env.js';
import { anthropicProvider, mapProviderError } from './anthropicProvider.js';
import { buildRetrievedContext } from './retrieval.service.js';
import { buildSystemPrompt, wrapCourseMaterial } from './prompt.js';
import { enforceDailyLimit, logUsage } from './aiUsage.service.js';
import { getEffectiveAiConfig } from './aiSettings.service.js';
import AiConversation from '../../models/AiConversation.js';
import { ApiError } from '../../utils/ApiError.js';
import { notFoundError } from '../../utils/contentErrors.js';

const loadOwnConversation = async (userId, id) => {
  const conversation = await AiConversation.findOne({ _id: id, user: userId });
  if (!conversation) throw notFoundError(); // identical 404 whether missing or someone else's
  return conversation;
};

// The single orchestrator behind chat/explain/practice/hint. `userVisibleMessage` is what's stored and
// shown; `modelPrompt` is the (possibly more detailed) instruction actually sent to Claude for this turn.
export const runTurn = async (user, { conversationId, contextType, contextId, mode, userVisibleMessage, modelPrompt, language }) => {
  const config = await getEffectiveAiConfig();
  if (!config.enabled) throw new ApiError(503, 'The AI assistant is currently disabled.');
  await enforceDailyLimit(user.id, config.dailyLimitPerUser);

  const conversation = conversationId
    ? await loadOwnConversation(user.id, conversationId)
    : new AiConversation({ user: user.id, contextType: contextType ?? 'general', contextId: contextId ?? null, mode, language, title: userVisibleMessage.slice(0, AI_LIMITS.MAX_TITLE_LENGTH) });

  if (conversation.messages.length >= AI_LIMITS.MAX_MESSAGES_PER_CONVERSATION) {
    throw new ApiError(409, 'This conversation has reached its length limit. Please start a new one.');
  }

  const effectiveContextType = contextType ?? conversation.contextType;
  const effectiveContextId = contextId ?? conversation.contextId;
  const context = await buildRetrievedContext(user, { contextType: effectiveContextType, contextId: effectiveContextId, query: userVisibleMessage });
  if (context.course && !conversation.course) conversation.course = context.course._id;

  const history = conversation.messages.slice(-env.aiMaxHistoryMessages).map((m) => ({ role: m.role, content: m.content }));
  const systemPrompt = buildSystemPrompt({ language, mode });
  const turnContent = `${wrapCourseMaterial(context.text)}\n\nStudent message:\n${modelPrompt}`;

  let result;
  try {
    result = await anthropicProvider.createMessage({
      system: systemPrompt,
      messages: [...history, { role: 'user', content: turnContent }],
      maxTokens: config.maxOutputTokens,
    });
  } catch (error) {
    const mapped = mapProviderError(error);
    await logUsage(user.id, mode, false, mapped.errorType);
    throw new ApiError(mapped.status, mapped.message);
  }

  conversation.messages.push({ role: 'user', content: userVisibleMessage, createdAt: new Date() });
  conversation.messages.push({ role: 'assistant', content: result.text, sources: context.sources.length ? context.sources : undefined, tokenUsage: result.usage, createdAt: new Date() });
  await conversation.save();
  await logUsage(user.id, mode, true, null, result.usage);

  return conversation;
};

export const listConversations = async (userId, { page, limit }) => {
  const { buildPagination } = await import('../../utils/pagination.js');
  const filter = { user: userId };
  const [items, total] = await Promise.all([
    AiConversation.find(filter, '-messages').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AiConversation.countDocuments(filter),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
};

export const getConversation = (userId, id) => loadOwnConversation(userId, id);

export const deleteConversation = async (userId, id) => {
  const result = await AiConversation.deleteOne({ _id: id, user: userId });
  if (result.deletedCount === 0) throw notFoundError();
};

export { AI_MODES };