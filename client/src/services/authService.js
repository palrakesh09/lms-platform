import { apiClient } from './apiClient.js';

export const register = async (payload) => {
  const { data } = await apiClient.post('/auth/register', payload);
  return data.data.user;
};

export const login = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data.data.user;
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUser = async (signal) => {
  const { data } = await apiClient.get('/auth/me', { signal });
  return data.data.user;
};