import { env } from '../config/env.js';

// The S3 SDK is only imported (and therefore only needs to be installed/available) when actually
// selected — a local-only development setup never loads it.
const load = async () => (env.storageProvider === 's3' ? import('./s3Provider.js') : import('./localProvider.js'));

let cached;
// Every provider implements: putObject({buffer, key, contentType}), deleteObject(key),
// getSignedUrl(media, {expiresInSeconds, disposition, filename}).
export const getStorageProvider = async () => {
  cached ??= { name: env.storageProvider, impl: (await load()).default };
  return cached.impl;
};

export const getStorageProviderName = () => env.storageProvider;