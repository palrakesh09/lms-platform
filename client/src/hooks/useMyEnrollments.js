import { getMyEnrollments } from '../services/enrollmentService.js';
import { useApiResource } from './useApiResource.js';

export const useMyEnrollments = () => useApiResource(getMyEnrollments);