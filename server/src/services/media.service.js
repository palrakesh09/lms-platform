import crypto from 'node:crypto';
import { ALLOWED_FILE_SIGNATURES, MEDIA_LIMITS, MEDIA_STATUS } from '../constants/media.js';
import Course from '../models/Course.js';
import Media from '../models/Media.js';
import Resource from '../models/Resource.js';
import { getStorageProvider } from '../storage/index.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { detectFileSignature } from '../utils/fileSignature.js';
import { buildPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { assertCanManageMedia, resolveMediaContext } from './mediaAccess.service.js';
import { getStorageProviderName } from '../storage/index.js';

const invalidFile = (message) => new ApiError(422, 'Validation failed', [{ field: 'file', message }]);

// The ONLY source of truth for what a file "is". Never the client's declared mimetype, filename, or
// extension. A file matching no known signature is rejected outright.
const validateFileContent = (buffer) => {
  if (!buffer || buffer.length === 0) throw invalidFile('The uploaded file is empty');
  const signature = detectFileSignature(buffer);
  if (!signature) throw invalidFile('This file type is not supported');

  const maxBytes = signature.category === 'image' ? MEDIA_LIMITS.MAX_IMAGE_BYTES : MEDIA_LIMITS.MAX_DOCUMENT_BYTES;
  if (buffer.length > maxBytes) {
    throw invalidFile(`${signature.category === 'image' ? 'Images' : 'Documents'} cannot exceed ${Math.round(maxBytes / (1024 * 1024))}MB`);
  }
  return signature;
};

export const uploadMedia = async (user, { buffer, originalName }, { entityType, entityId, altText }) => {
  const signature = validateFileContent(buffer);
  const { course } = await resolveMediaContext(entityType, entityId);
  assertCanManageMedia(user, course);

  const storageKey = `media/${course._id}/${crypto.randomUUID()}.${signature.extension}`;
  const provider = await getStorageProvider();
  await provider.putObject({ buffer, key: storageKey, contentType: signature.mimeType });

  try {
    const created = await Media.create({
      uploader: user.id,
      originalName: originalName.slice(0, MEDIA_LIMITS.MAX_ORIGINAL_NAME),
      storageKey,
      provider: getStorageProviderName(),
      mimeType: signature.mimeType,
      extension: signature.extension,
      size: buffer.length,
      category: signature.category,
      entityType,
      entityId,
      course: course._id,
      altText: altText ?? '',
      status: MEDIA_STATUS.ACTIVE,
    });
    return created.toObject();
  } catch (error) {
    // The DB write failed after the object was already stored: clean up rather than leak an orphan.
    await provider.deleteObject(storageKey).catch(() => {});
    throw error;
  }
};

export const listMedia = async (user, { courseId, category, search, page, limit }) => {
  const { course } = await resolveMediaContext('course', courseId);
  assertCanManageMedia(user, course);

  const filter = { course: course._id, status: MEDIA_STATUS.ACTIVE };
  if (category) filter.category = category;
  if (search) filter.originalName = new RegExp(escapeRegex(search), 'i');

  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).populate('uploader', 'name').lean(),
    Media.countDocuments(filter),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
};

export const getMediaForManagement = async (user, id) => {
  const media = await Media.findById(id).populate('uploader', 'name').lean();
  if (!media) throw notFoundError();
  const { course } = await resolveMediaContext('course', media.course);
  assertCanManageMedia(user, course);
  return media;
};

const isReferencedElsewhere = async (media) => {
  if (media.entityType === 'course') return Boolean(await Course.exists({ thumbnailMedia: media._id }));
  const [inContent, inAttachment] = await Promise.all([
    Resource.exists({ 'content.blocks.mediaId': String(media._id) }),
    Resource.exists({ 'attachments.media': media._id }),
  ]);
  return Boolean(inContent || inAttachment);
};

export const deleteMedia = async (user, id) => {
  const media = await Media.findById(id);
  if (!media) throw notFoundError();
  const { course } = await resolveMediaContext('course', media.course);
  assertCanManageMedia(user, course);

  if (await isReferencedElsewhere(media)) {
    throw new ApiError(409, 'This file is still in use and cannot be deleted. Remove it from the course or resource first.');
  }

  media.status = MEDIA_STATUS.DELETED;
  await media.save({ validateModifiedOnly: true });

  const withKey = await Media.findById(id).select('+storageKey').lean();
  const provider = await getStorageProvider();
  await provider.deleteObject(withKey.storageKey).catch((error) => console.error('[media] storage cleanup failed:', error.message));
};

// Loaded WITH storageKey — only ever for internal use (access/download), never returned to a client.
export const loadForDelivery = async (id) => {
  const media = await Media.findById(id).select('+storageKey').lean();
  if (!media) throw notFoundError();
  return media;
};

export const getSignedAccessUrl = async (media, { disposition }) => {
  const provider = await getStorageProvider();
  const url = await provider.getSignedUrl(media, { disposition, filename: media.originalName });
  return { url, expiresAt: new Date(Date.now() + MEDIA_LIMITS.SIGNED_URL_TTL_SECONDS * 1000).toISOString() };
};

// Batch resolution for rendering several images in one resource with ONE request, not one per image.
// Silently omits ids that don't exist or aren't authorized — the caller never learns which case applied.
export const resolveMany = async (user, ids) => {
  const docs = await Media.find({ _id: { $in: ids }, status: MEDIA_STATUS.ACTIVE }).select('+storageKey').lean();
  const { assertCanReadMedia } = await import('./mediaAccess.service.js');
  const resolved = [];
  for (const doc of docs) {
    try {
      await assertCanReadMedia(user, doc);
      resolved.push({ id: String(doc._id), ...(await getSignedAccessUrl(doc, { disposition: 'inline' })), altText: doc.altText });
    } catch {
      /* not authorized for this one; simply omit it */
    }
  }
  return resolved;
};