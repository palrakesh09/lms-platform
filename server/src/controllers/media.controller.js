import { z } from 'zod';
import { MEDIA_LIMITS } from '../constants/media.js';
import * as mediaService from '../services/media.service.js';
import { assertCanReadMedia } from '../services/mediaAccess.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toMedia } from '../utils/mediaSerializers.js';
import { verifyMediaToken } from '../utils/mediaToken.js';
import { ApiError } from '../utils/ApiError.js';
import { objectIdSchema } from '../validators/fields.js';

export const upload = async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Validation failed', [{ field: 'file', message: 'A file is required' }]);
  const media = await mediaService.uploadMedia(req.user, { buffer: req.file.buffer, originalName: req.file.originalname }, req.body);
  sendSuccess(res, { statusCode: 201, message: 'File uploaded successfully', data: toMedia(media) });
};

export const list = async (req, res) => {
  const { items, pagination } = await mediaService.listMedia(req.user, req.validatedQuery);
  sendSuccess(res, { message: 'Media fetched successfully', data: items.map(toMedia), pagination });
};

export const get = async (req, res) => sendSuccess(res, { message: 'Media fetched successfully', data: toMedia(await mediaService.getMediaForManagement(req.user, req.params.id)) });

export const remove = async (req, res) => { await mediaService.deleteMedia(req.user, req.params.id); sendSuccess(res, { message: 'Media deleted' }); };

export const access = async (req, res) => {
  const media = await mediaService.loadForDelivery(req.params.id);
  await assertCanReadMedia(req.user, media);
  sendSuccess(res, { message: 'Access granted', data: await mediaService.getSignedAccessUrl(media, req.validatedQuery) });
};

// Local-storage delivery only. Accepts EITHER a valid signed token (issued by getSignedAccessUrl) OR a
// normal authenticated session — see docs/media.md for why both paths exist.
export const download = async (req, res) => {
  const media = await mediaService.loadForDelivery(req.params.id);
  const { exp, sig, disposition = 'inline' } = req.query;

  if (exp && sig) {
    if (!verifyMediaToken({ mediaId: req.params.id, expiresAt: exp, disposition, signature: sig })) {
      throw new ApiError(401, 'This link has expired or is invalid');
    }
    if (media.status !== 'active') throw new ApiError(404, 'File not found');
  } else {
    if (!req.user) throw new ApiError(401, 'Authentication required');
    await assertCanReadMedia(req.user, media);
  }

  const { getStorageProvider } = await import('../storage/index.js');
  const provider = await getStorageProvider();
  const buffer = await provider.readObject(media.storageKey);

  const safeFilename = media.originalName.replace(/[^\w.\- ]/g, '_');
  res.set({
    'Content-Type': media.mimeType,
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': `${disposition}; filename="${safeFilename}"`,
    'Content-Length': String(buffer.length),
    'Cache-Control': 'private, max-age=0, no-store',
  });
  res.removeHeader('X-Content-Options'); // remove the accidental duplicate header key above
  res.send(buffer);
};

export const resolveBatch = async (req, res) => {
  const { mediaIds } = z.object({ mediaIds: z.array(objectIdSchema).min(1).max(50) }).parse(req.body);
  sendSuccess(res, { message: 'Resolved', data: await (await import('../services/media.service.js')).resolveMany(req.user, mediaIds) });
};