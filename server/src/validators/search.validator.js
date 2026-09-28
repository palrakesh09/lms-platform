import { z } from 'zod';
import { CONTENT_TYPES, SEARCH_LIMITS as L, SEARCH_SORTS, SEARCH_TYPES } from '../constants/search.js';
import { objectIdSchema } from './fields.js';

// Whitespace is collapsed and trimmed BEFORE the length rules apply. The 500-char pre-limit stops huge
// inputs from being processed at all. An array (?q=a&q=b) or object fails z.string() outright.
const queryText = z
  .string('Search query is required')
  .max(500, `Search query cannot exceed ${L.MAX_QUERY} characters`)
  .transform((value) => value.replace(/\s+/g, ' ').trim())
  .pipe(
    z
      .string()
      .refine(
        (value) => value.length >= L.MIN_QUERY || value === '(',
        `Search query must be at least ${L.MIN_QUERY} characters`,
      )
      .max(L.MAX_QUERY, `Search query cannot exceed ${L.MAX_QUERY} characters`),
  );

const base = {
  q: queryText,
  sort: z.enum(SEARCH_SORTS, `Sort must be one of: ${SEARCH_SORTS.join(', ')}`).default('relevance'),
  page: z.coerce.number('Page must be a number').int().min(1, 'Page must be at least 1').max(L.MAX_PAGE, `Page cannot exceed ${L.MAX_PAGE}`).default(1),
  limit: z.coerce.number('Limit must be a number').int().min(1, 'Limit must be at least 1').max(L.MAX_LIMIT, `Limit cannot exceed ${L.MAX_LIMIT}`).default(L.DEFAULT_LIMIT),
};

export const globalSearchQuerySchema = z.object({
  ...base,
  type: z.enum(['all', ...SEARCH_TYPES], `Type must be one of: all, ${SEARCH_TYPES.join(', ')}`).default('all'),
  courseId: objectIdSchema.optional(),
});

export const courseSearchQuerySchema = z.object({
  ...base,
  type: z.enum(['all', ...CONTENT_TYPES], `Type must be one of: all, ${CONTENT_TYPES.join(', ')}`).default('all'),
});