import { apiClient } from './apiClient.js';

const encode = encodeURIComponent;

export const getExerciseForPlay = async (exerciseId, signal) =>
  (await apiClient.get(`/coding-exercises/${encode(exerciseId)}/play`, { signal })).data.data;

export const submitAttempt = async (exerciseId, payload) =>
  (await apiClient.post(`/coding-exercises/${encode(exerciseId)}/attempts`, payload)).data.data;
