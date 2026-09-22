import { ROLES } from '../constants/lms.js';
import { USER_SORTS } from '../constants/users.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination } from '../utils/pagination.js';

export const listUsers = async ({ page, limit, search, role, isActive, sort }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  // The password hash is excluded by the schema (select: false), and the serializer whitelists fields as well.
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ ...USER_SORTS[sort] })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
};

export const getUser = async (userId) => {
  const user = await User.findById(userId, null, { lean: true });
  if (!user) throw notFoundError();
  return user;
};

// Administrators (including the caller) can't be changed through the API. That prevents lockout and any
// admin-on-admin changes. Admin accounts are managed with the create-admin CLI script.
const findManageableUser = async (userId, actor) => {
  const target = await User.findById(userId, 'role', { lean: true });

  if (!target) throw notFoundError();
  if (String(target._id) === actor.id) throw new ApiError(403, 'You cannot change your own account here');
  if (target.role === ROLES.ADMIN) throw new ApiError(403, 'Administrator accounts cannot be changed here');
  return target;
};

// Takes effect immediately: `authenticate` loads the user on every request and rejects inactive accounts.
export const setUserStatus = async (userId, isActive, actor) => {
  await findManageableUser(userId, actor);

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    { returnDocument: 'after', runValidators: true, lean: true },
  );

  if (!updated) throw notFoundError();
  return updated;
};

export const setUserRole = async (userId, role, actor) => {
  const target = await findManageableUser(userId, actor);

  if (target.role === role) return getUser(userId); // nothing to do

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { returnDocument: 'after', runValidators: true, lean: true },
  );
  if (!updated) throw notFoundError();

  // A demoted mentor must not stay in any course's instructors list. Access is already safe because
  // the policy re-checks the role on every request, but the list should not carry stale entries.
  if (target.role === ROLES.MENTOR) {
    await Course.updateMany({ instructors: updated._id }, { $pull: { instructors: updated._id } });
  }
  return updated;
};