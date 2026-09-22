import { createContentApi } from './contentServiceFactory.js';

const api = createContentApi({ parentPath: 'courses', path: 'modules' });

export const getModule = api.get;
export const createModule = api.create; // (courseId, payload)
export const updateModule = api.update;
export const deleteModule = api.remove;