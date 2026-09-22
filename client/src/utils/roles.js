// Role names as returned by the API. Keep in sync with server/src/constants/lms.js.
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MENTOR: 'mentor',
  STUDENT: 'student',
});

// The single place role comparisons happen, so components never write `user.role === '...'`.
// This is for UX only. The API enforces the same rules independently.
export const hasRole = (user, roles) => Boolean(user) && roles.includes(user.role);

// Where a staff member's dashboard lives, or null for roles that have none.
export const getDashboardPath = (user) => {
  if (hasRole(user, [ROLES.ADMIN])) return '/admin';
  if (hasRole(user, [ROLES.MENTOR])) return '/mentor';
  return null;
};