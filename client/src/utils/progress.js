// Shared progress helpers. Percentages come from the backend for the "authoritative" numbers (My
// Learning, course progress); these format them and derive per-concept lookups the sidebar needs.

export const formatPercentage = (value) => `${Math.round(value)}%`;

// Map<conceptId, {completed, completedAt, lastAccessedAt, lastAccessedResource}> for O(1) sidebar lookups.
export const toProgressMap = (conceptProgress = []) => new Map(conceptProgress.map((row) => [row.conceptId, row]));

// A concept with no progress row is simply "not started" — never an error, never assumed complete.
export const isConceptComplete = (progressMap, conceptId) => Boolean(progressMap?.get(conceptId)?.completed);

// Derives completed/total for a set of concepts, so the backend never needs redundant module/topic fields.
export const summarizeConcepts = (concepts, progressMap) => ({
  total: concepts.length,
  completed: concepts.filter((concept) => isConceptComplete(progressMap, concept.id)).length,
});