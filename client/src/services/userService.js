import { apiClient } from './apiClient.js';

const encode = encodeURIComponent;

export const getUsers = async ({ page = 1, limit = 10, search, role, isActive } = {}, signal) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (role) params.role = role;
  if (typeof isActive === 'boolean') params.isActive = isActive;

  const { data } = await apiClient.get('/users', { params, signal });
  return { items: data.data, pagination: data.pagination };
};

export const setUserStatus = async (userId, isActive) =>
  (await apiClient.patch(`/users/${encode(userId)}/status`, { isActive })).data.data;

export const setUserRole = async (userId, role) =>
  (await apiClient.patch(`/users/${encode(userId)}/role`, { role })).data.data;