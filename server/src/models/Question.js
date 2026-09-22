import mongoose from 'mongoose';
import { QUESTION_TYPES } from '../constants/lms.js';
import { auditFields, orderField, requiredRef, textField } from './schemaFields.js';

const { Schema } = mongoose;

// Option ids are short tokens ("a", "b", ...), never the option text, so a stored `correctAnswer` is a
// stable reference even if the text is edited later.
const optionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 20,
      match: [/^[a-z0-9]+$/, 'Option id may contain only letters and numbers'],
    },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    quiz: requiredRef('Quiz'),
    type: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      default: QUESTION_TYPES.MCQ_SINGLE,
      required: true,
    },
    question: { type: String, required: true, trim: true, minlength: 2, maxlength: 1000 },
    options: {
      type: [optionSchema],
      validate: {
        validator(options) {
          if (this.type !== QUESTION_TYPES.MCQ_SINGLE) return true;
          if (options.length < 2 || options.length > 8) return false;
          const ids = options.map((option) => option.id);
          return new Set(ids).size === ids.length; // unique option ids within this question
        },
        message: 'A multiple-choice question needs 2 to 8 options with unique ids',
      },
    },
    // The answer key. select:false is the same pattern as User.password: normal queries never return
    // it, and only quizAttempt.service.js explicitly selects it, only to score a submission.
    correctAnswer: { type: String, required: true, trim: true, lowercase: true, select: false },
    explanation: textField('Explanation', 1000),
    points: { type: Number, default: 1, min: 1, max: 100 },
    order: orderField(),
    ...auditFields(),
  },
  { timestamps: true },
);

// Cross-field rule: correctAnswer must name one of THIS question's own option ids. Runs on create and
// on every .save() (including partial admin edits, since the service loads the full document first),
// so a mismatched pair can never be persisted.
questionSchema.pre('validate', function checkCorrectAnswer(next) {
  if (this.type === QUESTION_TYPES.MCQ_SINGLE) {
    const ids = (this.options ?? []).map((option) => option.id);
    if (!this.correctAnswer || !ids.includes(this.correctAnswer)) {
      this.invalidate('correctAnswer', 'correctAnswer must match one of this question\'s option ids');
    }
  }
  next();
});

questionSchema.index({ quiz: 1, order: 1 });

export default mongoose.model('Question', questionSchema);