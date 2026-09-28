import { CONTENT_STATUS_OPTIONS, RESOURCE_TYPE_OPTIONS, valuesOf } from '../enums.js';
import { getSafeUrl } from '../safeUrl.js';
import { validateContent } from './contentValidation.js';
import { URL_MESSAGE, collect, lengthError, orderError, orderToInput, parseOrder } from './common.js';

export const emptyResourceValues = Object.freeze({
  type: 'theory', title: '', description: '', url: '', openInNewTab: true, order: '', status: 'draft',
  content: { version: 1, blocks: [] },
});

export const resourceToFormValues = (resource) => ({
  type: resource.type ?? 'theory',
  title: resource.title ?? '',
  description: resource.description ?? '',
  url: resource.url ?? '',
  openInNewTab: resource.openInNewTab !== false,
  order: orderToInput(resource.order),
  status: resource.status ?? 'draft',
  content: resource.content && Array.isArray(resource.content.blocks) ? resource.content : { version: 1, blocks: [] },
});

// Mirrors the server's own rule (resource.service.js's hasUsableContent) so the form can give an
// immediate, friendly error instead of waiting for a round trip.
const hasUsableContent = (values) => Boolean(values.url?.trim()) || (values.content?.blocks?.length ?? 0) > 0;

export const validateResourceForm = (values) => {
  const url = values.url.trim();
  const contentError = validateContent(values.content);

  const errors = collect([
    ['type', valuesOf(RESOURCE_TYPE_OPTIONS).includes(values.type) ? null : 'Choose a resource type'],
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['description', lengthError('Description', values.description, { max: 1000 })],
    ['url', url && (!getSafeUrl(url) || url.length > 2048) ? URL_MESSAGE : null],
    ['content', contentError],
    ['order', orderError(values.order)],
    ['status', valuesOf(CONTENT_STATUS_OPTIONS).includes(values.status) ? null : 'Choose a status'],
  ]);

  if (!errors.content && !hasUsableContent(values)) {
    if (!url) errors.url = 'URL is required';
    else errors.content = 'Provide an external URL, at least one content block, or both.';
  }
  return errors;
};

export const buildResourcePayload = (values) => {
  const payload = {
    type: values.type,
    title: values.title.trim(),
    description: values.description.trim(),
    url: values.url.trim(),
    content: { version: 1, blocks: values.content?.blocks ?? [] },
    openInNewTab: Boolean(values.openInNewTab),
    status: values.status,
  };
  const order = parseOrder(values.order);
  if (order !== undefined) payload.order = order;
  return payload;
};