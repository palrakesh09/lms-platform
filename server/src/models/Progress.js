import mongoose from 'mongoose';
import { requiredRef } from './schemaFields.js';

// One document per student per concept.
// `course` is stored here on purpose so course-level progress and "resume learning"
// are single-collection queries. Services must ensure it matches the concept's course.
// Invariant for services: completed === true if and only if completedAt is set.
const progressSchema = new mongoose.Schema(
  {
    student: requiredRef('User'),
    course: requiredRef('Course'),
    concept: requiredRef('Concept'),
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
// A student's progress within a course, and their most recently accessed concept.
progressSchema.index({ student: 1, course: 1, lastAccessedAt: -1 });

// Explicit collection name: Mongoose would otherwise pluralize "Progress" to "progresses".
export default mongoose.model('Progress', progressSchema, 'progress');