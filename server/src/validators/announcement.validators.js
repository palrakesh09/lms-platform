import { z } from 'zod';
import { PAGINATION } from '../constants/listing.js';
import { ANNOUNCEMENT_AUDIENCE, ANNOUNCEMENT_STATUS, NOTIFICATION_LIMITS as L } from '../constants/notifications.js';
import { hasAtLeastOneField, AT_LEAST_ONE_FIELD, objectIdSchema, titleSchema } from './fields.js';

const messageSchema = z.string('Message is required').trim().min(1, 'Message is required').max(L.MAX_MESSAGE, `Message cannot exceed ${L.MAX_MESSAGE} characters`);
const audienceSchema = z.enum(Object.values(ANNOUNCEMENT_AUDIENCE), 'Invalid audience');

// strictObject: no status, publishedAt, createdBy or recipients can ever be supplied.
const shape = { title: titleSchema, message: messageSchema, audienceType: audienceSchema, courseId: objectIdSchema };

export const createAnnouncementSchema = z.strictObject(shape).partial({ courseId: true });
export const updateAnnouncementSchema = z.strictObject(shape).partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGINATION.MAX_PAGE).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(10),
  status: z.enum(Object.values(ANNOUNCEMENT_STATUS)).optional(),
  courseId: objectIdSchema.optional(),
});