// client/src/hooks/useStudentAnalytics.js
import { useCallback } from 'react';
import { getStudentActivity, getStudentCoursePerformance, getStudentOverview, getStudentQuizPerformance } from '../services/analyticsService.js';
import { useApiResource } from './useApiResource.js';

export const useStudentOverview = () => useApiResource(getStudentOverview);
export const useStudentCourses = () => useApiResource(getStudentCoursePerformance);
export const useStudentQuizzes = () => useApiResource(getStudentQuizPerformance);
export const useStudentActivity = (range) => useApiResource(useCallback((signal) => getStudentActivity(range, signal), [range]));