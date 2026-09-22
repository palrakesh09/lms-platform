import { z } from 'zod';
import { COURSE_SORTS, PAGINATION } from '../constants/listing.js';
import { COURSE_LEVELS } from '../constants/lms.js';
import {
  AT_LEAST_ONE_FIELD,
  categorySchema,
  hasAtLeastOneField,
  objectIdSchema,
  optionalUrlSchema,
  orderSchema,
  slugSchema,
  statusSchema,
  textSchema,
  titleSchema,
} from './fields.js';

const MAX_INSTRUCTORS = 20;

const levelSchema = z.enum(Object.values(COURSE_LEVELS), 'Level must be beginner, intermediate or advanced');

const instructorsSchema = z
  .array(objectIdSchema, 'Instructors must be a list of user ids')
  .max(MAX_INSTRUCTORS, `A course can have at most ${MAX_INSTRUCTORS} instructors`)
  .transform((ids) => [...new Set(ids)]);

// Fields any editor of the course may change.
const descriptiveShape = {
  title: titleSchema,
  shortDescription: textSchema('Short description', 200),
  description: textSchema('Description', 5000),
  thumbnail: optionalUrlSchema('Thumbnail'),
  level: levelSchema,
  category: categorySchema,
};

// Fields only admins may change. `status` is deliberately absent everywhere:
// publishing and archiving are explicit endpoints, and new courses are always drafts.
const adminOnlyShape = {
  slug: slugSchema,
  order: orderSchema,
  instructors: instructorsSchema,
};

// strictObject rejects unknown keys, so createdBy, role, status, _id and friends can never slip in.
const adminCourseSchema = z.strictObject({ ...descriptiveShape, ...adminOnlyShape });

export const createCourseSchema = adminCourseSchema.partial({
  shortDescription: true,
  description: true,
  thumbnail: true,
  level: true,
  category: true,
  slug: true,
  order: true,
  instructors: true,
});

export const adminUpdateCourseSchema = adminCourseSchema.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

export const mentorUpdateCourseSchema = z
  .strictObject(descriptiveShape)
  .partial()
  .refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

// Query strings: unknown parameters are ignored (not rejected), bad values are rejected.
export const listCoursesQuerySchema = z.object({
  page: z.coerce
    .number('Page must be a number')
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .max(PAGINATION.MAX_PAGE, `Page cannot exceed ${PAGINATION.MAX_PAGE}`)
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number('Limit must be a number')
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(PAGINATION.MAX_LIMIT, `Limit cannot exceed ${PAGINATION.MAX_LIMIT}`)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string('Search must be text').trim().max(100, 'Search cannot exceed 100 characters').optional(),
  category: categorySchema.optional(),
  level: levelSchema.optional(),
  status: statusSchema.optional(),
  sort: z
    .enum(Object.keys(COURSE_SORTS), `Sort must be one of: ${Object.keys(COURSE_SORTS).join(', ')}`)
    .default('order'),
});

// Body of PATCH /courses/:id/mentors. Replaces the whole list; duplicates are removed.
export const setMentorsSchema = z.strictObject({ mentorIds: instructorsSchema });