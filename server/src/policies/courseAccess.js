import { CONTENT_STATUS, ROLES } from '../constants/lms.js';

// Pure policy functions. No database access, so they are trivial to unit-test.
// `user` is req.user. `course` is { status, instructors }.
// `content` is what the chain loader returns: { course, path }, where `path` is the target node
// and its ancestors below the course.

const isInstructor = (course, userId) =>
  (course.instructors ?? []).some((instructorId) => String(instructorId) === userId);

export const isStaff = (user) => user.role === ROLES.ADMIN || user.role === ROLES.MENTOR;

// The role is re-checked here, so a demoted mentor who is still listed in `instructors` has no access.
export const canManageCourse = (user, course) => {
  if (user.role === ROLES.ADMIN) return true;
  return user.role === ROLES.MENTOR && isInstructor(course, user.id);
};

export const canReadCourse = (user, course) => {
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.MENTOR) return isInstructor(course, user.id);
  return user.role === ROLES.STUDENT && course.status === CONTENT_STATUS.PUBLISHED;
};

// Staff see any status inside courses they may read. Students need the course AND every node
// between it and the target to be published, so a published concept under a draft topic stays hidden.
export const canReadContent = (user, { course, path }) => {
  if (!canReadCourse(user, course)) return false;
  if (isStaff(user)) return true;
  return path.every((node) => node.status === CONTENT_STATUS.PUBLISHED);
};