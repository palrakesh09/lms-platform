import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';

let client;
const getClient = () => {
  client ??= new Anthropic({ apiKey: env.anthropicApiKey });
  return client;
};

// The ONLY place the SDK is touched. Exported as an object method (not a bare function) so tests can
// swap it out with `mock.method(anthropicProvider, 'createMessage', ...)`, the same pattern used
// throughout this project for mockable boundaries (e.g. User.findById in Phase 4's test kit).
export const anthropicProvider = {
  async createMessage({ system, messages, maxTokens }) {
    const response = await getClient().messages.create(
      { model: env.anthropicModel, max_tokens: maxTokens, system, messages },
      { timeout: env.aiRequestTimeoutMs },
    );
    const text = (response.content ?? []).filter((block) => block.type === 'text').map((block) => block.text).join('\n');
    return { text, usage: { inputTokens: response.usage?.input_tokens ?? null, outputTokens: response.usage?.output_tokens ?? null } };
  },
};

// Maps a provider failure to a safe status/message. Never includes the API key, and never echoes the
// provider's raw error body, which can contain implementation details we don't want to leak.
export const mapProviderError = (error) => {
  if (error?.name === 'APIConnectionTimeoutError' || error?.code === 'ETIMEDOUT') {
    return { status: 504, message: 'The AI assistant took too long to respond. Please try again.', errorType: 'timeout' };
  }
  if (error?.status === 429) {
    return { status: 429, message: 'The AI assistant is receiving too many requests right now. Please try again shortly.', errorType: 'rate_limited' };
  }
  return { status: 502, message: 'The AI assistant is temporarily unavailable. Please try again later.', errorType: 'provider_error' };
};