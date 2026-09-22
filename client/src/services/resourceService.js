import { createContentApi } from './contentServiceFactory.js';

const api = createContentApi({ parentPath: 'concepts', path: 'resources' });

export const getResourceById = api.get; // used by the learner's resource viewer
export const createResource = api.create; // (conceptId, payload)
export const updateResource = api.update;
export const deleteResource = api.remove;