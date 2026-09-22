import { z } from 'zod';
import { QUESTION_TYPES } from '../constants/lms.js';
import { objectIdSchema, orderSchema, slugSchema, statusSchema, textSchema, titleSchema } from './fields.js';

const optionSchema = z.strictObject({
  id: z.string().trim().min(1).max(20).regex(/^[a-z0-9]+$/i, 'Option id may contain only letters and numbers'),
  text: z.string().trim().min(1, 'Option text is required').max(500),
});

const quizShape = {
  title: titleSchema,
  slug: slugSchema,
  description: textSchema('Description', 2000),
  instructions: textSchema('Instructions', 2000),
  passingScore: z.number('Passing score must be a number').int().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100'),
  maxAttempts: z.number('Max attempts must be a number').int().min(1, 'Max attempts must be at least 1').nullable(),
  timeLimitMinutes: z.number('Time limit must be a number').int().min(1, 'Time limit must be at least 1 minute').nullable(),
  order: orderSchema,
  status: statusSchema,
};

// Status is deliberately excluded: publishing and archiving are explicit, admin-only endpoints, and new
// quizzes always start as drafts (mirrors Course).
export const createQuizSchema = z
  .strictObject({ ...quizShape })
  .omit({ status: true })
  .partial({ slug: true, description: true, instructions: true, passingScore: true, maxAttempts: true, timeLimitMinutes: true, order: true });

export const updateQuizSchema = z
  .strictObject({ ...quizShape })
  .omit({ status: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

const mcqShape = {
  type: z.literal(QUESTION_TYPES.MCQ_SINGLE).default(QUESTION_TYPES.MCQ_SINGLE),
  question: z.string('Question text is required').trim().min(2, 'Question must be at least 2 characters').max(1000),
  options: z
    .array(optionSchema, 'Provide the answer options')
    .min(2, 'A question needs at least 2 options')
    .max(8, 'A question can have at most 8 options')
    .refine((options) => new Set(options.map((o) => o.id.toLowerCase())).size === options.length, 'Option ids must be unique'),
  correctAnswer: z.string('Select the correct answer').trim().min(1),
  explanation: textSchema('Explanation', 1000),
  points: z.number('Points must be a number').int().min(1, 'Points must be at least 1').max(100),
  order: orderSchema,
};

const withCorrectAnswerMatch = (schema) =>
  schema.refine(
    (v) => v.options === undefined || v.correctAnswer === undefined || v.options.some((o) => o.id.toLowerCase() === v.correctAnswer.toLowerCase()),
    { message: 'correctAnswer must match one of the option ids', path: ['correctAnswer'] },
  );

export const createQuestionSchema = withCorrectAnswerMatch(
  z.strictObject(mcqShape).partial({ type: true, explanation: true, points: true, order: true }),
);

// Partial updates: if only one of options/correctAnswer is sent, the model's own pre-validate hook
// (run against the full merged document) is the authoritative cross-check.
export const updateQuestionSchema = z
  .strictObject(mcqShape)
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const submitAnswerSchema = z.strictObject({
  questionId: objectIdSchema,
  selectedAnswer: z.string('selectedAnswer is required').trim().min(1).max(50),
});

export const submitQuizSchema = z.strictObject({
  attemptId: objectIdSchema,
  answers: z.array(submitAnswerSchema, 'Provide your answers').min(1),
});

export const listQuizzesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  status: statusSchema.optional(),
  courseId: objectIdSchema.optional(),
  moduleId: objectIdSchema.optional(),
  topicId: objectIdSchema.optional(),
  conceptId: objectIdSchema.optional(),
});