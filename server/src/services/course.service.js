import { escapeRegex } from '../utils/escapeRegex.js';
import { COURSE_SORTS } from '../constants/listing.js';
import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { nextOrder } from '../utils/nextOrder.js';
import { buildPagination } from '../utils/pagination.js';
import { resolveSlug, toSlugConflict } from '../utils/slug.js';
import { deleteGuarded } from './deletion.service.js';

const SLUG_CONFLICT_MESSAGE = 'A course with this slug already exists';


// Which courses may this user list? Returns null for "none". Unknown roles get nothing.
const visibilityFilter = (user, requestedStatus) => {
  switch (user.role) {
    case ROLES.ADMIN:
      return requestedStatus ? { status: requestedStatus } : {};
    case ROLES.MENTOR:
      return { instructors: user.id, ...(requestedStatus && { status: requestedStatus }) };
    case ROLES.STUDENT:
      // Asking for drafts must not reveal anything, and must not silently answer a different question.
      return requestedStatus && requestedStatus !== CONTENT_STATUS.PUBLISHED
        ? null
        : { status: CONTENT_STATUS.PUBLISHED };
    default:
      return null;
  }
};

export const listCourses = async (query, user) => {
  const { page, limit, search, category, level, status, sort } = query;
  const visibility = visibilityFilter(user, status);

  if (!visibility) {
    return { items: [], pagination: buildPagination({ page, limit, total: 0 }) };
  }

  const filter = { ...visibility };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { shortDescription: pattern }];
  }

  const [items, total] = await Promise.all([
    Course.find(filter)
      .select('-description') // cards don't need the long description
      .sort({ ...COURSE_SORTS[sort] })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
};

// Every instructor must be an existing, active mentor. Phase 4 flagged this as required.
export const assertAssignableMentors = async (ids) => {
  if (ids.length === 0) return;

  const count = await User.countDocuments({ _id: { $in: ids }, role: ROLES.MENTOR, isActive: true });

  if (count !== ids.length) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'instructors', message: 'Every instructor must be an existing, active mentor' },
    ]);
  }
};

export const createCourse = async (input, user) => {
  const instructors = input.instructors ?? [];
  await assertAssignableMentors(instructors);

  const slug = resolveSlug(input);
  const order = input.order ?? (await nextOrder(Course));

  try {
    const course = await Course.create({
      ...input,
      slug,
      order,
      instructors,
      status: CONTENT_STATUS.DRAFT, // publishing is an explicit, admin-only operation
      createdBy: user.id, // always from the token, never the body
    });
    return course.toObject();
  } catch (error) {
    throw toSlugConflict(error, SLUG_CONFLICT_MESSAGE);
  }
};

export const updateCourse = async (courseId, input, user) => {
  if (input.instructors) {
    await assertAssignableMentors(input.instructors);
  }

  try {
    // runValidators: validators do not run on update queries unless asked.
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: { ...input, updatedBy: user.id } },
      { returnDocument: 'after', runValidators: true, lean: true },
    );

    if (!course) throw notFoundError();
    return course;
  } catch (error) {
    throw toSlugConflict(error, SLUG_CONFLICT_MESSAGE);
  }
};

export const setCourseStatus = async (courseId, status, user) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    { $set: { status, updatedBy: user.id } },
    { returnDocument: 'after', runValidators: true, lean: true },
  );

  if (!course) throw notFoundError();
  return course;
};

export const deleteCourse = (courseId) =>
  deleteGuarded(Course, courseId, [
    {
      Model: Module,
      field: 'course',
      message: 'Cannot delete course because it contains modules. Remove its modules first.',
    },
  ]);