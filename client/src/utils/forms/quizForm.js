import { collect, lengthError, orderError, orderToInput, parseOrder, SLUG_MESSAGE, SLUG_PATTERN } from './common.js';

export const emptyQuizValues = Object.freeze({
  title: '', slug: '', description: '', instructions: '', passingScore: '70', maxAttempts: '', timeLimitMinutes: '', order: '',
});

export const quizToFormValues = (quiz) => ({
  title: quiz.title ?? '',
  slug: quiz.slug ?? '',
  description: quiz.description ?? '',
  instructions: quiz.instructions ?? '',
  passingScore: String(quiz.passingScore ?? 70),
  maxAttempts: quiz.maxAttempts == null ? '' : String(quiz.maxAttempts),
  timeLimitMinutes: quiz.timeLimitMinutes == null ? '' : String(quiz.timeLimitMinutes),
  order: orderToInput(quiz.order),
});

const positiveOrBlank = (value, label) => {
  const text = String(value).trim();
  if (text === '') return null; // blank = unlimited/untimed
  return /^\d+$/.test(text) && Number(text) >= 1 ? null : `${label} must be a positive whole number, or blank for unlimited`;
};

export const validateQuizForm = (values) => {
  const slug = values.slug.trim();
  const score = Number(values.passingScore);

  return collect([
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['slug', slug && (!SLUG_PATTERN.test(slug.toLowerCase()) ? SLUG_MESSAGE : lengthError('Slug', slug, { max: 160 }))],
    ['passingScore', Number.isInteger(score) && score >= 0 && score <= 100 ? null : 'Passing score must be a whole number from 0 to 100'],
    ['maxAttempts', positiveOrBlank(values.maxAttempts, 'Max attempts')],
    ['timeLimitMinutes', positiveOrBlank(values.timeLimitMinutes, 'Time limit')],
    ['order', orderError(values.order)],
  ]);
};

const parseNullable = (value) => (String(value).trim() === '' ? null : Number(value));

export const buildQuizPayload = (values, { isNew, original }) => {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    instructions: values.instructions.trim(),
    passingScore: Number(values.passingScore),
    maxAttempts: parseNullable(values.maxAttempts),
    timeLimitMinutes: parseNullable(values.timeLimitMinutes),
  };

  const slug = values.slug.trim().toLowerCase();
  if (slug && (isNew || slug !== original?.slug)) payload.slug = slug;

  const order = parseOrder(values.order);
  if (order !== undefined) payload.order = order;

  return payload;
};