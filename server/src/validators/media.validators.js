import { z } from 'zod';
import { MEDIA_ENTITY_TYPES, MEDIA_LIMITS } from '../constants/media.js';
import { objectIdSchema } from './fields.js';

// multer populates req.body with STRING fields from the multipart form; this validates those, not the file
// itself (the file's real type is checked by signature, not by anything the client claims).
export const uploadMetaSchema = z.object({
  entityType: z.enum(MEDIA_ENTITY_TYPES, `entityType must be one of: ${MEDIA_ENTITY_TYPES.join(', ')}`),
  entityId: objectIdSchema,
  altText: z.string().trim().max(MEDIA_LIMITS.MAX_ALT_TEXT).optional(),
});

export const listMediaQuerySchema = z.object({
  courseId: objectIdSchema,
  category: z.enum(['image', 'document']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const accessQuerySchema = z.object({
  disposition: z.enum(['inline', 'attachment']).default('inline'),
});