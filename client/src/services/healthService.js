import { apiClient } from './apiClient.js';

export const getHealth = async (signal) => {
  const { data } = await apiClient.get('/health', { signal });
  return data;
};