import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { MEDIA_LIMITS } from '../constants/media.js';
import { signMediaToken } from '../utils/mediaToken.js';

const root = path.resolve(process.cwd(), env.storageLocalDirectory);

// Defense in depth: even though `key` is always a server-generated UUID path (never derived from user
// input), refuse to resolve or touch anything outside the storage root.
const resolveSafe = (key) => {
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error('Refusing to resolve a storage key outside the storage root');
  }
  return resolved;
};

const putObject = async ({ buffer, key }) => {
  const filePath = resolveSafe(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
};

const deleteObject = async (key) => {
  try {
    await fs.unlink(resolveSafe(key));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error; // already gone is not a failure
  }
};

const readObject = (key) => fs.readFile(resolveSafe(key));

// Never returns a filesystem path or the storage key: only our own protected route, carrying a short-lived
// signature over the media id.
const getSignedUrl = (media, { expiresInSeconds = MEDIA_LIMITS.SIGNED_URL_TTL_SECONDS, disposition = 'inline' } = {}) => {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const signature = signMediaToken({ mediaId: String(media._id), expiresAt, disposition });
  const query = new URLSearchParams({ exp: String(expiresAt), sig: signature, disposition });
  return Promise.resolve(`/api/media/${media._id}/download?${query.toString()}`);
};

export default { putObject, deleteObject, readObject, getSignedUrl };