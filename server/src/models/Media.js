import mongoose from 'mongoose';
import { MEDIA_CATEGORIES, MEDIA_ENTITY_TYPES, MEDIA_LIMITS, MEDIA_STATUS } from '../constants/media.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    uploader: requiredRef('User'),
    originalName: { type: String, required: true, trim: true, maxlength: MEDIA_LIMITS.MAX_ORIGINAL_NAME },
    // Server-generated (crypto.randomUUID()-based), never derived from the original filename. Hidden from
    // every query by default, the same pattern as User.password and Question.correctAnswer.
    storageKey: { type: String, required: true, unique: true, select: false },
    provider: { type: String, enum: ['local', 's3'], required: true },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    category: { type: String, enum: Object.values(MEDIA_CATEGORIES), required: true },
    entityType: { type: String, enum: MEDIA_ENTITY_TYPES, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true }, // the course, or the concept it was uploaded under
    course: requiredRef('Course'), // denormalized owning course, for fast/cheap authorization
    altText: { type: String, trim: true, default: '', maxlength: MEDIA_LIMITS.MAX_ALT_TEXT },
    status: { type: String, enum: Object.values(MEDIA_STATUS), default: MEDIA_STATUS.ACTIVE },
  },
  { timestamps: true },
);

mediaSchema.index({ course: 1, status: 1, createdAt: -1 }); // media library listing, scoped to a course
mediaSchema.index({ entityType: 1, entityId: 1 }); // "all media for this concept/course"

export default mongoose.model('Media', mediaSchema);