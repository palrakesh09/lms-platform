export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  MAX_PAGE: 10000,
});

// `_id` is the tie-breaker so pages never shuffle. Always spread these into .sort().
export const ORDER_SORT = { order: 1, _id: 1 };

export const COURSE_SORTS = {
  order: { order: 1, _id: 1 },
  title: { title: 1, _id: 1 },
  '-title': { title: -1, _id: 1 },
  createdAt: { createdAt: 1, _id: 1 },
  '-createdAt': { createdAt: -1, _id: 1 },
};