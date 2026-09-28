export const SEARCH_TYPES = Object.freeze(['course', 'module', 'topic', 'concept', 'resource', 'quiz']);
export const CONTENT_TYPES = Object.freeze(SEARCH_TYPES.filter((type) => type !== 'course'));
export const SEARCH_SORTS = Object.freeze(['relevance', 'title', 'updated']);

// Order used to break relevance ties between different entity types.
export const TYPE_RANK = Object.freeze({ course: 0, module: 1, topic: 2, concept: 3, resource: 4, quiz: 5 });

export const SEARCH_LIMITS = Object.freeze({
  MIN_QUERY: 2,
  MAX_QUERY: 100,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  MAX_PAGE: 100, // each type returns its top page*limit rows, so deep paging is capped
  DESCRIPTION_PREVIEW: 160,
});