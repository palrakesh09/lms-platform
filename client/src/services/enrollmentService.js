import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const enrollInCourse = async (courseId) => (await apiClient.post('/enrollments', { courseId })).data.data.enrollment;
export const getMyEnrollments = async (signal) => (await apiClient.get('/enrollments/my', { signal })).data.data;
export const getEnrollmentStatus = async (courseId, signal) => (await apiClient.get(`/enrollments/${encode(courseId)}`, { signal })).data.data;
export const cancelEnrollment = async (courseId) => (await apiClient.delete(`/enrollments/${encode(courseId)}`)).data.data;