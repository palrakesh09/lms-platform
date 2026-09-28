import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

const compact = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const searchGlobal = async (params, signal) => {
  const { data } = await apiClient.get('/search', { params: compact(params), signal });
  return { items: data.data, pagination: data.pagination };
};

export const searchCourse = async (courseId, params, signal) => {
  const { data } = await apiClient.get(`/courses/${encode(courseId)}/search`, { params: compact(params), signal });
  return { items: data.data, pagination: data.pagination };
};