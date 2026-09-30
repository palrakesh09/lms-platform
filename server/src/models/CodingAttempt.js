import mongoose from 'mongoose';
import { ATTEMPT_STATUS, CODING_LIMITS as L } from '../constants/codingPlayground.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// A single result entry, as reported by the sandboxed iframe. The server validates SHAPE (name is a
// string, passed is a boolean, bounded length) but cannot itself re-verify correctness — there is no
// server-side execution engine in this phase. This is a documented, explicit trust boundary; see
// docs/coding-playground.md.
const resultSchema = new Schema({ name: { type: String, required: true, maxlength: 150 }, passed: { type: Boolean, required: true } }, { _id: false });

const codingAttemptSchema = new Schema(
  {
    student: requiredRef('User'),
    exercise: requiredRef('CodingExercise'),
    course: requiredRef('Course'),
    submittedHtml: { type: String, default: '', maxlength: L.MAX_SUBMITTED_CODE },
    submittedCss: { type: String, default: '', maxlength: L.MAX_SUBMITTED_CODE },
    submittedJavaScript: { type: String, default: '', maxlength: L.MAX_SUBMITTED_CODE },
    status: { type: String, enum: Object.values(ATTEMPT_STATUS), default: ATTEMPT_STATUS.IN_PROGRESS },
    results: { type: [resultSchema], default: [], validate: { validator: (v) => v.length <= L.MAX_RESULTS_PER_SUBMIT, message: 'Too many results' } },
    passedTests: { type: Number, default: 0, min: 0 },
    totalTests: { type: Number, default: 0, min: 0 },
    outputSummary: { type: String, default: '', maxlength: L.MAX_OUTPUT_SUMMARY }, // captured console output, truncated
    startedAt: { type: Date, default: Date.now, immutable: true },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

codingAttemptSchema.index({ student: 1, exercise: 1, createdAt: -1 }); // a student's attempts on one exercise
codingAttemptSchema.index({ student: 1, updatedAt: -1 });

export default mongoose.model('CodingAttempt', codingAttemptSchema);