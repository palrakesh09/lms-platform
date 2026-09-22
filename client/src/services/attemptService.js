import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const startQuiz = async (quizId) => (await apiClient.post(`/quizzes/${encode(quizId)}/start`)).data.data;
export const submitQuiz = async (quizId, attemptId, answers) =>
  (await apiClient.post(`/quizzes/${encode(quizId)}/submit`, { attemptId, answers })).data.data;
export const getAttempts = async (quizId, signal) => (await apiClient.get(`/quizzes/${encode(quizId)}/attempts`, { signal })).data.data;
export const getAttempt = async (attemptId, signal) => (await apiClient.get(`/attempts/${encode(attemptId)}`, { signal })).data.data;