import { z } from 'zod';
import { ANALYTICS_RANGES, DEFAULT_RANGE } from '../constants/analytics.js';
import { PAGINATION } from '../constants/listing.js';
import { CONTENT_STATUS } from '../constants/lms.js';

export const activityQuerySchema = z.object({
  range: z.enum(Object.keys(ANALYTICS_RANGES), 'range must be one of: 7d, 30d, 90d').default(DEFAULT_RANGE),
});

export const courseAnalyticsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().max(100).optional(),
  status: z.enum(Object.values(CONTENT_STATUS)).optional(),
});