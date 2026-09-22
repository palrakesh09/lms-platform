import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const getQuestions = async (quizId, signal) => (await apiClient.get(`/quizzes/${encode(quizId)}/questions`, { signal })).data.data;
export const getQuestion = async (id, signal) => (await apiClient.get(`/questions/${encode(id)}`, { signal })).data.data;
export const createQuestion = async (quizId, payload) => (await apiClient.post(`/quizzes/${encode(quizId)}/questions`, payload)).data.data;
export const updateQuestion = async (id, payload) => (await apiClient.patch(`/questions/${encode(id)}`, payload)).data.data;
export const deleteQuestion = async (id) => { await apiClient.delete(`/questions/${encode(id)}`); };