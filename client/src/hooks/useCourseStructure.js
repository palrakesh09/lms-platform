import { useCallback } from 'react';
import { getCourseStructure } from '../services/courseService.js';
import { useApiResource } from './useApiResource.js';

export function useCourseStructure(courseId) {
  const fetcher = useCallback((signal) => getCourseStructure(courseId, signal), [courseId]);
  return useApiResource(fetcher);
}