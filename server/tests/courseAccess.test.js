import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { COURSES, MISSING_ID, TREE, USERS, setupTestApp } from './helpers/testKit.js';
import Course from '../src/models/Course.js';
import { canManageCourse, canReadCourse } from '../src/policies/courseAccess.js';

let ctx;
before(async () => {
  ctx = await setupTestApp();
});
after(() => ctx.teardown());

const asPolicyUser = (user) => ({ id: user._id, role: user.role });

describe('course policy (pure functions)', () => {
  const mentor = asPolicyUser(USERS.mentor);
  const student = asPolicyUser(USERS.student);
  const admin = asPolicyUser(USERS.admin);

  it('lets admins manage and read every course', () => {
    for (const course of Object.values(COURSES)) {
      assert.equal(canManageCourse(admin, course), true);
      assert.equal(canReadCourse(admin, course), true);
    }
  });

  it('limits mentors to courses that list them as an instructor', () => {
    assert.equal(canManageCourse(mentor, COURSES.assigned), true);
    assert.equal(canManageCourse(mentor, COURSES.unassigned), false);
    assert.equal(canReadCourse(mentor, COURSES.draft), true); // assigned, even though it is a draft
    assert.equal(canReadCourse(mentor, COURSES.unassigned), false);
  });

  it('does not let a demoted mentor keep access through the instructors list', () => {
    assert.equal(canManageCourse({ ...mentor, role: 'student' }, COURSES.assigned), false);
  });

  it('lets students read published courses only, and never manage', () => {
    assert.equal(canReadCourse(student, COURSES.assigned), true);
    assert.equal(canReadCourse(student, COURSES.draft), false);
    assert.equal(canManageCourse(student, COURSES.assigned), false);
  });
});

describe('mentor access', () => {
  const mentor = { user: USERS.mentor };

  it('can write to a course they instruct', async () => {
    const { status } = await ctx.call(`/courses/${COURSES.assigned._id}/write`, { method: 'POST', ...mentor });
    assert.equal(status, 200);
  });

  it('is denied (403) on a course they do not instruct', async () => {
    const { status, body } = await ctx.call(`/courses/${COURSES.unassigned._id}/write`, { method: 'POST', ...mentor });

    assert.equal(status, 403);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  it('gets 404 for a course that does not exist', async () => {
    const { status } = await ctx.call(`/courses/${MISSING_ID}/write`, { method: 'POST', ...mentor });
    assert.equal(status, 404);
  });

  it('can update a topic inside their course, and is denied outside it', async () => {
    assert.equal((await ctx.call(`/topics/${TREE.assigned.topic}`, { method: 'PUT', ...mentor })).status, 200);
    assert.equal((await ctx.call(`/topics/${TREE.unassigned.topic}`, { method: 'PUT', ...mentor })).status, 403);
  });

  it('can create a topic under their module, and is denied under someone else\'s', async () => {
    const create = (moduleId) => ctx.call(`/modules/${moduleId}/topics`, { method: 'POST', ...mentor });

    assert.equal((await create(TREE.assigned.module)).status, 200);
    assert.equal((await create(TREE.unassigned.module)).status, 403);
  });

  it('can delete a resource inside their course, and is denied outside it', async () => {
    assert.equal((await ctx.call(`/resources/${TREE.assigned.resource}`, { method: 'DELETE', ...mentor })).status, 200);
    assert.equal((await ctx.call(`/resources/${TREE.unassigned.resource}`, { method: 'DELETE', ...mentor })).status, 403);
  });

  it('gets 404 for a topic that does not exist', async () => {
    assert.equal((await ctx.call(`/topics/${MISSING_ID}`, { method: 'PUT', ...mentor })).status, 404);
  });

  it('gets 400 for a malformed id', async () => {
    assert.equal((await ctx.call('/topics/not-an-id', { method: 'PUT', ...mentor })).status, 400);
  });

  it('can read an assigned draft course but not an unassigned published one', async () => {
    assert.equal((await ctx.call(`/courses/${COURSES.draft._id}/read`, mentor)).status, 200);
    assert.equal((await ctx.call(`/courses/${COURSES.unassigned._id}/read`, mentor)).status, 404);
  });

  it('cannot delete courses, even their own', async () => {
    assert.equal((await ctx.call(`/courses/${COURSES.assigned._id}`, { method: 'DELETE', ...mentor })).status, 403);
  });
});

describe('student restrictions', () => {
  const student = { user: USERS.student };

  it('can read a published course', async () => {
    assert.equal((await ctx.call(`/courses/${COURSES.assigned._id}/read`, student)).status, 200);
  });

  it('gets the same 404 for a draft course as for a missing one', async () => {
    const draft = await ctx.call(`/courses/${COURSES.draft._id}/read`, student);
    const missing = await ctx.call(`/courses/${MISSING_ID}/read`, student);

    assert.equal(draft.status, 404);
    assert.equal(missing.status, 404);
    assert.deepEqual(draft.body, missing.body);
  });

  it('is denied every write operation', async () => {
    const attempts = [
      ['POST', `/courses/${COURSES.assigned._id}/write`],
      ['DELETE', `/courses/${COURSES.assigned._id}`],
      ['POST', `/modules/${TREE.assigned.module}/topics`],
      ['PUT', `/topics/${TREE.assigned.topic}`],
      ['DELETE', `/resources/${TREE.assigned.resource}`],
    ];

    for (const [method, path] of attempts) {
      assert.equal((await ctx.call(path, { method, ...student })).status, 403, `${method} ${path}`);
    }
  });

  it('is stopped by the role gate before any course lookup happens', async () => {
    const before = Course.findById.mock.callCount();

    await ctx.call(`/topics/${TREE.assigned.topic}`, { method: 'PUT', ...student });

    assert.equal(Course.findById.mock.callCount(), before);
  });
});

describe('admin access', () => {
  const admin = { user: USERS.admin };

  it('can manage a course they are not an instructor of, and read a draft', async () => {
    assert.equal((await ctx.call(`/courses/${COURSES.unassigned._id}/write`, { method: 'POST', ...admin })).status, 200);
    assert.equal((await ctx.call(`/courses/${COURSES.draft._id}/read`, admin)).status, 200);
    assert.equal((await ctx.call(`/resources/${TREE.unassigned.resource}`, { method: 'DELETE', ...admin })).status, 200);
  });
});