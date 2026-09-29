import { apiClient } from './apiClient.js';
const encode = encodeURIComponent;

export const uploadMedia = async ({ file, entityType, entityId, altText }, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  form.append('entityType', entityType);
  form.append('entityId', entityId);
  if (altText) form.append('altText', altText);

  const { data } = await apiClient.post('/media/upload', form, {
    onUploadProgress: (event) => onProgress?.(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
  });
  return data.data;
};

export const getMediaAccessUrl = async (mediaId, disposition = 'inline') =>
  (await apiClient.get(`/media/${encode(mediaId)}/access`, { params: { disposition } })).data.data;

export const resolveMediaBatch = async (mediaIds) => (await apiClient.post('/media/resolve-batch', { mediaIds })).data.data;

export const deleteMedia = async (mediaId) => { await apiClient.delete(`/media/${encode(mediaId)}`); };