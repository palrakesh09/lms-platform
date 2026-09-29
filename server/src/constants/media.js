import { env } from '../config/env.js';

export const MEDIA_CATEGORIES = Object.freeze({ IMAGE: 'image', DOCUMENT: 'document' });

// 'course': the media belongs to a Course thumbnail. 'concept': everything else — content images and
// resource attachments — scoped to the concept they were uploaded under (see docs/media.md for why a
// concept, not a resource, is the anchor).
export const MEDIA_ENTITY_TYPES = Object.freeze(['course', 'concept']);

// 'pending' is reserved for a future two-phase (presigned direct-upload) flow. This phase's upload is
// atomic — validate, store, then write the DB row — so nothing is ever created as 'pending' today.
export const MEDIA_STATUS = Object.freeze({ PENDING: 'pending', ACTIVE: 'active', DELETED: 'deleted' });

// The ENTIRE allowlist. Adding a new supported type is a one-line addition here, provided the format has
// a reliable magic-byte signature — nothing else in the codebase needs to change (see fileSignature.js).
export const ALLOWED_FILE_SIGNATURES = Object.freeze([
  { mimeType: 'image/jpeg', extension: 'jpg', category: MEDIA_CATEGORIES.IMAGE, bytes: [0xff, 0xd8, 0xff] },
  { mimeType: 'image/png', extension: 'png', category: MEDIA_CATEGORIES.IMAGE, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: 'image/gif', extension: 'gif', category: MEDIA_CATEGORIES.IMAGE, bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a/89a share this prefix
  { mimeType: 'image/webp', extension: 'webp', category: MEDIA_CATEGORIES.IMAGE, bytes: [0x52, 0x49, 0x46, 0x46], secondCheck: { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] } },
  { mimeType: 'application/pdf', extension: 'pdf', category: MEDIA_CATEGORIES.DOCUMENT, bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
]);

export const MEDIA_LIMITS = Object.freeze({
  MAX_IMAGE_BYTES: env.mediaMaxImageBytes,
  MAX_DOCUMENT_BYTES: env.mediaMaxDocumentBytes,
  MULTER_CEILING_BYTES: Math.max(env.mediaMaxImageBytes, env.mediaMaxDocumentBytes), // multer's own hard cap
  SIGNED_URL_TTL_SECONDS: 300,
  MAX_ORIGINAL_NAME: 255,
  MAX_ALT_TEXT: 250,
  MAX_ATTACHMENTS_PER_RESOURCE: 10,
  MAX_TITLE: 150,
});