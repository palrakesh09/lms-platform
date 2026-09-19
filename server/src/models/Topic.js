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

const topicSchema = new mongoose.Schema(
  {
    module: requiredRef('Module'),
    title: titleField(),
    slug: slugField(),
    description: textField('Description', 2000),
    order: orderField(),
    status: statusField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Tree building queries topics with `module: { $in: [...] }`, which uses this index.
topicSchema.index({ module: 1, order: 1 });
topicSchema.index({ module: 1, slug: 1 }, { unique: true });

export default mongoose.model('Topic', topicSchema);