import { z } from 'zod';
import { objectIdSchema } from './fields.js';

// Body of PATCH /progress/course/:courseId/access. Both ids are re-validated against the database in
// the service — this schema only checks their shape.
export const accessBodySchema = z.strictObject({
  conceptId: objectIdSchema,
  resourceId: objectIdSchema,
});