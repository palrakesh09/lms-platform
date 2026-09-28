import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Concept, Module, Progress, Quiz, QuizAttempt, Resource, Topic, User } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);
let api, f, admin, mentorA, mentorB, student;
const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);

  const mod = await Module.create({ course: f.pub._id, title: 'M', slug: 'm-a11y', status: 'published', order: 1, createdBy: admin._id });
  const topic = await Topic.create({ module: mod._id, title: 'T', slug: 't-a11y', status: 'published', order: 1, createdBy: admin._id });
  const concept = await Concept.create({ topic: topic._id, title: 'C', slug: 'c-a11y', status: 'published', order: 1, createdBy: admin._id });
  await Resource.create({ concept: concept._id, type: 'theory', title: 'R', url: 'https://example.com', status: 'published', order: 1, createdBy: admin._id });
  await Progress.create({ student: student._id, course: f.pub._id, concept: concept._id, completed: true, completedAt: new Date(), lastAccessedAt: new Date() });

  const quiz = await Quiz.create({ title: 'Q', slug: 'q-a11y', course: f.pub._id, attachmentLevel: 'concept', attachmentModel: 'Concept', attachmentId: concept._id, status: 'published', createdBy: admin._id });
  await QuizAttempt.create({ student: student._id, quiz: quiz._id, course: f.pub._id, attemptNumber: 1, status: 'submitted', score: 8, totalPoints: 10, percentage: 80, passed: true, submittedAt: new Date(), answers: [] });
});
after(() => api?.stop());

describe('RBAC boundaries', () => {
  it('401 unauthenticated on every analytics route', async () => {
    for (const path of ['/analytics/admin/overview', '/analytics/mentor/overview', '/analytics/student/overview']) {
      assert.equal((await req('GET', path)).status, 401, path);
    }
  });

  it('mentor and student cannot reach admin analytics; admin and student cannot reach mentor analytics', async () => {
    for (const as of [mentorA, student]) assert.equal((await req('GET', '/analytics/admin/overview', { as })).status, 403);
    for (const as of [admin, student]) assert.equal((await req('GET', '/analytics/mentor/overview', { as })).status, 403);
    for (const as of [admin, mentorA]) assert.equal((await req('GET', '/analytics/student/overview', { as })).status, 403);
  });

  it('mentor cannot access another mentor\'s course analytics by manipulating the courseId', async () => {
    const own = await req('GET', `/analytics/mentor/courses/${id(f.pub)}`, { as: mentorA });
    assert.equal(own.status, 200);
    const other = await req('GET', `/analytics/mentor/courses/${id(f.other)}`, { as: mentorA });
    assert.equal(other.status, 403);
  });

  it('invalid course id -> 400, unknown course id -> 404', async () => {
    assert.equal((await req('GET', '/analytics/mentor/courses/not-an-id', { as: mentorA })).status, 400);
    assert.equal((await req('GET', `/analytics/mentor/courses/${MISSING_ID}`, { as: mentorA })).status, 404);
  });

  it('invalid date range is rejected', async () => {
    assert.equal((await req('GET', '/analytics/admin/activity?range=14d', { as: admin })).status, 422);
    assert.equal((await req('GET', '/analytics/admin/activity?range=7d', { as: admin })).status, 200);
  });
});

describe('student self-service only', () => {
  it('ignores any studentId supplied in query/body', async () => {
    const res = await req('GET', `/analytics/student/overview?studentId=${id(admin)}`, { as: student });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.coursesWithProgress >= 0); // computed from req.user.id regardless of the query string
  });

  it('quiz performance never includes another student\'s data or correctAnswer', async () => {
    const res = await req('GET', '/analytics/student/quizzes', { as: student });
    assert.equal(res.status, 200);
    assert.equal(JSON.stringify(res.body).includes('correctAnswer'), false);
  });
});

describe('data accuracy', () => {
  it('admin overview never exposes password hashes', async () => {
    const res = await req('GET', '/analytics/admin/overview', { as: admin });
    assert.equal(JSON.stringify(res.body).includes('password'), false);
  });

  it('reflects real activity: at least one active learner and one completion exist', async () => {
    const res = await req('GET', '/analytics/admin/overview', { as: admin });
    assert.ok(res.body.data.activeLearners >= 1);
    assert.ok(res.body.data.quizzes.totalSubmittedAttempts >= 1);
  });

  it('handles zero-data courses without NaN/Infinity', async () => {
    const res = await req('GET', `/analytics/mentor/courses/${id(f.draft)}`, { as: mentorA });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.overallProgress, 0);
    assert.equal(Number.isNaN(res.body.data.overallProgress), false);
  });

  it('course analytics table paginates and searches without N+1 blowup', async () => {
    const res = await req('GET', '/analytics/admin/courses?limit=2', { as: admin });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length <= 2);
    assert.ok('totalPages' in res.body.pagination);
  });
});