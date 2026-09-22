import { useCallback } from 'react';
import { getResourceById } from '../services/resourceService.js';
import { useApiResource } from './useApiResource.js';

export function useResource(resourceId) {
  const fetcher = useCallback((signal) => getResourceById(resourceId, signal), [resourceId]);
  return useApiResource(fetcher);
}