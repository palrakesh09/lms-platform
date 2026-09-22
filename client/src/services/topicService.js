import { createContentApi } from './contentServiceFactory.js';

const api = createContentApi({ parentPath: 'modules', path: 'topics' });

export const getTopic = api.get;
export const createTopic = api.create; // (moduleId, payload)
export const updateTopic = api.update;
export const deleteTopic = api.remove;