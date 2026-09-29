import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Signs "this media id may be downloaded until this time, with this disposition" for local storage's
// self-served download link. The token never contains the storage key — only the id is exposed, and the
// server re-resolves the key from the database on every download.
const sign = (payload) => crypto.createHmac('sha256', env.mediaSigningSecret).update(payload).digest('hex');

export const signMediaToken = ({ mediaId, expiresAt, disposition }) => {
  const payload = `${mediaId}.${expiresAt}.${disposition}`;
  return sign(payload);
};

export const verifyMediaToken = ({ mediaId, expiresAt, disposition, signature }) => {
  const expNumber = Number(expiresAt);
  if (!Number.isFinite(expNumber) || Date.now() > expNumber) return false;
  if (typeof signature !== 'string') return false;

  const expected = Buffer.from(sign(`${mediaId}.${expiresAt}.${disposition}`));
  const provided = Buffer.from(signature);
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
};