import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import Course from '../models/Course.js';
import Enrollment, { ENROLLMENT_STATUS } from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination } from '../utils/pagination.js';

const alreadyEnrolledError = () => new ApiError(409, 'You are already enrolled in this course');
const notEligibleError = () => new ApiError(409, 'This course is not currently open for enrollment');

// Only a currently PUBLISHED course accepts new enrollment. Reactivating a cancelled enrollment goes
// through this same check, so a course withdrawn after a student cancelled can't be silently rejoined.
export const enrollStudent = async (studentId, courseId) => {
  const course = await Course.findById(courseId, 'status').lean();
  if (!course) throw notFoundError();

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing && existing.status !== ENROLLMENT_STATUS.CANCELLED) throw alreadyEnrolledError();
  if (course.status !== CONTENT_STATUS.PUBLISHED) throw notEligibleError();

  if (existing) {
    existing.status = ENROLLMENT_STATUS.ACTIVE;
    existing.enrolledAt = new Date();
    existing.completedAt = null;
    existing.lastAccessedAt = new Date();
    await existing.save();
    return existing.toObject();
  }

  try {
    const created = await Enrollment.create({ student: studentId, course: courseId });
    return created.toObject();
  } catch (error) {
    // Two simultaneous enrollment clicks: the unique index is the final arbiter, and the loser simply
    // reports the same "already enrolled" outcome as if it had lost the race cleanly.
    if (error?.code === 11000) throw alreadyEnrolledError();
    throw error;
  }
};

export const getEnrollment = (studentId, courseId) =>
  Enrollment.findOne({ student: studentId, course: courseId }).lean();

export const listMyEnrollments = (studentId) =>
  Enrollment.find({ student: studentId, status: { $ne: ENROLLMENT_STATUS.CANCELLED } })
    .populate('course', 'title slug thumbnail level status')
    .sort({ lastAccessedAt: -1 })
    .lean();

// Batched status lookup for the course listing page: ONE query for every course id on the page,
// never one request per card.
export const getEnrollmentStatusMap = async (studentId, courseIds) => {
  if (courseIds.length === 0) return new Map();
  const rows = await Enrollment.find({ student: studentId, course: { $in: courseIds } }, 'course status').lean();
  return new Map(rows.map((row) => [String(row.course), row.status]));
};

export const cancelEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment || enrollment.status === ENROLLMENT_STATUS.CANCELLED) throw notFoundError();

  enrollment.status = ENROLLMENT_STATUS.CANCELLED;
  await enrollment.save();
  return enrollment.toObject();
};

// Called ONLY from progress.service.js after a concept is marked complete — never from a request the
// client initiates directly. Idempotent: re-checking an already-completed enrollment is a no-op.
// services/enrollment.service.js: applyCompletionIfEligible now REPORTS the transition
export const applyCompletionIfEligible = async (studentId, courseId, { completedConcepts, totalConcepts }) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId, status: { $ne: ENROLLMENT_STATUS.CANCELLED } });
  if (!enrollment) return false;

  const isComplete = totalConcepts > 0 && completedConcepts === totalConcepts;
  const nextStatus = isComplete ? ENROLLMENT_STATUS.COMPLETED : ENROLLMENT_STATUS.ACTIVE;
  if (enrollment.status === nextStatus) return false;

  enrollment.status = nextStatus;
  enrollment.completedAt = isComplete ? new Date() : null;
  await enrollment.save();
  return isComplete; // true only for incomplete -> completed
};

export const touchLastAccessed = (studentId, courseId) =>
  Enrollment.updateOne({ student: studentId, course: courseId }, { $set: { lastAccessedAt: new Date() } });

// Used by requireEnrollment. Admin/mentor never call this — see the middleware.
export const isEnrolledOrThrow = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId, status: { $ne: ENROLLMENT_STATUS.CANCELLED } }).lean();
  if (!enrollment) throw new ApiError(403, 'You must enroll in this course to access its content');
  return enrollment;
};

// ---- Admin ----

export const listAdminEnrollments = async ({ page, limit, courseId, status, search }) => {
  const filter = {};
  if (courseId) filter.course = courseId;
  if (status) filter.status = status;

  let studentIds;
  if (search) {
    const { default: User } = await import('../models/User.js');
    const pattern = new RegExp(escapeRegex(search), 'i');
    studentIds = (await User.find({ role: ROLES.STUDENT, $or: [{ name: pattern }, { email: pattern }] }, '_id').lean()).map((u) => u._id);
    filter.student = { $in: studentIds };
  }

  const [items, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
};

export const adminCancelEnrollment = async (enrollmentId) => {
  const enrollment = await Enrollment.findByIdAndUpdate(enrollmentId, { $set: { status: ENROLLMENT_STATUS.CANCELLED } }, { new: true, lean: true });
  if (!enrollment) throw notFoundError();
  return enrollment;
};

// ---- Analytics helpers (used by analytics.service.js) ----

export const getEnrollmentCountsForCourses = async (courseIds) => {
  if (courseIds.length === 0) return new Map();
  const rows = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: { course: '$course', status: '$status' }, count: { $sum: 1 } } },
  ]);
  const map = new Map();
  for (const row of rows) {
    const key = String(row._id.course);
    const entry = map.get(key) ?? { active: 0, completed: 0, cancelled: 0 };
    entry[row._id.status] = row.count;
    map.set(key, entry);
  }
  return map;
};

export const getSystemEnrollmentSummary = async () => {
  const rows = await Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return {
    total: rows.reduce((s, r) => s + r.count, 0),
    active: byStatus.active ?? 0,
    completed: byStatus.completed ?? 0,
    cancelled: byStatus.cancelled ?? 0,
  };
};