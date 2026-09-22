import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getQuizzesForConcept = async (conceptId, signal) =>
  (await apiClient.get(`/concepts/${encode(conceptId)}/quizzes`, { signal })).data.data;
export const getQuiz = async (quizId, signal) => (await apiClient.get(`/quizzes/${encode(quizId)}`, { signal })).data.data;
export const createQuizForConcept = async (conceptId, payload) =>
  (await apiClient.post(`/concepts/${encode(conceptId)}/quizzes`, payload)).data.data;
export const updateQuiz = async (quizId, payload) => (await apiClient.patch(`/quizzes/${encode(quizId)}`, payload)).data.data;
export const publishQuiz = async (quizId) => (await apiClient.patch(`/quizzes/${encode(quizId)}/publish`)).data.data;
export const archiveQuiz = async (quizId) => (await apiClient.patch(`/quizzes/${encode(quizId)}/archive`)).data.data;
export const deleteQuiz = async (quizId) => { await apiClient.delete(`/quizzes/${encode(quizId)}`); };