import mongoose from 'mongoose';
import { NOTIFICATION_ENTITY_TYPES, NOTIFICATION_LIMITS as L, NOTIFICATION_TYPES } from '../constants/notifications.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// Created ONLY by the server (notification.service.js). No API accepts a recipient, type or link.
const notificationSchema = new Schema(
  {
    recipient: requiredRef('User'),
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true, trim: true, maxlength: L.MAX_TITLE },
    message: { type: String, trim: true, default: '', maxlength: L.MAX_MESSAGE },
    entityType: { type: String, enum: NOTIFICATION_ENTITY_TYPES, default: null },
    entityId: { type: Schema.Types.ObjectId, default: null },
    parentId: { type: Schema.Types.ObjectId, default: null }, // e.g. the quiz of a quiz_attempt
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    dedupeKey: { type: String, maxlength: 200, select: false },
  },
  { timestamps: true },
);

// Unread count and "unread only" listing (equality on recipient + isRead, newest first).
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// Full listing, newest first.
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Database-level duplicate guard: one notification per (recipient, business event).
notificationSchema.index({ recipient: 1, dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } });
// Optional expiry: only documents that have an expiresAt are ever removed.
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);