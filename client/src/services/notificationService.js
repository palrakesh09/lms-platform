import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getNotifications = async (params, signal) => {
  const { data } = await apiClient.get('/notifications', { params, signal });
  return { items: data.data, pagination: data.pagination, unreadCount: data.meta?.unreadCount ?? 0 };
};
export const getUnreadCount = async (signal) => (await apiClient.get('/notifications/unread-count', { signal })).data.data.count;
export const markNotificationRead = async (id) => (await apiClient.patch(`/notifications/${encode(id)}/read`)).data.data;
export const markAllNotificationsRead = async () => (await apiClient.patch('/notifications/read-all')).data.data;
export const deleteNotification = async (id) => { await apiClient.delete(`/notifications/${encode(id)}`); };