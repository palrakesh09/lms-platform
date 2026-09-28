import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getAdminOverview = async (signal) => (await apiClient.get('/analytics/admin/overview', { signal })).data.data;
export const getAdminCourseAnalytics = async (params, signal) => {
  const { data } = await apiClient.get('/analytics/admin/courses', { params, signal });
  return { items: data.data, pagination: data.pagination };
};
export const getAdminActivity = async (range, signal) => (await apiClient.get('/analytics/admin/activity', { params: { range }, signal })).data.data;

export const getMentorOverview = async (signal) => (await apiClient.get('/analytics/mentor/overview', { signal })).data.data;
export const getMentorCourseAnalytics = async (courseId, signal) => (await apiClient.get(`/analytics/mentor/courses/${encode(courseId)}`, { signal })).data.data;
export const getMentorActivity = async (range, signal) => (await apiClient.get('/analytics/mentor/activity', { params: { range }, signal })).data.data;

export const getStudentOverview = async (signal) => (await apiClient.get('/analytics/student/overview', { signal })).data.data;
export const getStudentCoursePerformance = async (signal) => (await apiClient.get('/analytics/student/courses', { signal })).data.data;
export const getStudentQuizPerformance = async (signal) => (await apiClient.get('/analytics/student/quizzes', { signal })).data.data;
export const getStudentActivity = async (range, signal) => (await apiClient.get('/analytics/student/activity', { params: { range }, signal })).data.data;