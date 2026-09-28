// activityService.js
import { apiClient } from './apiClient.js';

export const getMyActivity = async (params, signal) => {
  const { data } = await apiClient.get('/activity/my', { params, signal });
  return { items: data.data, pagination: data.pagination };
};