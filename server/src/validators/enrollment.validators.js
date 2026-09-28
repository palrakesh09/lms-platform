import { z } from 'zod';
import { PAGINATION } from '../constants/listing.js';
import { ENROLLMENT_STATUS } from '../models/Enrollment.js';
import { objectIdSchema } from './fields.js';

export const createEnrollmentSchema = z.strictObject({
  courseId: objectIdSchema,
  studentId: z.string().optional(),
});

export const listAdminEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  courseId: objectIdSchema.optional(),
  status: z.enum(Object.values(ENROLLMENT_STATUS)).optional(),
  search: z.string().trim().max(100).optional(), // student name/email
});