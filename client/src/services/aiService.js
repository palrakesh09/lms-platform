import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getAiStatus = async (signal) => (await apiClient.get('/ai/status', { signal })).data.data;
export const sendChatMessage = async (payload) => (await apiClient.post('/ai/chat', payload)).data.data;
export const explainConcept = async (payload) => (await apiClient.post('/ai/explain', payload)).data.data;
export const generatePractice = async (payload) => (await apiClient.post('/ai/practice', payload)).data.data;
export const generateHint = async (payload) => (await apiClient.post('/ai/hint', payload)).data.data;
export const listConversations = async (params, signal) => {
  const { data } = await apiClient.get('/ai/conversations', { params, signal });
  return { items: data.data, pagination: data.pagination };
};
export const getConversation = async (id, signal) => (await apiClient.get(`/ai/conversations/${encode(id)}`, { signal })).data.data;
export const deleteConversation = async (id) => { await apiClient.delete(`/ai/conversations/${encode(id)}`); };