import { CONTENT_STATUS } from '../constants/lms.js';
import { canManageCourse, canReadCourse, isStaff } from './courseAccess.js';

// A quiz is visible to:
//  - admin: always, if the course itself is readable (it always is for admins)
//  - mentor: any status, if they may manage the quiz's course — matches content-node behavior
//  - student: only when the quiz itself is published AND every node between it and the course
//    (its attachment's ancestors) is currently published
export const canReadQuiz = (user, quiz, context) => {
  if (!canReadCourse(user, context.course)) return false;
  if (isStaff(user)) return true;
  return quiz.status === CONTENT_STATUS.PUBLISHED && context.path.every((node) => node.status === CONTENT_STATUS.PUBLISHED);
};

export const canManageQuiz = (user, context) => canManageCourse(user, context.course);