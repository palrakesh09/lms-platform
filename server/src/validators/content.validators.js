import { z } from 'zod';
import { RESOURCE_TYPES } from '../constants/lms.js';
import {
  AT_LEAST_ONE_FIELD,
  hasAtLeastOneField,
  orderSchema,
  slugSchema,
  statusSchema,
  textSchema,
  titleSchema,
  urlSchema,
} from './fields.js';

// The parent (course, module, topic or concept) is never accepted from the body: it comes from the URL.
// strictObject rejects any attempt to send it, or createdBy/updatedBy/_id.

// Modules, topics and concepts share one shape.
const nodeSchema = z.strictObject({
  title: titleSchema,
  slug: slugSchema,
  description: textSchema('Description', 2000),
  order: orderSchema,
  status: statusSchema,
});

export const createNodeSchema = nodeSchema.partial({
  slug: true,
  description: true,
  order: true,
  status: true,
});

export const updateNodeSchema = nodeSchema.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

const resourceTypeSchema = z.enum(Object.values(RESOURCE_TYPES), 'Type must be theory, task or mini-project');

const resourceSchema = z.strictObject({
  type: resourceTypeSchema,
  title: titleSchema,
  description: textSchema('Description', 1000),
  url: urlSchema,
  openInNewTab: z.boolean('openInNewTab must be true or false'),
  order: orderSchema,
  status: statusSchema,
});

export const createResourceSchema = resourceSchema.partial({
  description: true,
  openInNewTab: true,
  order: true,
  status: true,
});

export const updateResourceSchema = resourceSchema.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

export const listResourcesQuerySchema = z.object({
  type: resourceTypeSchema.optional(),
});