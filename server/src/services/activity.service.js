import mongoose from 'mongoose';
import LearningActivity from '../models/LearningActivity.js';
import { buildPagination } from '../utils/pagination.js';
import { rangeStart } from '../utils/analyticsDefinitions.js';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

// Idempotent per (user, dedupeKey). Called only from notification.events.js.
export const recordActivity = async ({ userId, type, course = null, concept = null, resource = null, quiz = null, title = '', metadata, dedupeKey }) => {
  try {
    await LearningActivity.updateOne(
      { user: userId, dedupeKey },
      { $setOnInsert: { type, course, concept, resource, quiz, title, ...(metadata ? { metadata } : {}) } },
      { upsert: true },
    );
  } catch (error) {
    if (error?.code !== 11000) throw error; // a concurrent duplicate is fine
  }
};

// A student's OWN feed. The user id is always the authenticated caller.
export const listOwnActivity = async (userId, { page, limit, courseId }) => {
  const query = { user: userId, ...(courseId ? { course: courseId } : {}) };
  const [items, total] = await Promise.all([
    LearningActivity.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).populate('course', 'title').lean(),
    LearningActivity.countDocuments(query),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
};

// Staff view: counts only, never individual learners. Access to the course is checked by the route.
export const getCourseActivitySummary = async (courseId, days) => {
  const match = { course: oid(courseId), createdAt: { $gte: rangeStart(days) } };
  const [out] = await LearningActivity.aggregate([
    { $match: match },
    {
      $facet: {
        byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
        learners: [{ $group: { _id: '$user' } }, { $count: 'n' }],
      },
    },
  ]);
  return {
    totals: Object.fromEntries((out?.byType ?? []).map((row) => [row._id, row.count])),
    activeLearners: out?.learners?.[0]?.n ?? 0,
  };
};