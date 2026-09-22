import Concept from '../models/Concept.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Resource from '../models/Resource.js';
import Topic from '../models/Topic.js';

// Each node stores only its immediate parent (Phase 2), so the owning course is found by walking
// upward: resource → concept → topic → module → course. Parent references are immutable, so a node
// cannot be re-parented to escape an ownership check.
const LEVELS = {
  course: { Model: Course, parent: null },
  module: { Model: Module, parent: 'course', parentField: 'course' },
  topic: { Model: Topic, parent: 'module', parentField: 'module' },
  concept: { Model: Concept, parent: 'topic', parentField: 'topic' },
  resource: { Model: Resource, parent: 'concept', parentField: 'concept' },
};

export const ENTITIES = Object.freeze(Object.keys(LEVELS));

// Ancestors are loaded with only what the walk and the policy need.
const ancestorProjection = (entity) =>
  entity === 'course' ? 'status instructors' : `${LEVELS[entity].parentField} status`;

// Loads the target (full document) and every ancestor up to the course: one primary-key lookup per level.
// Returns null if the node OR ANY ANCESTOR is missing, so an orphaned node is simply "not found".
//
//   { entity, node, course, path }
//   node   the target document (for entity "course", the course itself)
//   course the owning course
//   path   the target and its ancestors below the course (empty for entity "course")
export const loadContentChain = async (entity, id) => {
  const chain = [];
  let currentEntity = entity;
  let doc = await LEVELS[entity].Model.findById(id, null, { lean: true });

  while (doc) {
    chain.push({ entity: currentEntity, doc });
    const level = LEVELS[currentEntity];

    if (!level.parent) {
      return {
        entity,
        node: chain[0].doc,
        course: doc,
        path: chain.slice(0, -1).map((link) => link.doc),
      };
    }

    doc = await LEVELS[level.parent].Model.findById(doc[level.parentField], ancestorProjection(level.parent), {
      lean: true,
    });
    currentEntity = level.parent;
  }

  return null;
};