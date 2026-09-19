import mongoose from 'mongoose';
import { COURSE_LEVELS } from '../constants/lms.js';
import {
  auditFields,
  optionalUrlField,
  orderField,
  slugField,
  statusField,
  textField,
  titleField,
} from './schemaFields.js';

const { Schema } = mongoose;

const MAX_INSTRUCTORS = 20;

const courseSchema = new Schema(
  {
    title: titleField(),
    slug: { ...slugField(), unique: true },
    shortDescription: textField('Short description', 200),
    description: textField('Description', 5000),
    thumbnail: optionalUrlField('Thumbnail'),
    level: {
      type: String,
      enum: {
        values: Object.values(COURSE_LEVELS),
        message: '{VALUE} is not a valid level',
      },
      default: COURSE_LEVELS.BEGINNER,
    },
    // Free-form for now. Promote to a controlled list if the catalog grows.
    category: {
      type: String,
      trim: true,
      default: 'general',
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    status: statusField(),
    // Course-level mentor assignment. Bounded, so embedding the IDs is safe.
    instructors: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (ids) => ids.length <= MAX_INSTRUCTORS,
        message: `A course can have at most ${MAX_INSTRUCTORS} instructors`,
      },
    },
    order: orderField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Course cards: published courses in display order. (slug is indexed by `unique: true` above.)
courseSchema.index({ status: 1, order: 1 });
// "Courses assigned to this mentor" (multikey index).
courseSchema.index({ instructors: 1 });

export default mongoose.model('Course', courseSchema);