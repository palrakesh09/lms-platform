import { useCallback } from 'react';
import { getCourses } from '../services/courseService.js';
import { useApiResource } from './useApiResource.js';

export function useCourses({ page, search }) {
  const fetcher = useCallback((signal) => getCourses({ page, search }, signal), [page, search]);
  return useApiResource(fetcher);
}