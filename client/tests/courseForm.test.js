import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoursePayload, validateCourseForm } from '../src/utils/forms/courseForm.js';

const valid = { title: 'Full Stack Web Development', slug: '', shortDescription: '', description: '', thumbnail: '', category: 'web-development', level: 'beginner' };

describe('validateCourseForm', () => {
  it('accepts a minimal valid course', () => {
    assert.deepEqual(validateCourseForm(valid, { isAdmin: true }), {});
  });

  it('rejects a short title and a missing category', () => {
    const errors = validateCourseForm({ ...valid, title: 'x', category: '' }, { isAdmin: true });
    assert.ok(errors.title);
    assert.ok(errors.category);
  });

  it('rejects an unsafe thumbnail URL', () => {
    const errors = validateCourseForm({ ...valid, thumbnail: 'javascript:alert(1)' }, { isAdmin: true });
    assert.ok(errors.thumbnail);
  });

  it('validates the slug only for admins', () => {
    const badSlug = { ...valid, slug: 'Not A Slug!' };
    assert.ok(validateCourseForm(badSlug, { isAdmin: true }).slug);
    assert.equal(validateCourseForm(badSlug, { isAdmin: false }).slug, undefined);
  });
});

describe('buildCoursePayload', () => {
  it('never includes status, instructors or createdBy', () => {
    const payload = buildCoursePayload(valid, { isNew: true, isAdmin: true, original: null });
    for (const forbidden of ['status', 'instructors', 'createdBy', 'updatedBy']) {
      assert.equal(forbidden in payload, false);
    }
  });

  it('omits the slug for a mentor', () => {
    const payload = buildCoursePayload({ ...valid, slug: 'whatever' }, { isNew: false, isAdmin: false, original: { slug: 'original' } });
    assert.equal('slug' in payload, false);
  });

  it('omits an unchanged slug on edit, but sends a changed one', () => {
    const original = { slug: 'full-stack-web-development' };
    const unchanged = buildCoursePayload({ ...valid, slug: original.slug }, { isNew: false, isAdmin: true, original });
    const changed = buildCoursePayload({ ...valid, slug: 'new-slug' }, { isNew: false, isAdmin: true, original });

    assert.equal('slug' in unchanged, false);
    assert.equal(changed.slug, 'new-slug');
  });
});