import { z } from 'zod';
import { CODING_LIMITS as L, EXERCISE_DIFFICULTY } from '../constants/codingPlayground.js';
import { objectIdSchema, orderSchema, slugSchema, statusSchema, textSchema, titleSchema } from './fields.js';

const testCaseSchema = z.strictObject({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(L.MAX_TEST_CODE),
  hidden: z.boolean().default(true),
});

const shape = {
  title: titleSchema,
  slug: slugSchema,
  description: textSchema('Description', 2000),
  instructions: textSchema('Instructions', 4000),
  starterHtml: z.string().max(L.MAX_STARTER_CODE).default(''),
  starterCss: z.string().max(L.MAX_STARTER_CODE).default(''),
  starterJavaScript: z.string().max(L.MAX_STARTER_CODE).default(''),
  difficulty: z.enum(EXERCISE_DIFFICULTY).default('beginner'),
  hints: z.array(z.string().trim().max(L.MAX_HINT_LENGTH)).max(L.MAX_HINTS).default([]),
  testCases: z.array(testCaseSchema).max(L.MAX_TEST_CASES).default([]),
  order: orderSchema,
  status: statusSchema,
};

export const createExerciseSchema = z.strictObject(shape).omit({ status: true }).partial({ slug: true, description: true, instructions: true, starterHtml: true, starterCss: true, starterJavaScript: true, difficulty: true, hints: true, testCases: true, order: true });
export const updateExerciseSchema = z.strictObject(shape).omit({ status: true }).partial().refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const submitAttemptSchema = z.strictObject({
  attemptId: objectIdSchema.optional(),
  submittedHtml: z.string().max(20000).default(''),
  submittedCss: z.string().max(20000).default(''),
  submittedJavaScript: z.string().max(20000).default(''),
  results: z.array(z.strictObject({ name: z.string().max(150), passed: z.boolean() })).max(L.MAX_RESULTS_PER_SUBMIT).default([]),
  outputSummary: z.string().max(L.MAX_OUTPUT_SUMMARY).default(''),
});