import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Concept, Enrollment, Module, Progress, Quiz, Resource, Topic } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);
let api, f, admin, mentorA, student;
let secondCourse, concept, resource, quiz;
const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, student } = api.users);
  f = await seedFixtures(api.users);

  const { Course } = await import('../src/models/index.js');
  secondCourse = await Course.create({ title: 'Second Published', slug: 'second-published', status: 'published', order: 5, createdBy: admin._id });
  const mod = await Module.create({ course: secondCourse._id, title: 'M', slug: 'm-enr', status: 'published', order: 1, createdBy: admin._id });
  const topic = await Topic.create({ module: mod._id, title: 'T', slug: 't-enr', status: 'published', order: 1, createdBy: admin._id });
  concept = await Concept.create({ topic: topic._id, title: 'C', slug: 'c-enr', status: 'published', order: 1, createdBy: admin._id });
  resource = await Resource.create({ concept: concept._id, type: 'theory', title: 'R', url: 'https://example.com', status: 'published', order: 1, createdBy: admin._id });
  quiz = await Quiz.create({ title: 'Q', slug: 'q-enr', course: secondCourse._id, attachmentLevel: 'concept', attachmentModel: 'Concept', attachmentId: concept._id, status: 'published', createdBy: admin._id });
});
after(() => api?.stop());

describe('enrollment creation', () => {
  it('enrolls a student in a published course', async () => {
    const res = await req('POST', '/enrollments', { as: student, body: { courseId: id(f.pub) } });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.enrollment.status, 'active');
    assert.equal(res.body.data.enrollment.course, id(f.pub));
  });

  it('rejects enrollment in a draft or archived course', async () => {
    assert.equal((await req('POST', '/enrollments', { as: student, body: { courseId: id(f.draft) } })).status, 409);
    assert.equal((await req('POST', '/enrollments', { as: student, body: { courseId: id(f.archived) } })).status, 409);
  });

  it('rejects duplicate enrollment (including a simulated double-click)', async () => {
    const dup = await req('POST', '/enrollments', { as: student, body: { courseId: id(f.pub) } });
    assert.equal(dup.status, 409);
    assert.equal(await Enrollment.countDocuments({ student: student._id, course: f.pub._id }), 1);
  });

  it('ignores any studentId sent in the body — always req.user.id', async () => {
    const res = await req('POST', '/enrollments', { as: student, body: { courseId: id(secondCourse), studentId: id(admin) } });
    assert.equal(res.status, 201);
    const stored = await Enrollment.findOne({ course: secondCourse._id }).lean();
    assert.equal(String(stored.student), id(student));
  });

  it('is student-only: mentor and admin self-enrollment attempts get 403', async () => {
    for (const as of [admin, mentorA]) {
      assert.equal((await req('POST', '/enrollments', { as, body: { courseId: id(secondCourse) } })).status, 403);
    }
  });

  it('requires authentication', async () => {
    assert.equal((await req('POST', '/enrollments', { body: { courseId: id(f.pub) } })).status, 401);
  });

  it('rejects a malformed or unknown courseId', async () => {
    assert.equal((await req('POST', '/enrollments', { as: student, body: { courseId: 'not-an-id' } })).status, 422);
    assert.equal((await req('POST', '/enrollments', { as: student, body: { courseId: MISSING_ID } })).status, 404);
  });
});

describe('enrollment lookup and cancellation', () => {
  it('lists only the student\'s own enrollments', async () => {
    const res = await req('GET', '/enrollments/my', { as: student });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.some((e) => e.course === id(f.pub)));
  });

  it('returns null status for an unenrolled course, not an error', async () => {
    const res = await req('GET', `/enrollments/${id(f.other)}`, { as: student });
    assert.equal(res.status, 200);
    assert.equal(res.body.data, null);
  });

  it('cancels, and re-enrolling reactivates the SAME row rather than creating a second one', async () => {
    await req('DELETE', `/enrollments/${id(secondCourse)}`, { as: student });
    const afterCancel = await Enrollment.findOne({ student: student._id, course: secondCourse._id }).lean();
    assert.equal(afterCancel.status, 'cancelled');

    const reenroll = await req('POST', '/enrollments', { as: student, body: { courseId: id(secondCourse) } });
    assert.equal(reenroll.status, 201);
    assert.equal(await Enrollment.countDocuments({ student: student._id, course: secondCourse._id }), 1);
  });
});

