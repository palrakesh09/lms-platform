import { useCallback } from 'react';
import { getEnrollmentStatus } from '../services/enrollmentService.js';
import { useApiResource } from './useApiResource.js';
import { useAuth } from './useAuth.js';
import { hasRole, ROLES } from '../utils/roles.js';

// Returns null (not an error) for guests and non-students — there is nothing to fetch for them.
export function useEnrollment(courseId) {
  const { user } = useAuth();
  const isStudent = hasRole(user, [ROLES.STUDENT]);
  const fetcher = useCallback((signal) => (isStudent ? getEnrollmentStatus(courseId, signal) : Promise.resolve(null)), [courseId, isStudent]);
  return useApiResource(fetcher);
}