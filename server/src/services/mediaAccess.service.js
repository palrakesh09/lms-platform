import { ROLES } from '../constants/lms.js';
import { CONTENT_STATUS } from '../constants/lms.js';
import { MEDIA_STATUS } from '../constants/media.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { canManageCourse } from '../policies/courseAccess.js';
import { loadContentChain } from './contentAccess.service.js';
import { ApiError } from '../utils/ApiError.js';
import { forbiddenError } from '../utils/authErrors.js';
import { notFoundError } from '../utils/contentErrors.js';

// Resolves the owning course for an upload/library-scope request. 'course' entityType: entityId IS the
// course. 'concept': walk up via the SAME chain-loader every other content feature uses.
export const resolveMediaContext = async (entityType, entityId) => {
  if (entityType === 'course') {
    const course = await Course.findById(entityId, 'status instructors title').lean();
    if (!course) throw notFoundError();
    return { course };
  }
  const chain = await loadContentChain('concept', entityId);
  if (!chain) throw notFoundError();
  return { course: chain.course };
};

// Upload / library / delete: admin, or the mentor assigned to this course. Students never reach this
// (the routes are authorize(ADMIN, MENTOR) already) — this is defense in depth, not the only gate.
export const assertCanManageMedia = (user, course) => {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.MENTOR && canManageCourse(user, course)) return;
  throw forbiddenError();
};

// Read (view/download): the same rule every learning-content read already follows — staff scoped to their
// courses, students only via an active enrollment for concept-scoped media, published-only (no enrollment
// needed) for course thumbnails, which must be visible while a student is still deciding to enroll.
export const assertCanReadMedia = async (user, media) => {
  if (media.status !== MEDIA_STATUS.ACTIVE) throw notFoundError();

  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.MENTOR) {
    const course = await Course.findById(media.course, 'instructors status').lean();
    if (!course || !canManageCourse(user, course)) throw forbiddenError();
    return;
  }

  if (media.entityType === 'course') {
    const course = await Course.findById(media.course, 'status').lean();
    if (!course || course.status !== CONTENT_STATUS.PUBLISHED) throw notFoundError();
    return;
  }

  const enrolled = await Enrollment.exists({ student: user.id, course: media.course, status: { $ne: 'cancelled' } });
  if (!enrolled) throw new ApiError(403, 'You must enroll in this course to access its media');
};