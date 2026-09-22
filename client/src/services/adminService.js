import { apiClient } from './apiClient.js';

export const getAdminStats = async (signal) => (await apiClient.get('/admin/stats', { signal })).data.data;