import * as aiService from '../services/ai/ai.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toConversationDetail, toConversationSummary, toMessage } from '../utils/aiSerializers.js';
import { getEffectiveAiConfig } from '../services/ai/aiSettings.service.js';

const respond = (res, conversation, statusCode = 200) => {
  const detail = toConversationDetail(conversation);
  sendSuccess(res, { statusCode, message: 'OK', data: { conversation: toConversationSummary(conversation), reply: detail.messages.at(-1) } });
};

export const chat = async (req, res) => {
  const { conversationId, contextType, contextId, message, language } = req.body;
  const conversation = await aiService.runTurn(req.user, { conversationId, contextType, contextId, mode: aiService.AI_MODES.CHAT, userVisibleMessage: message, modelPrompt: message, language });
  respond(res, conversation, conversationId ? 200 : 201);
};

// Title comes from the retrieved node itself (set inside runTurn via context), so we ask a generic
// instruction here and let the grounded context supply the specifics.
export const explain = async (req, res) => {
  const { conversationId, contextType, contextId, style, language } = req.body;
  const prompt = `Explain this in a ${style} way, using the course material above as your primary source.`;
  const conversation = await aiService.runTurn(req.user, { conversationId, contextType, contextId, mode: 'explain', userVisibleMessage: `Explain this (${style})`, modelPrompt: prompt, language });
  respond(res, conversation, conversationId ? 200 : 201);
};

export const practice = async (req, res) => {
  const { conversationId, contextType, contextId, questionType, count, language } = req.body;
  const prompt = `Generate ${count} practice question(s) of type "${questionType}" based on the course material above. Number them, and do not include the answers unless asked.`;
  const conversation = await aiService.runTurn(req.user, { conversationId, contextType, contextId, mode: 'practice', userVisibleMessage: `Generate ${count} practice question(s)`, modelPrompt: prompt, language });
  respond(res, conversation, conversationId ? 200 : 201);
};

export const hint = async (req, res) => {
  const { conversationId, contextType, contextId, language } = req.body;
  const prompt = 'Give the next hint for this task. Look at the conversation history above to see how many hints have already been given, and give exactly one more, slightly more specific than the last.';
  const conversation = await aiService.runTurn(req.user, { conversationId, contextType, contextId, mode: 'hint', userVisibleMessage: 'Give me the next hint', modelPrompt: prompt, language });
  respond(res, conversation, conversationId ? 200 : 201);
};

export const listConversations = async (req, res) => {
  const { items, pagination } = await aiService.listConversations(req.user.id, req.validatedQuery);
  sendSuccess(res, { message: 'Conversations fetched successfully', data: items.map(toConversationSummary), pagination });
};

export const getConversation = async (req, res) => {
  const conversation = await aiService.getConversation(req.user.id, req.params.id);
  sendSuccess(res, { message: 'Conversation fetched successfully', data: toConversationDetail(conversation) });
};

export const deleteConversation = async (req, res) => {
  await aiService.deleteConversation(req.user.id, req.params.id);
  sendSuccess(res, { message: 'Conversation deleted' });
};

// Lightweight, any-authenticated-role check the frontend uses to decide whether to show the launcher at
// all — separate from the admin settings endpoint, which also returns limits and is admin-only.
export const status = async (_req, res) => sendSuccess(res, { data: { enabled: (await getEffectiveAiConfig()).enabled } });