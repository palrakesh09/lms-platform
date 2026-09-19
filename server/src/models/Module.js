import mongoose from 'mongoose';
import {
  auditFields,
  orderField,
  requiredRef,
  slugField,
  statusField,
  textField,
  titleField,
} from './schemaFields.js';

const moduleSchema = new mongoose.Schema(
  {
    course: requiredRef('Course'),
    title: titleField(),
    slug: slugField(),
    description: textField('Description', 2000),
    order: orderField(),
    status: statusField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Sidebar: a course's modules in order.
moduleSchema.index({ course: 1, order: 1 });
// Slug must be unique within its course, not globally.
moduleSchema.index({ course: 1, slug: 1 }, { unique: true });

export default mongoose.model('Module', moduleSchema);