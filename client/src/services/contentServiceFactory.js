import { apiClient } from './apiClient.js';

const encode = encodeURIComponent;

// Module, topic, concept and resource routes differ only in their paths:
//   create   POST   /<parentPath>/:parentId/<path>     (the parent comes from the URL, never the body)
//   get      GET    /<path>/:id
//   update   PATCH  /<path>/:id
//   remove   DELETE /<path>/:id
export const createContentApi = ({ parentPath, path }) => ({
  get: async (id, signal) => (await apiClient.get(`/${path}/${encode(id)}`, { signal })).data.data,
  create: async (parentId, payload) =>
    (await apiClient.post(`/${parentPath}/${encode(parentId)}/${path}`, payload)).data.data,
  update: async (id, payload) => (await apiClient.patch(`/${path}/${encode(id)}`, payload)).data.data,
  remove: async (id) => {
    await apiClient.delete(`/${path}/${encode(id)}`);
  },
});