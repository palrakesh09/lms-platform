import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../constants/lms.js';
import { CONTENT_LIMITS } from '../constants/contentBlocks.js';
import { auditFields, optionalUrlField, orderField, requiredRef, statusField, textField, titleField } from './schemaFields.js';

const resourceSchema = new mongoose.Schema(
  {
    concept: requiredRef('Concept'),
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: { values: Object.values(RESOURCE_TYPES), message: '{VALUE} is not a valid resource type' },
    },
    title: titleField(1),
    description: textField('Description', 1000),
    // Structured, whitelisted block content (Phase 12): { version: 1, blocks: [...] }. Fully validated by
    // Zod (resourceContent.validators.js) before it ever reaches this model — no HTML is ever accepted or
    // stored here, only a controlled JSON shape. The size check below is defense in depth, not the
    // primary line of defense.
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
      validate: {
        validator: (value) =>
          value === undefined ||
          value === null ||
          Buffer.byteLength(JSON.stringify(value), 'utf8') <= CONTENT_LIMITS.MAX_CONTENT_BYTES,
        message: 'Content exceeds the maximum allowed size',
      },
    },
    // Optional as of Phase 12 (previously required): a resource may carry an external link, structured
    // content, or both. "At least one of the two" is enforced in resource.service.js.
    url: optionalUrlField('Resource'),
    openInNewTab: { type: Boolean, default: true },
    order: orderField(),
    status: statusField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Serves "all resources of a concept" (prefix) and "resources of one type in order".
resourceSchema.index({ concept: 1, type: 1, order: 1 });

export default mongoose.model('Resource', resourceSchema);