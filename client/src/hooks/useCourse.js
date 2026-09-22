import { useCallback } from 'react';
import { getCourseById } from '../services/courseService.js';
import { useApiResource } from './useApiResource.js';

export function useCourse(courseId) {
  const fetcher = useCallback((signal) => getCourseById(courseId, signal), [courseId]);
  return useApiResource(fetcher);
}