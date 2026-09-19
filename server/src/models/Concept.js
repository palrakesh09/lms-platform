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

const conceptSchema = new mongoose.Schema(
  {
    topic: requiredRef('Topic'),
    title: titleField(),
    slug: slugField(),
    description: textField('Description', 2000),
    order: orderField(),
    status: statusField(),
    ...auditFields(),
  },
  { timestamps: true },
);

conceptSchema.index({ topic: 1, order: 1 });
conceptSchema.index({ topic: 1, slug: 1 }, { unique: true });

export default mongoose.model('Concept', conceptSchema);