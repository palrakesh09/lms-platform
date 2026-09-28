import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { activityLabel, formatBadgeCount, formatRelativeTime, safeLink } from '../src/utils/notificationUtils.js';

const NOW = new Date('2026-06-15T12:00:00Z').getTime();
const ago = (ms) => new Date(NOW - ms).toISOString();

describe('formatRelativeTime', () => {
  it('handles just now, minutes, hours and days, with singular/plural', () => {
    assert.equal(formatRelativeTime(ago(5000), NOW), 'just now');
    assert.equal(formatRelativeTime(ago(60000), NOW), '1 minute ago');
    assert.equal(formatRelativeTime(ago(5 * 60000), NOW), '5 minutes ago');
    assert.equal(formatRelativeTime(ago(2 * 3600000), NOW), '2 hours ago');
    assert.equal(formatRelativeTime(ago(3 * 86400000), NOW), '3 days ago');
  });
  it('falls back to a date after a week, and never throws on bad input or future dates', () => {
    assert.notEqual(formatRelativeTime(ago(10 * 86400000), NOW), '');
    assert.equal(formatRelativeTime('nonsense', NOW), '');
    assert.equal(formatRelativeTime(new Date(NOW + 60000).toISOString(), NOW), 'just now');
  });
});

describe('formatBadgeCount / safeLink / activityLabel', () => {
  it('caps the badge at 99+', () => {
    assert.equal(formatBadgeCount(3), '3');
    assert.equal(formatBadgeCount(100), '99+');
    assert.equal(formatBadgeCount(-2), '0');
  });
  it('follows only in-app paths', () => {
    assert.equal(safeLink('/learn/a/resource/b'), '/learn/a/resource/b');
    for (const bad of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', '', null, undefined]) assert.equal(safeLink(bad), null);
  });
  it('builds readable feed labels', () => {
    assert.equal(activityLabel({ type: 'concept_completed', title: 'HTML Forms' }), 'Completed HTML Forms');
    assert.equal(activityLabel({ type: 'quiz_failed', title: 'React Basics' }), 'Did not pass React Basics');
    assert.equal(activityLabel({ type: 'course_enrolled', title: '' }), 'Enrolled in an item');
  });
});