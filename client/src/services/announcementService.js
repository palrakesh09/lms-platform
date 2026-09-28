// announcementService.js
import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getAnnouncements = async (params, signal) => {
  const { data } = await apiClient.get('/announcements', { params, signal });
  return { items: data.data, pagination: data.pagination };
};
export const createAnnouncement = async (payload) => (await apiClient.post('/announcements', payload)).data.data;
export const updateAnnouncement = async (id, payload) => (await apiClient.patch(`/announcements/${encode(id)}`, payload)).data.data;
export const publishAnnouncement = async (id) => (await apiClient.post(`/announcements/${encode(id)}/publish`)).data.data;
export const deleteAnnouncement = async (id) => { await apiClient.delete(`/announcements/${encode(id)}`); };