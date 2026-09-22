import Course from '../models/Course.js';
import User from '../models/User.js';

// Two aggregations (one per collection) instead of one request per number.
export const getAdminStats = async () => {
  const [courseGroups, userGroups] = await Promise.all([
    Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: { role: '$role', isActive: '$isActive' }, count: { $sum: 1 } } }]),
  ]);

  const coursesByStatus = Object.fromEntries(courseGroups.map((group) => [group._id, group.count]));
  const courses = {
    published: coursesByStatus.published ?? 0,
    draft: coursesByStatus.draft ?? 0,
    archived: coursesByStatus.archived ?? 0,
  };
  courses.total = courses.published + courses.draft + courses.archived;

  const users = { total: 0, active: 0, inactive: 0, admins: 0, mentors: 0, students: 0 };
  const roleKey = { admin: 'admins', mentor: 'mentors', student: 'students' };

  for (const { _id, count } of userGroups) {
    users.total += count;
    users[_id.isActive ? 'active' : 'inactive'] += count;
    if (roleKey[_id.role]) users[roleKey[_id.role]] += count;
  }

  return { courses, users };
};