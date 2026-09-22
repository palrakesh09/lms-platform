import { z } from 'zod';
import { PAGINATION } from '../constants/listing.js';
import { ROLES } from '../constants/lms.js';
import { ASSIGNABLE_ROLES, USER_SORTS } from '../constants/users.js';

// Query strings: unknown parameters are ignored, bad values are rejected.
export const listUsersQuerySchema = z.object({
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
  role: z.enum(Object.values(ROLES), 'Role must be admin, mentor or student').optional(),
  // z.coerce.boolean() would treat the string "false" as true, so parse it explicitly.
  isActive: z
    .enum(['true', 'false'], 'isActive must be true or false')
    .transform((value) => value === 'true')
    .optional(),
  sort: z
    .enum(Object.keys(USER_SORTS), `Sort must be one of: ${Object.keys(USER_SORTS).join(', ')}`)
    .default('-createdAt'),
});

// strictObject: nothing but the one field is accepted, so a body cannot smuggle in extra changes.
export const updateUserStatusSchema = z.strictObject({
  isActive: z.boolean('isActive must be true or false'),
});

export const updateUserRoleSchema = z.strictObject({
  role: z.enum(ASSIGNABLE_ROLES, 'Role must be student or mentor'),
});