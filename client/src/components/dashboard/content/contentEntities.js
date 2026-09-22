import { createConcept, deleteConcept, getConcept, updateConcept } from '../../../services/conceptService.js';
import { createModule, deleteModule, getModule, updateModule } from '../../../services/moduleService.js';
import { createResource, deleteResource, getResourceById, updateResource } from '../../../services/resourceService.js';
import { createTopic, deleteTopic, getTopic, updateTopic } from '../../../services/topicService.js';

// Per-level configuration so one set of modals, actions and tree code serves all four levels.
export const CONTENT_ENTITIES = Object.freeze({
  module: {
    label: 'module',
    api: { get: getModule, create: createModule, update: updateModule, remove: deleteModule },
    deleteHint: 'A module that still contains topics can’t be deleted. Remove its topics first.',
  },
  topic: {
    label: 'topic',
    api: { get: getTopic, create: createTopic, update: updateTopic, remove: deleteTopic },
    deleteHint: 'A topic that still contains concepts can’t be deleted. Remove its concepts first.',
  },
  concept: {
    label: 'concept',
    api: { get: getConcept, create: createConcept, update: updateConcept, remove: deleteConcept },
    deleteHint: 'A concept that still has resources, or that students have made progress on, can’t be deleted.',
  },
  resource: {
    label: 'resource',
    api: { get: getResourceById, create: createResource, update: updateResource, remove: deleteResource },
    deleteHint: '',
  },
});