import Course from '../models/Course.js';
import User from '../models/User.js';
import { notFoundError } from '../utils/contentErrors.js';
import { assertAssignableMentors } from './course.service.js';

// `course` is the lean document requireCourseAccess already loaded and authorized.
export const getCourseMentors = async (course) => {
  const ids = course.instructors ?? [];
  if (ids.length === 0) return [];

  return User.find({ _id: { $in: ids } }, 'name email avatar role isActive')
    .sort({ name: 1, _id: 1 })
    .lean();
};

// Replaces the instructors list. Only NEWLY ADDED ids must be active mentors: mentors already on the
// course may stay even if they were deactivated since, so an admin can always save a list that removes them.
export const setCourseMentors = async (course, mentorIds, actor) => {
  const current = new Set((course.instructors ?? []).map(String));
  await assertAssignableMentors(mentorIds.filter((id) => !current.has(id)));

  const updated = await Course.findByIdAndUpdate(
    course._id,
    { $set: { instructors: mentorIds, updatedBy: actor.id } },
    { returnDocument: 'after', runValidators: true, lean: true },
  );

  if (!updated) throw notFoundError();
  return getCourseMentors(updated);
};