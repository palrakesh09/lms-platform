import { useOutletContext } from 'react-router';
import { getMyLearning } from '../services/progressService.js';
import { useApiResource } from './useApiResource.js';

export function useLearning() {
  return useOutletContext();
}

export function useMyLearning() {
  return useApiResource(getMyLearning);
}