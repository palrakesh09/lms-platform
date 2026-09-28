import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import { ANNOUNCEMENT_AUDIENCE as A, ANNOUNCEMENT_STATUS as S, NOTIFICATION_TYPES } from '../constants/notifications.js';
import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { canManageCourse } from '../policies/courseAccess.js';
import { ApiError } from '../utils/ApiError.js';
import { forbiddenError } from '../utils/authErrors.js';
import { notFoundError } from '../utils/contentErrors.js';
import { buildPagination } from '../utils/pagination.js';
import { enrolledStudentsCursor } from './notification.events.js';
import { notifyFromCursor } from './notification.service.js';

const invalid = (field, message) => new ApiError(422, 'Validation failed', [{ field, message }]);

// Who may target what. Admin: any audience. Mentor: ONLY course_students for a course they manage —
// never a system-wide audience, never someone else's course. Enforced here, not in the UI.
const assertAudience = async (user, audienceType, courseId) => {
  if (audienceType !== A.COURSE_STUDENTS) {
    if (courseId) throw invalid('courseId', 'courseId is only allowed for course_students');
    if (user.role !== ROLES.ADMIN) throw forbiddenError();
    return;
  }
  if (!courseId) throw invalid('courseId', 'courseId is required for course_students');
  const course = await Course.findById(courseId, 'status instructors').lean();
  if (!course) throw notFoundError();
  if (!canManageCourse(user, course)) throw forbiddenError();
};

// Admin: any announcement. Mentor: only ones THEY created, and only while they still manage the course.
const assertCanWrite = async (user, announcement) => {
  if (user.role === ROLES.ADMIN) return;
  if (String(announcement.createdBy) !== user.id) throw forbiddenError();
  const course = announcement.course ? await Course.findById(announcement.course, 'status instructors').lean() : null;
  if (!course || !canManageCourse(user, course)) throw forbiddenError();
};

const loadForWrite = async (id, user) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) throw notFoundError();
  await assertCanWrite(user, announcement);
  return announcement;
};

export const createAnnouncement = async (input, user) => {
  await assertAudience(user, input.audienceType, input.courseId);
  const created = await Announcement.create({
    title: input.title,
    message: input.message,
    audienceType: input.audienceType,
    course: input.courseId ?? null,
    createdBy: user.id,
    status: S.DRAFT,
  });
  return created.toObject();
};

export const updateAnnouncement = async (id, input, user) => {
  const announcement = await loadForWrite(id, user);
  if (announcement.status !== S.DRAFT) throw new ApiError(409, 'A published announcement can no longer be edited');

  const audienceType = input.audienceType ?? announcement.audienceType;
  const courseId = input.courseId ?? (audienceType === A.COURSE_STUDENTS ? announcement.course : null);
  await assertAudience(user, audienceType, courseId);

  if (input.title !== undefined) announcement.title = input.title;
  if (input.message !== undefined) announcement.message = input.message;
  announcement.audienceType = audienceType;
  announcement.course = courseId ?? null;
  await announcement.save();
  return announcement.toObject();
};

export const deleteAnnouncement = async (id, user) => {
  const announcement = await loadForWrite(id, user);
  await announcement.deleteOne(); // notifications already delivered are kept
};

// Streams the audience: nothing is loaded whole, and each batch is one bulkWrite.
const deliver = (announcement) => {
  const payload = {
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    title: announcement.title,
    message: announcement.message,
    entityType: 'announcement',
    entityId: announcement._id,
    course: announcement.course,
  };
  const options = { dedupeKey: `announcement:${announcement._id}` };

  if (announcement.audienceType === A.ALL_STUDENTS) {
    return notifyFromCursor(User.find({ role: ROLES.STUDENT, isActive: true }, '_id').lean().cursor(), (d) => d._id, payload, options);
  }
  if (announcement.audienceType === A.ENROLLED_STUDENTS) {
    const students = Enrollment.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: '$student' } }]).cursor();
    return notifyFromCursor(students, (d) => d._id, payload, options);
  }
  return notifyFromCursor(enrolledStudentsCursor(announcement.course), (d) => d.student, payload, options);
};

// Publishing is an atomic draft -> published flip. Only the request that wins the flip delivers, so a
// repeated or concurrent publish creates no duplicate notifications (and the dedupeKey backs that up).
export const publishAnnouncement = async (id, user) => {
  const announcement = await loadForWrite(id, user);
  await assertAudience(user, announcement.audienceType, announcement.course); // re-check: ownership may have changed since drafting

  const published = await Announcement.findOneAndUpdate(
    { _id: id, status: S.DRAFT },
    { $set: { status: S.PUBLISHED, publishedAt: new Date() } },
    { new: true, lean: true },
  );
  if (!published) throw new ApiError(409, 'This announcement has already been published');

  const recipients = await deliver(published);
  return { announcement: published, recipients };
};

// ---- reads (role-scoped) ------------------------------------------------------------------------

const studentAudienceFilter = async (userId) => {
  const enrollments = await Enrollment.find({ student: userId, status: { $ne: 'cancelled' } }, 'course').lean();
  const or = [{ audienceType: A.ALL_STUDENTS }];
  if (enrollments.length) {
    or.push({ audienceType: A.ENROLLED_STUDENTS }, { audienceType: A.COURSE_STUDENTS, course: { $in: enrollments.map((e) => e.course) } });
  }
  return { status: S.PUBLISHED, $or: or };
};

export const listAnnouncements = async ({ page, limit, status, courseId }, user) => {
  let filter = {};
  let sort = { createdAt: -1, _id: -1 };

  if (user.role === ROLES.STUDENT) {
    filter = await studentAudienceFilter(user.id);
    sort = { publishedAt: -1, _id: -1 };
  } else {
    if (status) filter.status = status;
    if (user.role === ROLES.MENTOR) {
      const owned = (await Course.find({ instructors: user.id }, '_id').lean()).map((c) => String(c._id));
      filter.course = courseId ? { $in: owned.includes(courseId) ? [courseId] : [] } : { $in: owned };
    } else if (courseId) {
      filter.course = courseId;
    }
  }

  const [items, total] = await Promise.all([
    Announcement.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('course', 'title').lean(),
    Announcement.countDocuments(filter),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
};

// Anything the caller may not read is a 404, so ids can't be probed.
export const getAnnouncement = async (id, user) => {
  const announcement = await Announcement.findById(id).populate('course', 'title').lean();
  if (!announcement) throw notFoundError();
  if (user.role === ROLES.ADMIN) return announcement;

  if (user.role === ROLES.MENTOR) {
    const owns = announcement.course && (await Course.exists({ _id: announcement.course._id, instructors: user.id }));
    if (!owns) throw notFoundError();
    return announcement;
  }

  if (announcement.status !== S.PUBLISHED) throw notFoundError();
  if (announcement.audienceType === A.ALL_STUDENTS) return announcement;
  const filter = { student: user.id, status: { $ne: 'cancelled' } };
  if (announcement.audienceType === A.COURSE_STUDENTS) filter.course = announcement.course?._id;
  if (!(await Enrollment.exists(filter))) throw notFoundError();
  return announcement;
};

export { CONTENT_STATUS };