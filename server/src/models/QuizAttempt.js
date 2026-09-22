import mongoose from 'mongoose';
import { ATTEMPT_STATUS } from '../constants/lms.js';
import { requiredRef } from './schemaFields.js';

const { Schema } = mongoose;

// A scored answer, written once by the server at submission time. Nothing here is ever accepted from
// the client — see quizAttempt.service.js. `immutable: true` on each field is defense in depth; the
// real guard is the service refusing to touch an attempt whose status is already 'submitted'.
const answerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true, immutable: true },
    selectedAnswer: { type: String, required: true, trim: true, immutable: true },
    isCorrect: { type: Boolean, required: true, immutable: true },
    pointsEarned: { type: Number, required: true, min: 0, immutable: true },
  },
  { _id: false },
);

const quizAttemptSchema = new Schema(
  {
    student: requiredRef('User'),
    quiz: requiredRef('Quiz'),
    course: requiredRef('Course'), // denormalized from quiz.course at start time, for fast history queries
    attemptNumber: { type: Number, required: true, immutable: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATUS),
      default: ATTEMPT_STATUS.IN_PROGRESS,
    },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    passed: { type: Boolean, default: false },
    submittedLate: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now, immutable: true },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One attempt number per student per quiz: the real defense against a race creating two "attempt #2"s.
quizAttemptSchema.index({ student: 1, quiz: 1, attemptNumber: 1 }, { unique: true });
// A student's attempts for one quiz (start/history), and their submissions in chronological order.
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, submittedAt: -1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);