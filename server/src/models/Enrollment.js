import mongoose from 'mongoose';
import { requiredRef } from './schemaFields.js';

const ENROLLMENT_STATUS = Object.freeze({ ACTIVE: 'active', COMPLETED: 'completed', CANCELLED: 'cancelled' });
export { ENROLLMENT_STATUS };

// One row per (student, course). Re-enrolling after cancellation reactivates this SAME row rather than
// creating a second one — the unique index below is the thing that makes that safe under a race.
// Progress percentages are never duplicated here: progress always comes from the existing Progress
// collection (Phase 8). This model only tracks the enrollment relationship and its lifecycle.
const enrollmentSchema = new mongoose.Schema(
  {
    student: requiredRef('User'),
    course: requiredRef('Course'),
    status: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.ACTIVE,
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// The real defense against duplicate enrollment under concurrent requests.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
// "This student's enrollments, filtered by status" (My Learning tabs).
enrollmentSchema.index({ student: 1, status: 1 });
// "This course's enrollments, filtered by status" (admin/mentor course analytics).
enrollmentSchema.index({ course: 1, status: 1 });
// Admin enrollment table, newest first.
enrollmentSchema.index({ enrolledAt: -1 });

export default mongoose.model('Enrollment', enrollmentSchema);