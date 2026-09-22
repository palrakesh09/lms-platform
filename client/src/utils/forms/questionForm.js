import { collect, lengthError, orderError, orderToInput, parseOrder } from './common.js';

const emptyOption = (id) => ({ id, text: '' });

export const emptyQuestionValues = Object.freeze({
  question: '', options: [emptyOption('a'), emptyOption('b')], correctAnswer: 'a', explanation: '', points: '1', order: '',
});

export const questionToFormValues = (question) => ({
  question: question.question ?? '',
  options: (question.options ?? []).map((o) => ({ ...o })),
  correctAnswer: question.correctAnswer ?? '',
  explanation: question.explanation ?? '',
  points: String(question.points ?? 1),
  order: orderToInput(question.order),
});

export const validateQuestionForm = (values) => {
  const optionIds = values.options.map((o) => o.id.trim().toLowerCase());
  const points = Number(values.points);

  const optionsProblem =
    values.options.length < 2
      ? 'Add at least 2 options'
      : values.options.some((o) => !o.text.trim())
        ? 'Every option needs text'
        : new Set(optionIds).size !== optionIds.length
          ? 'Option ids must be unique'
          : null;

  return collect([
    ['question', lengthError('Question', values.question, { min: 2, max: 1000 })],
    ['options', optionsProblem],
    ['correctAnswer', optionIds.includes(values.correctAnswer.trim().toLowerCase()) ? null : 'Select the correct answer'],
    ['explanation', lengthError('Explanation', values.explanation, { max: 1000 })],
    ['points', Number.isInteger(points) && points >= 1 && points <= 100 ? null : 'Points must be a whole number from 1 to 100'],
    ['order', orderError(values.order)],
  ]);
};

export const buildQuestionPayload = (values) => {
  const payload = {
    question: values.question.trim(),
    options: values.options.map((o) => ({ id: o.id.trim().toLowerCase(), text: o.text.trim() })),
    correctAnswer: values.correctAnswer.trim().toLowerCase(),
    explanation: values.explanation.trim(),
    points: Number(values.points),
  };
  const order = parseOrder(values.order);
  if (order !== undefined) payload.order = order;
  return payload;
};