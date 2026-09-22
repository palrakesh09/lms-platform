import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Concept, Course, Module, Progress, Resource, Topic } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);

let api;
let f;
let admin, mentorA, student;
let course, concept1, concept2, draftConcept, resource1, resource2;

const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, student } = api.users);
  f = await seedFixtures(api.users);

  // A dedicated two-concept published course, so percentage math (50%) is easy to check by hand.
  course = await Course.create({ title: 'Progress Course', slug: 'progress-course', status: 'published', order: 1, createdBy: admin._id });
  const module_ = await Module.create({ course: course._id, title: 'M1', slug: 'm1', status: 'published', order: 1, createdBy: admin._id });
  const topic = await Topic.create({ module: module_._id, title: 'T1', slug: 't1', status: 'published', order: 1, createdBy: admin._id });
  concept1 = await Concept.create({ topic: topic._id, title: 'C1', slug: 'c1', status: 'published', order: 1, createdBy: admin._id });
  concept2 = await Concept.create({ topic: topic._id, title: 'C2', slug: 'c2', status: 'published', order: 2, createdBy: admin._id });
  draftConcept = await Concept.create({ topic: topic._id, title: 'C3 draft', slug: 'c3', status: 'draft', order: 3, createdBy: admin._id });
  resource1 = await Resource.create({ concept: concept1._id, type: 'theory', title: 'R1', url: 'https://example.com/r1', status: 'published', order: 1, createdBy: admin._id });
  resource2 = await Resource.create({ concept: concept2._id, type: 'task', title: 'R2', url: 'https://example.com/r2', status: 'published', order: 1, createdBy: admin._id });
});
after(() => api?.stop());

describe('access and identifiers', () => {
  it('is student-only: guests get 401, staff get 403', async () => {
    assert.equal((await req('GET', '/progress/my-learning')).status, 401);
    for (const as of [admin, mentorA]) {
      assert.equal((await req('GET', '/progress/my-learning', { as })).status, 403);
      assert.equal((await req('GET', `/progress/course/${id(course)}`, { as })).status, 403);
      assert.equal((await req('PATCH', `/progress/concept/${id(concept1)}/complete`, { as })).status, 403);
    }
  });

  it('rejects malformed ids with 400 and unknown ids with 404', async () => {
    assert.equal((await req('GET', '/progress/course/not-an-id', { as: student })).status, 400);
    assert.equal((await req('GET', `/progress/course/${MISSING_ID}`, { as: student })).status, 404);
    assert.equal((await req('GET', '/progress/concept/not-an-id', { as: student })).status, 400);
    assert.equal((await req('GET', `/progress/concept/${MISSING_ID}`, { as: student })).status, 404);
  });

  it('rejects progress on draft/archived courses, and on courses the student cannot otherwise read', async () => {
    for (const hidden of [f.draft, f.archived]) {
      assert.equal((await req('GET', `/progress/course/${id(hidden)}`, { as: student })).status, 404);
    }
    assert.equal((await req('GET', `/progress/concept/${id(f.draftTree.concept)}`, { as: student })).status, 404);
  });

  it('rejects a draft concept even inside a published course', async () => {
    assert.equal((await req('GET', `/progress/concept/${id(draftConcept)}`, { as: student })).status, 404);
    assert.equal((await req('PATCH', `/progress/concept/${id(draftConcept)}/complete`, { as: student })).status, 404);
  });
});

describe('concept progress: get, complete, incomplete', () => {
  it('defaults to not started when no record exists', async () => {
    const res = await req('GET', `/progress/concept/${id(concept1)}`, { as: student });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, {
      conceptId: id(concept1),
      completed: false,
      completedAt: null,
      lastAccessedAt: null,
      lastAccessedResource: null,
    });
  });

  it('marks a concept complete, creating the record and recording its own course (not a client value)', async () => {
    const res = await req('PATCH', `/progress/concept/${id(concept1)}/complete`, { as: student });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.completed, true);
    assert.ok(res.body.data.completedAt);

    const stored = await Progress.findOne({ student: student._id, concept: concept1._id }).lean();
    assert.equal(String(stored.course), id(course));
  });

  it('is idempotent and never creates a duplicate row', async () => {
    await req('PATCH', `/progress/concept/${id(concept1)}/complete`, { as: student });
    await req('PATCH', `/progress/concept/${id(concept1)}/complete`, { as: student });

    assert.equal(await Progress.countDocuments({ student: student._id, concept: concept1._id }), 1);
  });

  it('marks a concept incomplete, keeping the row rather than deleting it', async () => {
    const res = await req('PATCH', `/progress/concept/${id(concept1)}/incomplete`, { as: student });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.completed, false);
    assert.equal(res.body.data.completedAt, null);
    assert.equal(await Progress.countDocuments({ student: student._id, concept: concept1._id }), 1);
  });

  it('ignores any studentId sent in the body — the student is always req.user.id', async () => {
    const res = await req('PATCH', `/progress/concept/${id(concept1)}/complete`, {
      as: student,
      body: { studentId: id(admin) },
    });

    assert.equal(res.status, 200);
    const stored = await Progress.findOne({ concept: concept1._id }).lean();
    assert.equal(String(stored.student), id(student));
    assert.equal(await Progress.countDocuments({ concept: concept1._id }), 1); // no second row for "admin"
  });
});

