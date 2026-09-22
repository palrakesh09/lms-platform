import mongoose from 'mongoose';
import { QUIZ_ATTACHMENT_LEVELS } from '../constants/lms.js';
import { auditFields, orderField, requiredRef, slugField, statusField, textField, titleField } from './schemaFields.js';

const { Schema } = mongoose;

// A quiz can be attached at the course, module, topic or concept level. Concept is the default and the
// only level the current UI creates (per the phase brief), but the schema supports the others without a
// rewrite: whichever node it's attached to, `attachmentLevel`/`attachmentId` are all a policy or a
// structure query needs, via the exact same loadContentChain() walk Phase 5 built for content nodes.
const ATTACHMENT_MODEL_BY_LEVEL = {
  [QUIZ_ATTACHMENT_LEVELS.COURSE]: 'Course',
  [QUIZ_ATTACHMENT_LEVELS.MODULE]: 'Module',
  [QUIZ_ATTACHMENT_LEVELS.TOPIC]: 'Topic',
  [QUIZ_ATTACHMENT_LEVELS.CONCEPT]: 'Concept',
};

const quizSchema = new Schema(
  {
    title: titleField(),
    slug: slugField(),
    description: textField('Description', 2000),
    instructions: textField('Instructions', 2000),
    // Denormalized owning course (immutable), resolved from the attachment at creation time. Every
    // authorization and listing query can filter on this directly without walking the chain.
    course: requiredRef('Course'),
    attachmentLevel: {
      type: String,
      enum: Object.values(QUIZ_ATTACHMENT_LEVELS),
      required: true,
      immutable: true,
      default: QUIZ_ATTACHMENT_LEVELS.CONCEPT,
    },
    attachmentModel: {
      type: String,
      enum: Object.values(ATTACHMENT_MODEL_BY_LEVEL),
      required: true,
    },
    attachmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      immutable: true,
      refPath: 'attachmentModel',
    },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    maxAttempts: { type: Number, default: null, min: 1 }, // null = unlimited
    timeLimitMinutes: { type: Number, default: null, min: 1 }, // null = untimed
    status: statusField(),
    order: orderField(),
    ...auditFields(),
  },
  { timestamps: true },
);

quizSchema.pre('validate', function setAttachmentModel(next) {
  this.attachmentModel = ATTACHMENT_MODEL_BY_LEVEL[this.attachmentLevel];
  next();
});

quizSchema.index({ course: 1, slug: 1 }, { unique: true });
quizSchema.index({ attachmentLevel: 1, attachmentId: 1, order: 1 });
quizSchema.index({ course: 1, status: 1 });

export default mongoose.model('Quiz', quizSchema);