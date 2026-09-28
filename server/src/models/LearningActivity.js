import mongoose from 'mongoose';
import { ACTIVITY_TYPES } from '../constants/notifications.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// One row per meaningful learning event, written only by the server. Never retained-then-deleted.
// `metadata` holds small non-sensitive facts (attempt id, percentage, pass flag), never answers.
const learningActivitySchema = new Schema(
  {
    user: requiredRef('User'),
    type: { type: String, enum: Object.values(ACTIVITY_TYPES), required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    concept: { type: Schema.Types.ObjectId, ref: 'Concept', default: null },
    resource: { type: Schema.Types.ObjectId, ref: 'Resource', default: null },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
    title: { type: String, trim: true, maxlength: 200, default: '' },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    dedupeKey: { type: String, required: true, maxlength: 200, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

learningActivitySchema.index({ user: 1, createdAt: -1 }); // a student's feed
learningActivitySchema.index({ course: 1, createdAt: -1 }); // course aggregates within a date range
learningActivitySchema.index({ user: 1, dedupeKey: 1 }, { unique: true }); // duplicate-event guard

export default mongoose.model('LearningActivity', learningActivitySchema, 'learning_activity');