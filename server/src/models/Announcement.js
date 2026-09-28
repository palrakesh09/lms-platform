import mongoose from 'mongoose';
import { ANNOUNCEMENT_AUDIENCE, ANNOUNCEMENT_STATUS, NOTIFICATION_LIMITS as L } from '../constants/notifications.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: L.MAX_TITLE },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: L.MAX_MESSAGE },
    createdBy: requiredRef('User'),
    audienceType: { type: String, enum: Object.values(ANNOUNCEMENT_AUDIENCE), required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null }, // set iff course_students
    status: { type: String, enum: Object.values(ANNOUNCEMENT_STATUS), default: ANNOUNCEMENT_STATUS.DRAFT },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

announcementSchema.index({ status: 1, publishedAt: -1 }); // student-visible feed
announcementSchema.index({ course: 1, status: 1 }); // mentor / course scoping
announcementSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);