import { canManageCourse, canReadContent } from '../policies/courseAccess.js';
import { ENTITIES, loadContentChain } from '../services/contentAccess.service.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticationRequiredError, forbiddenError } from '../utils/authErrors.js';
import { notFoundError } from '../utils/contentErrors.js';
import { isObjectIdString } from '../utils/objectId.js';

const ACTIONS = {
  // A student must not be able to tell a draft from a nonexistent item, so read denial is a 404.
  read: { isAllowed: canReadContent, denied: notFoundError },
  manage: { isAllowed: (user, content) => canManageCourse(user, content.course), denied: forbiddenError },
};

// Run AFTER authenticate and (for writes) authorize.
//
//   requireCourseAccess('read', { param: 'id' })                                → :id is a course
//   requireCourseAccess('manage', { entity: 'topic', param: 'id' })             → :id is a topic
//
// For create routes, guard the PARENT taken from the URL, never an id from the request body:
//   POST /modules/:moduleId/topics → requireCourseAccess('manage', { entity: 'module', param: 'moduleId' })
//
// On success, req.content = { entity, node, course, path } (see contentAccess.service.js), so
// controllers never need to load the target again.
export const requireCourseAccess = (action, { entity = 'course', param = 'courseId' } = {}) => {
  const rule = ACTIONS[action];

  if (!rule || !ENTITIES.includes(entity)) {
    throw new Error(`requireCourseAccess: invalid action "${action}" or entity "${entity}"`);
  }

  // Express 5 forwards errors thrown in async middleware to the error handler.
  return async (req, _res, next) => {
    if (!req.user) {
      throw authenticationRequiredError();
    }

    const targetId = req.params[param];

    if (!isObjectIdString(targetId)) {
      throw new ApiError(400, `Invalid ${param}`);
    }

    const content = await loadContentChain(entity, targetId);

    if (!content) {
      throw notFoundError();
    }
    if (!rule.isAllowed(req.user, content)) {
      throw rule.denied();
    }

    req.content = content;
    next();
  };
};