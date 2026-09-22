import { apiClient } from './apiClient.js';

const encode = encodeURIComponent;

export const getMyLearning = async (signal) => (await apiClient.get('/progress/my-learning', { signal })).data.data;

export const getCourseProgress = async (courseId, signal) =>
  (await apiClient.get(`/progress/course/${encode(courseId)}`, { signal })).data.data;

export const markConceptComplete = async (conceptId) =>
  (await apiClient.patch(`/progress/concept/${encode(conceptId)}/complete`)).data.data;

export const markConceptIncomplete = async (conceptId) =>
  (await apiClient.patch(`/progress/concept/${encode(conceptId)}/incomplete`)).data.data;

// Best-effort from the caller's side: it returns a promise so failures can be observed, but a failure
// here must never block or undo navigation to the resource that was just opened.
export const recordAccess = async (courseId, conceptId, resourceId) =>
  (await apiClient.patch(`/progress/course/${encode(courseId)}/access`, { conceptId, resourceId })).data.data;