import { useCallback } from 'react';
import { getCourseProgress } from '../services/progressService.js';
import { useRefreshableResource } from './useRefreshableResource.js';

// Refreshable, not resettable: marking a concept complete updates the numbers via `mutate` without a
// skeleton flash, and without a second network round trip.
export function useCourseProgress(courseId) {
  const fetcher = useCallback((signal) => getCourseProgress(courseId, signal), [courseId]);
  return useRefreshableResource(fetcher);
}