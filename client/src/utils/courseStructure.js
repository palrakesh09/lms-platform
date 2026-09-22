// Helpers over the API's structure tree: { course, modules[ topics[ concepts[ resources[] ] ] ] }.
// The tree is used as returned by the backend (already sorted by `order`). Nothing is reshaped.

// Every resource in display order, with the nodes it sits under.
// The first entry is the default learning item, and the list doubles as a membership check:
// an id that is not in it does not belong to this course.
export const flattenResources = (structure) => {
  const entries = [];

  for (const module of structure?.modules ?? []) {
    for (const topic of module.topics ?? []) {
      for (const concept of topic.concepts ?? []) {
        for (const resource of concept.resources ?? []) {
          entries.push({ resource, concept, topic, module });
        }
      }
    }
  }
  return entries;
};

export const findEntry = (entries, resourceId) =>
  resourceId ? (entries.find((entry) => entry.resource.id === resourceId) ?? null) : null;

export const countStructure = (structure) => {
  const counts = { modules: 0, topics: 0, concepts: 0, resources: 0 };

  for (const module of structure?.modules ?? []) {
    counts.modules += 1;
    for (const topic of module.topics ?? []) {
      counts.topics += 1;
      for (const concept of topic.concepts ?? []) {
        counts.concepts += 1;
        counts.resources += (concept.resources ?? []).length;
      }
    }
  }
  return counts;
};