// client/src/hooks/useMentorAnalytics.js
import { useCallback } from 'react';
import { getMentorActivity, getMentorCourseAnalytics, getMentorOverview } from '../services/analyticsService.js';
import { useApiResource } from './useApiResource.js';

export const useMentorOverview = () => useApiResource(getMentorOverview);
export const useMentorActivity = (range) => useApiResource(useCallback((signal) => getMentorActivity(range, signal), [range]));
export const useMentorCourseAnalytics = (courseId) => useApiResource(useCallback((signal) => getMentorCourseAnalytics(courseId, signal), [courseId]));