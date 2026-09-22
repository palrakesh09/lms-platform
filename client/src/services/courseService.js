import { apiClient } from './apiClient.js';

const DEFAULT_PAGE_SIZE = 12; // the API allows 1-50
const encode = encodeURIComponent;

// Drops undefined and empty values so they never reach the query string.
const compact = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));

export const getCourses = async (
  { page = 1, limit = DEFAULT_PAGE_SIZE, search, category, level, status, sort } = {},
  signal,
) => {
  const params = compact({ page, limit, search, category, level, status, sort });
  const { data } = await apiClient.get('/courses', { params, signal });
  return { items: data.data, pagination: data.pagination };
};

export const getCourseById = async (courseId, signal) => {
  const { data } = await apiClient.get(`/courses/${encode(courseId)}`, { signal });
  return data.data;
};

export const getCourseStructure = async (courseId, signal) => {
  const { data } = await apiClient.get(`/courses/${encode(courseId)}/structure`, { signal });
  return data.data;
};

// --- Management (the API enforces who may call these) ---

export const createCourse = async (payload) => (await apiClient.post('/courses', payload)).data.data;

export const updateCourse = async (courseId, payload) =>
  (await apiClient.patch(`/courses/${encode(courseId)}`, payload)).data.data;

export const publishCourse = async (courseId) => (await apiClient.patch(`/courses/${encode(courseId)}/publish`)).data.data;

export const archiveCourse = async (courseId) => (await apiClient.patch(`/courses/${encode(courseId)}/archive`)).data.data;

export const deleteCourse = async (courseId) => {
  await apiClient.delete(`/courses/${encode(courseId)}`);
};

export const getCourseMentors = async (courseId, signal) =>
  (await apiClient.get(`/courses/${encode(courseId)}/mentors`, { signal })).data.data;

export const setCourseMentors = async (courseId, mentorIds) =>
  (await apiClient.patch(`/courses/${encode(courseId)}/mentors`, { mentorIds })).data.data;