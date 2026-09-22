import { CONTENT_STATUS_OPTIONS, valuesOf } from '../enums.js';
import { SLUG_MESSAGE, SLUG_PATTERN, collect, lengthError, orderError, orderToInput, parseOrder } from './common.js';

// Shared by modules, topics and concepts. The parent is never a form field: it comes from the URL of the request.
export const emptyNodeValues = Object.freeze({ title: '', slug: '', description: '', order: '', status: 'draft' });

export const nodeToFormValues = (node) => ({
  title: node.title ?? '',
  slug: node.slug ?? '',
  description: node.description ?? '',
  order: orderToInput(node.order),
  status: node.status ?? 'draft',
});

export const validateNodeForm = (values) => {
  const slug = values.slug.trim();

  return collect([
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['slug', slug && (!SLUG_PATTERN.test(slug.toLowerCase()) ? SLUG_MESSAGE : lengthError('Slug', slug, { max: 160 }))],
    ['description', lengthError('Description', values.description, { max: 2000 })],
    ['order', orderError(values.order)],
    ['status', valuesOf(CONTENT_STATUS_OPTIONS).includes(values.status) ? null : 'Choose a status'],
  ]);
};

// A blank slug or order is omitted: on create the server generates or appends, on edit it stays as it is.
export const buildNodePayload = (values, { isNew, original }) => {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
  };

  const slug = values.slug.trim().toLowerCase();
  if (slug && (isNew || slug !== original?.slug)) payload.slug = slug;

  const order = parseOrder(values.order);
  if (order !== undefined) payload.order = order;

  return payload;
};