// client/src/hooks/useAdminAnalytics.js
import { useCallback } from 'react';
import { getAdminActivity, getAdminOverview } from '../services/analyticsService.js';
import { useApiResource } from './useApiResource.js';

export const useAdminOverview = () => useApiResource(getAdminOverview);
export const useAdminActivity = (range) => useApiResource(useCallback((signal) => getAdminActivity(range, signal), [range]));