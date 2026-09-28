import { z } from 'zod';
import { PAGINATION } from '../constants/listing.js';
import { objectIdSchema } from './fields.js';

export const myActivityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(20),
  courseId: objectIdSchema.optional(), // narrows the caller's OWN feed; never selects another user
});