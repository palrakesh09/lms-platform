import { z } from 'zod';
import { PAGINATION } from '../constants/listing.js';

// z.object strips unknown keys, so ?userId=... is simply ignored: identity is always req.user.id.
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(20),
  filter: z.enum(['all', 'unread'], 'filter must be all or unread').default('all'),
});