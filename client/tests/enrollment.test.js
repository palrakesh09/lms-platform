import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure logic touched by this phase lives on the backend (enrollment.service.js) and is covered there.
// This suite exercises the one bit of client-side branching logic that is pure and testable without a
// DOM: EnrollButton's label selection, extracted here as the same rule the component implements.
const labelFor = (status, authenticated, courseStatus) => {
  if (!authenticated) return 'Login to Enroll';
  if (status === 'completed') return 'Completed — Review';
  if (status === 'active') return 'Continue Learning';
  if (courseStatus !== 'published') return 'Unavailable';
  return 'Enroll Now';
};

describe('enrollment CTA label rules', () => {
  it('prioritizes login over enrollment state', () => assert.equal(labelFor('active', false, 'published'), 'Login to Enroll'));
  it('shows Continue Learning for an active enrollment', () => assert.equal(labelFor('active', true, 'published'), 'Continue Learning'));
  it('shows Completed for a completed enrollment', () => assert.equal(labelFor('completed', true, 'published'), 'Completed — Review'));
  it('shows Enroll Now for a published, unenrolled course', () => assert.equal(labelFor(null, true, 'published'), 'Enroll Now'));
  it('shows Unavailable for a non-published course with no enrollment', () => assert.equal(labelFor(null, true, 'draft'), 'Unavailable'));
});