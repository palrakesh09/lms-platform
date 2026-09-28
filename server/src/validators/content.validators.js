import { z } from 'zod';
import { RESOURCE_TYPES } from '../constants/lms.js';
import { resourceContentSchema } from './resourceContent.validators.js';
import {
  AT_LEAST_ONE_FIELD,
  hasAtLeastOneField,
  optionalUrlSchema,
  orderSchema,
  slugSchema,
  statusSchema,
  textSchema,
  titleSchema,
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

// url is optional as of Phase 12: a resource may carry an external URL, structured content, or both.
// "at least one of the two" is enforced in resource.service.js, where a clear field-level 422 can be
// returned against the actual merged document — see that file's hasUsableContent().
const resourceShape = {
  type: resourceTypeSchema,
  title: titleSchema,
  description: textSchema('Description', 1000),
  content: resourceContentSchema,
  url: optionalUrlSchema('Resource'),
  openInNewTab: z.boolean('openInNewTab must be true or false'),
  order: orderSchema,
  status: statusSchema,
};

export const createResourceSchema = z
  .strictObject(resourceShape)
  .partial({ description: true, content: true, url: true, openInNewTab: true, order: true, status: true });

export const updateResourceSchema = z
  .strictObject(resourceShape)
  .partial()
  .refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD);

export const listResourcesQuerySchema = z.object({
  type: resourceTypeSchema.optional(),
});