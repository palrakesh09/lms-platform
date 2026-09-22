import { z } from 'zod';
import { CONTENT_STATUS, SLUG_PATTERN } from '../constants/lms.js';
import { isHttpUrl } from '../utils/isHttpUrl.js';
import { isObjectIdString } from '../utils/objectId.js';

const MAX_URL_LENGTH = 2048;
const SLUG_RULE = 'may contain only lowercase letters, numbers and single hyphens';

export const titleSchema = z
  .string('Title is required')
  .trim()
  .min(2, 'Title must be at least 2 characters')
  .max(150, 'Title cannot exceed 150 characters');

export const slugSchema = z
  .string('Slug must be text')
  .trim()
  .toLowerCase()
  .max(160, 'Slug cannot exceed 160 characters')
  .regex(SLUG_PATTERN, `Slug ${SLUG_RULE}`);

// Lowercase slug-style, so filters like ?category=web-development match exactly.
export const categorySchema = z
  .string('Category must be text')
  .trim()
  .toLowerCase()
  .max(60, 'Category cannot exceed 60 characters')
  .regex(SLUG_PATTERN, `Category ${SLUG_RULE} (for example web-development)`);

export const textSchema = (label, max) =>
  z.string(`${label} must be text`).trim().max(max, `${label} cannot exceed ${max} characters`);

export const orderSchema = z
  .number('Order must be a number')
  .int('Order must be a whole number')
  .min(0, 'Order cannot be negative')
  .max(100000, 'Order cannot exceed 100000');

export const statusSchema = z.enum(
  Object.values(CONTENT_STATUS),
  'Status must be draft, published or archived',
);

// Required http(s) URL. Rejects javascript:, data: and anything unparseable.
export const urlSchema = z
  .string('URL is required')
  .trim()
  .max(MAX_URL_LENGTH, `URL cannot exceed ${MAX_URL_LENGTH} characters`)
  .refine(isHttpUrl, 'URL must be a valid http(s) URL');

// Empty string clears the value. Anything else must be an http(s) URL.
export const optionalUrlSchema = (label) =>
  z
    .string(`${label} must be text`)
    .trim()
    .max(MAX_URL_LENGTH, `${label} URL cannot exceed ${MAX_URL_LENGTH} characters`)
    .refine((value) => value === '' || isHttpUrl(value), `${label} must be a valid http(s) URL or empty`);

export const objectIdSchema = z
  .string('Must be an id')
  .refine(isObjectIdString, 'Must be a valid id')
  .transform((value) => value.toLowerCase());

export const hasAtLeastOneField = (input) => Object.keys(input).length > 0;
export const AT_LEAST_ONE_FIELD = 'Provide at least one field to update';