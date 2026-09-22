import mongoose from 'mongoose';
import { requiredRef } from './schemaFields.js';

// One document per student per concept.
// `course` is stored here on purpose so course-level progress and "resume learning"
// are single-collection queries. Services must ensure it matches the concept's course.
// `lastAccessedResource` records which of the concept's resources (theory/task/mini-project) the
// student most recently opened. Added in Phase 8 so "Continue Learning" can resume at resource
// granularity; it is optional because a progress row can exist before any resource has been opened.
// Invariant for services: completed === true if and only if completedAt is set.
const progressSchema = new mongoose.Schema(
  {
    student: requiredRef('User'),
    course: requiredRef('Course'),
    concept: requiredRef('Concept'),
    lastAccessedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Prevents duplicate progress rows, and is the lookup for one student + one concept.
progressSchema.index({ student: 1, concept: 1 }, { unique: true });
// A student's progress within a course, and their most recently accessed concept (resume learning).
progressSchema.index({ student: 1, course: 1, lastAccessedAt: -1 });
// "Does anyone have progress on this concept?" Used by the concept delete guard (Phase 5).
progressSchema.index({ concept: 1 });

// Explicit collection name: Mongoose would otherwise pluralize "Progress" to "progresses".
export default mongoose.model('Progress', progressSchema, 'progress');