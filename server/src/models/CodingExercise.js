import mongoose from 'mongoose';
import { CODING_LANGUAGES, CODING_LIMITS as L, EXERCISE_DIFFICULTY } from '../constants/codingPlayground.js';
import { auditFields, orderField, requiredRef, slugField, statusField, textField, titleField } from './schemaFields.js';

const { Schema } = mongoose;

// A test case's `code` is a small JS expression/function body evaluated INSIDE the student's sandboxed
// iframe (never on the server — this app has no code execution engine). It is select:false, the same
// pattern as Question.correctAnswer, so ordinary reads never expose it; only the run/submit flow reads
// it explicitly and only to hand it to the sandbox, never back through the exercise-detail endpoint.
const testCaseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    code: { type: String, required: true, trim: true, maxlength: L.MAX_TEST_CODE, select: false },
    hidden: { type: Boolean, default: true }, // visible test cases may still show name+expectation to students
  },
  { _id: true },
);

const codingExerciseSchema = new Schema(
  {
    title: titleField(),
    slug: slugField(),
    description: textField('Description', 2000),
    instructions: textField('Instructions', 4000),
    course: requiredRef('Course'),
    attachmentLevel: { type: String, enum: ['concept'], default: 'concept', immutable: true }, // room to extend, matches Quiz's pattern
    attachmentId: { type: Schema.Types.ObjectId, required: true, immutable: true, ref: 'Concept' },
    language: { type: String, enum: CODING_LANGUAGES, default: 'html-css-js' },
    starterHtml: { type: String, default: '', maxlength: L.MAX_STARTER_CODE },
    starterCss: { type: String, default: '', maxlength: L.MAX_STARTER_CODE },
    starterJavaScript: { type: String, default: '', maxlength: L.MAX_STARTER_CODE },
    difficulty: { type: String, enum: EXERCISE_DIFFICULTY, default: 'beginner' },
    hints: { type: [String], default: [], validate: { validator: (v) => v.length <= L.MAX_HINTS && v.every((h) => h.length <= L.MAX_HINT_LENGTH), message: 'Too many hints, or a hint is too long' } },
    testCases: {
      type: [testCaseSchema],
      default: [],
      validate: { validator: (v) => v.length <= L.MAX_TEST_CASES, message: `A exercise can have at most ${L.MAX_TEST_CASES} test cases` },
    },
    status: statusField(),
    order: orderField(),
    ...auditFields(),
  },
  { timestamps: true },
);

codingExerciseSchema.index({ course: 1, slug: 1 }, { unique: true });
codingExerciseSchema.index({ attachmentLevel: 1, attachmentId: 1, order: 1 });
codingExerciseSchema.index({ course: 1, status: 1 });

export default mongoose.model('CodingExercise', codingExerciseSchema);