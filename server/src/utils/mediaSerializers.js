const idOf = (value) => (value === null || value === undefined ? null : String(value));

// storageKey is NEVER included — the query that produced `doc` should not even have selected it.
export const toMedia = (doc) => ({
  id: idOf(doc._id),
  originalName: doc.originalName,
  mimeType: doc.mimeType,
  extension: doc.extension,
  size: doc.size,
  category: doc.category,
  entityType: doc.entityType,
  entityId: idOf(doc.entityId),
  course: idOf(doc.course),
  altText: doc.altText,
  status: doc.status,
  createdAt: doc.createdAt,
  uploader: doc.uploader?.name ? { name: doc.uploader.name } : undefined,
});

// Minimal, embedded directly in a resource's own response — no separate request needed per attachment.
export const toAttachmentSummary = (attachment) => ({
  mediaId: idOf(attachment.media?._id ?? attachment.media),
  title: attachment.title,
  order: attachment.order,
  originalName: attachment.media?.originalName,
  size: attachment.media?.size,
  mimeType: attachment.media?.mimeType,
});