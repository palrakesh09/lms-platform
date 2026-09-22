import { ROLES } from './lms.js';

// `_id` is the tie-breaker so pages never shuffle.
export const USER_SORTS = Object.freeze({
  '-createdAt': { createdAt: -1, _id: -1 },
  createdAt: { createdAt: 1, _id: 1 },
  name: { name: 1, _id: 1 },
  '-name': { name: -1, _id: 1 },
});

// Roles an administrator may grant through the API. `admin` is deliberately absent: admins are created
// only by the create-admin CLI script.
export const ASSIGNABLE_ROLES = Object.freeze([ROLES.STUDENT, ROLES.MENTOR]);