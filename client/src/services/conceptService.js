import { createContentApi } from './contentServiceFactory.js';

const api = createContentApi({ parentPath: 'topics', path: 'concepts' });

export const getConcept = api.get;
export const createConcept = api.create; // (topicId, payload)
export const updateConcept = api.update;
export const deleteConcept = api.remove;