describe('course progress and access tracking', () => {
  it('rejects a resource that does not belong to the given concept, or to the given course', async () => {
    const wrongConcept = await req('PATCH', `/progress/course/${id(course)}/access`, {
      as: student,
      body: { conceptId: id(concept2), resourceId: id(resource1) }, // resource1 belongs to concept1
    });
    assert.equal(wrongConcept.status, 400);

    const wrongCourse = await req('PATCH', `/progress/course/${id(f.pub)}/access`, {
      as: student,
      body: { conceptId: id(concept1), resourceId: id(resource1) }, // concept1 belongs to `course`, not f.pub
    });
    assert.equal(wrongCourse.status, 400);
  });

  it('rejects malformed and unknown resource ids in the body', async () => {
    const malformed = await req('PATCH', `/progress/course/${id(course)}/access`, {
      as: student,
      body: { conceptId: id(concept1), resourceId: 'not-an-id' },
    });
    assert.equal(malformed.status, 422);

    const missing = await req('PATCH', `/progress/course/${id(course)}/access`, {
      as: student,
      body: { conceptId: id(concept1), resourceId: MISSING_ID },
    });
    assert.equal(missing.status, 404);
  });

  it('does not mark the concept complete merely by recording access', async () => {
    const res = await req('PATCH', `/progress/course/${id(course)}/access`, {
      as: student,
      body: { conceptId: id(concept2), resourceId: id(resource2) },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.completed, false);
    assert.equal(res.body.data.lastAccessedResource, id(resource2));
    assert.ok(res.body.data.lastAccessedAt);
  });

  it('computes totals from currently-published concepts only, and reports the most recent access', async () => {
    await req('PATCH', `/progress/concept/${id(concept1)}/complete`, { as: student });
    await req('PATCH', `/progress/course/${id(course)}/access`, {
      as: student,
      body: { conceptId: id(concept2), resourceId: id(resource2) },
    });

    const res = await req('GET', `/progress/course/${id(course)}`, { as: student });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.summary, { totalConcepts: 2, completedConcepts: 1, remainingConcepts: 1, percentage: 50 });
    assert.equal(res.body.data.conceptProgress.length, 2); // the draft concept never appears
    assert.deepEqual(res.body.data.lastAccessed, { conceptId: id(concept2), resourceId: id(resource2) });
  });

  it('returns zero percent, not an error, for a course with no published concepts', async () => {
    const empty = await Course.create({ title: 'Empty Course', slug: 'empty-course', status: 'published', order: 2, createdBy: admin._id });
    const res = await req('GET', `/progress/course/${id(empty)}`, { as: student });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.summary, { totalConcepts: 0, completedConcepts: 0, remainingConcepts: 0, percentage: 0 });
  });
});

describe('my learning', () => {
  it('lists only courses this student has progress in, with correct totals', async () => {
    const res = await req('GET', '/progress/my-learning', { as: student });

    assert.equal(res.status, 200);
    const entry = res.body.data.find((item) => item.course.id === id(course));
    assert.ok(entry);
    assert.deepEqual(entry.progress, { totalConcepts: 2, completedConcepts: 1, percentage: 50 });
    assert.equal(entry.lastAccessed.resourceId, id(resource2));
    assert.equal(entry.lastAccessed.title, 'R2');

    assert.equal(res.body.data.some((item) => item.course.id === id(f.pub)), false); // no progress there
  });

  it('drops a course from the list once it is no longer published', async () => {
    const temp = await Course.create({ title: 'Temp Course', slug: 'temp-course', status: 'published', order: 3, createdBy: admin._id });
    const tempModule = await Module.create({ course: temp._id, title: 'M', slug: 'm', status: 'published', order: 1, createdBy: admin._id });
    const tempTopic = await Topic.create({ module: tempModule._id, title: 'T', slug: 't', status: 'published', order: 1, createdBy: admin._id });
    const tempConcept = await Concept.create({ topic: tempTopic._id, title: 'C', slug: 'c', status: 'published', order: 1, createdBy: admin._id });
    const tempResource = await Resource.create({ concept: tempConcept._id, type: 'theory', title: 'R', url: 'https://example.com/r', status: 'published', order: 1, createdBy: admin._id });

    await req('PATCH', `/progress/course/${id(temp)}/access`, { as: student, body: { conceptId: id(tempConcept), resourceId: id(tempResource) } });
    assert.ok((await req('GET', '/progress/my-learning', { as: student })).body.data.some((item) => item.course.id === id(temp)));

    await Course.updateOne({ _id: temp._id }, { $set: { status: 'archived' } });
    assert.equal((await req('GET', '/progress/my-learning', { as: student })).body.data.some((item) => item.course.id === id(temp)), false);
  });
});