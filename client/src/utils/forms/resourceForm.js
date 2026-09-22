import { CONTENT_STATUS_OPTIONS, RESOURCE_TYPE_OPTIONS, valuesOf } from '../enums.js';
import { getSafeUrl } from '../safeUrl.js';
import { URL_MESSAGE, collect, lengthError, orderError, orderToInput, parseOrder } from './common.js';

export const emptyResourceValues = Object.freeze({
  type: 'theory',
  title: '',
  description: '',
  url: '',
  openInNewTab: true,
  order: '',
  status: 'draft',
});

export const resourceToFormValues = (resource) => ({
  type: resource.type ?? 'theory',
  title: resource.title ?? '',
  description: resource.description ?? '',
  url: resource.url ?? '',
  openInNewTab: resource.openInNewTab !== false,
  order: orderToInput(resource.order),
  status: resource.status ?? 'draft',
});

export const validateResourceForm = (values) => {
  const url = values.url.trim();

  return collect([
    ['type', valuesOf(RESOURCE_TYPE_OPTIONS).includes(values.type) ? null : 'Choose a resource type'],
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['description', lengthError('Description', values.description, { max: 1000 })],
    ['url', !url ? 'URL is required' : !getSafeUrl(url) || url.length > 2048 ? URL_MESSAGE : null],
    ['order', orderError(values.order)],
    ['status', valuesOf(CONTENT_STATUS_OPTIONS).includes(values.status) ? null : 'Choose a status'],
  ]);
};

export const buildResourcePayload = (values) => {
  const payload = {
    type: values.type,
    title: values.title.trim(),
    description: values.description.trim(),
    url: values.url.trim(),
    openInNewTab: Boolean(values.openInNewTab),
    status: values.status,
  };

  const order = parseOrder(values.order);
  if (order !== undefined) payload.order = order;

  return payload;
};