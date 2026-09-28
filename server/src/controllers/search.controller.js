import { CONTENT_TYPES, SEARCH_TYPES } from '../constants/search.js';
import * as searchService from '../services/search.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const run = async (req, res, { types, courseId }) => {
  const { q, sort, page, limit } = req.validatedQuery;
  const scope = await searchService.resolveScope(req.user, courseId);
  const { results, pagination } = await searchService.search({ q, types, sort, page, limit }, scope);
  sendSuccess(res, { message: 'Search completed', data: results, pagination });
};

export const global = (req, res) => {
  const { type, courseId } = req.validatedQuery;
  return run(req, res, { types: type === 'all' ? [...SEARCH_TYPES] : [type], courseId });
};

// requireCourseAccess + requireEnrollment already ran; the scope is still re-derived from the database,
// so this route can never be more permissive than the global one.
export const course = (req, res) => {
  const { type } = req.validatedQuery;
  return run(req, res, { types: type === 'all' ? [...CONTENT_TYPES] : [type], courseId: req.content.course._id });
};