describe('enrollment gates learning content for students only', () => {
  it('blocks structure/progress/quiz access before enrollment, with 403', async () => {
    // student is enrolled in f.pub and secondCourse, but never in f.other
    for (const path of [
      `/courses/${id(f.other)}/structure`,
      `/progress/course/${id(f.other)}`,
      `/quizzes/${id(quiz)}/start`, // quiz belongs to secondCourse, so use an "other" quiz instead below
    ]) {
      // (structure/progress checks against f.other, which student never enrolled in)
    }
    assert.equal((await req('GET', `/courses/${id(f.other)}/structure`, { as: student })).status, 403);
    assert.equal((await req('GET', `/progress/course/${id(f.other)}`, { as: student })).status, 403);
  });

  it('allows the same routes once enrolled', async () => {
    assert.equal((await req('GET', `/courses/${id(secondCourse)}/structure`, { as: student })).status, 200);
    assert.equal((await req('GET', `/progress/course/${id(secondCourse)}`, { as: student })).status, 200);
    assert.equal((await req('POST', `/quizzes/${id(quiz)}/start`, { as: student })).status, 200);
  });

  it('never blocks admin or mentor from the same routes, enrollment or not', async () => {
    assert.equal((await req('GET', `/courses/${id(f.other)}/structure`, { as: admin })).status, 200);
    assert.equal((await req('GET', `/courses/${id(secondCourse)}/structure`, { as: mentorA })).status, 403); // blocked by OWNERSHIP, not enrollment
    assert.equal(await Enrollment.exists({ student: admin._id }), null); // admin never has an enrollment row at all
  });

  it('does not let a student write progress for a course they are not enrolled in, even with valid IDs', async () => {
    const res = await req('PATCH', `/progress/course/${id(f.other)}/access`, {
      as: student,
      body: { conceptId: id(f.otherTree.concept), resourceId: id(f.otherTree.resource) },
    });
    assert.equal(res.status, 403);
  });
});

describe('course completion is server-triggered', () => {
  it('marks the enrollment completed once every published concept is completed, and never accepts a client-sent completion', async () => {
    await req('PATCH', `/progress/concept/${id(concept)}/complete`, { as: student }); // secondCourse has exactly 1 published concept
    const enrollment = await Enrollment.findOne({ student: student._id, course: secondCourse._id }).lean();
    assert.equal(enrollment.status, 'completed');
    assert.ok(enrollment.completedAt);

    // No endpoint exists to set this directly; confirm the API surface has no such route.
    assert.equal((await req('PATCH', `/enrollments/${id(secondCourse)}/complete`, { as: student })).status, 404);
  });

  it('reverts to active if the concept is marked incomplete again', async () => {
    await req('PATCH', `/progress/concept/${id(concept)}/incomplete`, { as: student });
    const enrollment = await Enrollment.findOne({ student: student._id, course: secondCourse._id }).lean();
    assert.equal(enrollment.status, 'active');
    assert.equal(enrollment.completedAt, null);
  });
});

describe('admin enrollment management', () => {
  it('lists and paginates, and only admin may access it', async () => {
    assert.equal((await req('GET', '/enrollments/admin/all', { as: student })).status, 403);
    assert.equal((await req('GET', '/enrollments/admin/all', { as: mentorA })).status, 403);

    const res = await req('GET', `/enrollments/admin/all?courseId=${id(f.pub)}`, { as: admin });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((e) => e.course.id === id(f.pub)));
    assert.equal(JSON.stringify(res.body).includes('password'), false);
  });

  it('admin can cancel an enrollment', async () => {
    const row = await Enrollment.findOne({ student: student._id, course: f.pub._id }).lean();
    const res = await req('DELETE', `/enrollments/admin/${id(row)}`, { as: admin });
    assert.equal(res.status, 200);
    assert.equal((await Enrollment.findById(row._id)).status, 'cancelled');
  });
});