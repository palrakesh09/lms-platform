export const SEARCH_TYPES = ['course', 'module', 'topic', 'concept', 'resource', 'quiz'];
export const TYPE_LABELS = { course: 'Course', module: 'Module', topic: 'Topic', concept: 'Concept', resource: 'Resource', quiz: 'Quiz' };
export const GROUP_LABELS = { course: 'Courses', module: 'Modules', topic: 'Topics', concept: 'Concepts', resource: 'Resources', quiz: 'Quizzes' };
export const MIN_QUERY = 2;

export const normalizeQuery = (value) => (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);

// Results carry server-built internal paths. Anything that is not a plain in-app path is neutralized.
export const toSafeInternalPath = (url) => (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : '/');

// Groups one page of results by type, in a fixed display order, skipping empty groups.
export const groupByKind = (items) =>
  SEARCH_TYPES.map((type) => ({ type, label: GROUP_LABELS[type], items: items.filter((item) => item.type === type) })).filter((g) => g.items.length > 0);

// In-course sidebar filter over the ALREADY-LOADED structure (no request per keystroke).
// A match keeps its own subtree; an ancestor is kept only when something below it matches. `_index`
// preserves original "Module 03" numbering. expandedIds lists every module/topic that remains, so matches
// are revealed. Returns the original structure and null expandedIds for an empty query.
export const filterStructure = (structure, query) => {
  const q = normalizeQuery(query).toLowerCase();
  if (!q) return { structure, expandedIds: null, conceptCount: null };

  const hit = (text) => (text ?? '').toLowerCase().includes(q);

  const filterConcepts = (concepts, keepAll) =>
    keepAll
      ? concepts
      : concepts
          .map((concept) => {
            const resources = hit(concept.title) ? concept.resources ?? [] : (concept.resources ?? []).filter((r) => hit(r.title));
            return hit(concept.title) || resources.length ? { ...concept, resources } : null;
          })
          .filter(Boolean);

  const filterTopics = (topics, keepAll) =>
    topics
      .map((topic, index) => {
        if (keepAll) return { ...topic, _index: index };
        const concepts = filterConcepts(topic.concepts ?? [], hit(topic.title));
        return hit(topic.title) || concepts.length ? { ...topic, _index: index, concepts } : null;
      })
      .filter(Boolean);

  const modules = (structure.modules ?? [])
    .map((module, index) => {
      const topics = filterTopics(module.topics ?? [], hit(module.title));
      return hit(module.title) || topics.length ? { ...module, _index: index, topics } : null;
    })
    .filter(Boolean);

  const expandedIds = new Set();
  let conceptCount = 0;
  for (const module of modules) {
    expandedIds.add(module.id);
    for (const topic of module.topics) {
      expandedIds.add(topic.id);
      conceptCount += (topic.concepts ?? []).length;
    }
  }
  return { structure: { ...structure, modules }, expandedIds, conceptCount };
};