import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../constants/lms.js';
import { isHttpUrl } from '../utils/isHttpUrl.js';
import {
  auditFields,
  orderField,
  requiredRef,
  statusField,
  textField,
  titleField,
} from './schemaFields.js';

const resourceSchema = new mongoose.Schema(
  {
    concept: requiredRef('Concept'),
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: Object.values(RESOURCE_TYPES),
        message: '{VALUE} is not a valid resource type',
      },
    },
    title: titleField(),
    description: textField('Description', 1000),
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      maxlength: [2048, 'URL cannot exceed 2048 characters'],
      validate: {
        validator: isHttpUrl,
        message: 'URL must be a valid http(s) URL',
      },
    },
    openInNewTab: {
      type: Boolean,
      default: true,
    },
    order: orderField(),
    status: statusField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Serves "all resources of a concept" (prefix) and "resources of one type in order".
// There is intentionally no unique index: a concept may have several resources of the same type.
resourceSchema.index({ concept: 1, type: 1, order: 1 });

export default mongoose.model('Resource', resourceSchema);