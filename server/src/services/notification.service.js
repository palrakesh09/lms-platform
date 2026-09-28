import { NOTIFICATION_LIMITS as L } from '../constants/notifications.js';
import Notification from '../models/Notification.js';
import { notFoundError } from '../utils/contentErrors.js';
import { buildPagination } from '../utils/pagination.js';

// A concurrent duplicate is an expected outcome (the unique index doing its job), not a failure.
const isOnlyDuplicateKey = (error) => error?.code === 11000 || (Array.isArray(error?.writeErrors) && error.writeErrors.every((e) => e.code === 11000));

// Idempotent bulk create: one upsert per recipient keyed by (recipient, dedupeKey). Existing rows are
// left untouched, so calling this twice for the same business event creates nothing the second time.
// Returns how many notifications were actually created. `recipientIds` are chosen by the SERVER.
export const notifyMany = async (recipientIds, payload, { dedupeKey }) => {
  let created = 0;
  for (let i = 0; i < recipientIds.length; i += L.BATCH_SIZE) {
    const ops = recipientIds.slice(i, i + L.BATCH_SIZE).map((recipient) => ({
      updateOne: {
        filter: { recipient, dedupeKey },
        update: { $setOnInsert: { ...payload, isRead: false, readAt: null } },
        upsert: true,
      },
    }));
    try {
      const result = await Notification.bulkWrite(ops, { ordered: false });
      created += result.upsertedCount ?? 0;
    } catch (error) {
      if (!isOnlyDuplicateKey(error)) throw error;
    }
  }
  return created;
};

// Streams a large audience (a Mongo cursor) in batches instead of loading it into memory.
export const notifyFromCursor = async (cursor, idOf, payload, options) => {
  let batch = [];
  let created = 0;
  for await (const doc of cursor) {
    batch.push(idOf(doc));
    if (batch.length >= L.BATCH_SIZE) {
      created += await notifyMany(batch, payload, options);
      batch = [];
    }
  }
  if (batch.length) created += await notifyMany(batch, payload, options);
  return created;
};

export const notifyOne = (recipientId, payload, options) => notifyMany([recipientId], payload, options);

// ---- reads and user actions: every query is scoped to the caller's own id ----

export const countUnread = (userId) => Notification.countDocuments({ recipient: userId, isRead: false });

export const listForUser = async (userId, { page, limit, filter }) => {
  const query = { recipient: userId, ...(filter === 'unread' ? { isRead: false } : {}) };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(query),
    countUnread(userId),
  ]);
  return { items, unreadCount, pagination: buildPagination({ page, limit, total }) };
};

// Idempotent: marking an already-read notification is a success. Someone else's id is a 404, not a 403,
// so ids can't be probed.
export const markRead = async (userId, id) => {
  await Notification.updateOne({ _id: id, recipient: userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  const notification = await Notification.findOne({ _id: id, recipient: userId }).lean();
  if (!notification) throw notFoundError();
  return notification;
};

// One database operation; nothing is loaded into Node.
export const markAllRead = async (userId) => {
  const result = await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  return result.modifiedCount;
};

export const remove = async (userId, id) => {
  const result = await Notification.deleteOne({ _id: id, recipient: userId });
  if (result.deletedCount === 0) throw notFoundError();
};