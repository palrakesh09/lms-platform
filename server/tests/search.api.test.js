import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Enrollment, Question, Quiz, Resource } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);
let api, f, admin, mentorA, mentorB, student;
const req = (method, path, options) => api.call(method, path, options);
const search = (query, as) => req('GET', `/search?${query}`, { as });
const titles = (res) => res.body.data.map((r) => r.title);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);

  const base = { createdBy: admin._id, order: 1, attachmentLevel: 'concept', attachmentModel: 'Concept' };
  const pubQuiz = await Quiz.create({ ...base, title: 'Pub quiz', slug: 'pub-quiz', course: f.pub._id, attachmentId: f.pubTree.concept._id, status: 'published' });
  await Quiz.create({ ...base, title: 'Pub draft quiz', slug: 'pub-draft-quiz', course: f.pub._id, attachmentId: f.pubTree.concept._id, status: 'draft' });
  await Question.create({ quiz: pubQuiz._id, question: 'Secret question?', options: [{ id: 'a', text: 'Yes' }, { id: 'b', text: 'No' }], correctAnswer: 'a', createdBy: admin._id });

  const res = (title) => Resource.create({ concept: f.pubTree.concept._id, type: 'theory', title, url: 'https://example.com', status: 'published', order: 9, createdBy: admin._id });
  await res('html'); await res('html basics'); await res('intro to html');
});
after(() => api?.stop());

describe('authentication and validation', () => {
  it('401 without a login', async () => assert.equal((await search('q=pub')).status, 401));

  it('rejects bad queries with 422', async () => {
    const bad = ['', 'q=a', `q=${'x'.repeat(101)}`, 'q=pub&type=user', 'q=pub&sort=password', 'q=pub&limit=51', 'q=pub&limit=0',
      'q=pub&page=0', 'q=pub&page=-1', 'q=pub&page=101', 'q=pub&courseId=nope', 'q=aa&q=bb'];
    for (const query of bad) assert.equal((await search(query, admin)).status, 422, query);
  });

  it('never lets operator-style parameters change the query', async () => {
    const res = await search('q=pub&type[$ne]=course&sort[$gt]=', admin);
    assert.ok([200, 422].includes(res.status));
  });

  it('treats regex characters and $-prefixed text literally', async () => {
    for (const q of ['.*', '(', '$title']) {
      const res = await search(`q=${encodeURIComponent(q)}`, admin);
      assert.equal(res.status, 200, q);
      assert.equal(res.body.data.length, 0, q);
    }
  });
});

describe('admin search', () => {
  it('finds every entity type, including drafts, with status shown', async () => {
    const res = await search('q=pub&limit=50', admin);
    const types = new Set(res.body.data.map((r) => r.type));
    for (const t of ['course', 'module', 'topic', 'concept', 'resource', 'quiz']) assert.ok(types.has(t), t);
    assert.ok(titles(res).includes('Pub draft quiz'));
    assert.ok(res.body.data.every((r) => 'status' in r));
  });

  it('finds draft and archived content', async () => {
    assert.ok(titles(await search('q=hidden', admin)).includes('Hidden concept'));
    assert.ok((await search('q=archived', admin)).body.data.length > 0);
  });

  it('orders by relevance: exact, then prefix, then contains', async () => {
    const res = await search('q=html', admin);
    assert.deepEqual(titles(res), ['html', 'html basics', 'intro to html']);
  });

  it('paginates, sorts by title, and reports totals', async () => {
    const p1 = await search('q=html&limit=2&page=1', admin);
    const p2 = await search('q=html&limit=2&page=2', admin);
    assert.equal(p1.body.data.length, 2);
    assert.equal(p2.body.data.length, 1);
    assert.equal(p1.body.pagination.total, 3);
    assert.equal(p1.body.pagination.totalPages, 2);

    const byTitle = await search('q=html&sort=title', admin);
    assert.deepEqual(titles(byTitle), ['html', 'html basics', 'intro to html']);
  });
});

describe('student search', () => {
  it('sees only browsable courses until enrolled', async () => {
    const res = await search('q=pub&limit=50', student);
    assert.deepEqual(res.body.data.map((r) => r.type), ['course']);
    assert.equal(res.body.data[0].enrolled, false);
    assert.equal('status' in res.body.data[0], false);
  });

  it('sees published content of enrolled courses only, never drafts or hidden nodes', async () => {
    await Enrollment.create({ student: student._id, course: f.pub._id });
    const res = await search('q=pub&limit=50', student);
    const types = new Set(res.body.data.map((r) => r.type));
    assert.ok(types.has('module') && types.has('concept') && types.has('resource') && types.has('quiz'));
    assert.equal(titles(res).includes('Pub draft quiz'), false);
    assert.equal((await search('q=hidden', student)).body.data.length, 0);
    assert.equal((await search('q=draft', student)).body.data.length, 0);
    assert.equal((await search('q=archived', student)).body.data.length, 0);
  });

  it('gets no content from a course they are not enrolled in, even by asking for it', async () => {
    const res = await search(`q=other&courseId=${id(f.other)}&limit=50`, student);
    assert.ok(res.body.data.every((r) => r.type === 'course'));
  });

  it('results link to learner routes', async () => {
    const res = await search('q=pub%20resource', student);
    assert.match(res.body.data[0].url, /^\/learn\/[a-f0-9]{24}\/resource\/[a-f0-9]{24}$/);
  });
});

describe('mentor search', () => {
  it('finds only assigned courses, including their drafts', async () => {
    assert.ok(titles(await search('q=hidden', mentorA)).includes('Hidden topic'));
    assert.ok(titles(await search('q=draft', mentorA)).includes('draft course'));
    const other = await search('q=other', mentorA);
    assert.equal(other.body.data.length, 0);
    assert.ok((await search('q=other', mentorB)).body.data.length > 0);
  });

  it('links to the dashboard', async () => {
    const res = await search('q=pub%20module', mentorA);
    assert.match(res.body.data[0].url, /^\/mentor\/courses\//);
  });
});

describe('course-specific search', () => {
  const inCourse = (course, query, as) => req('GET', `/courses/${id(course)}/search?${query}`, { as });

  it('works for admin, the assigned mentor, and an enrolled student', async () => {
    for (const as of [admin, mentorA, student]) assert.equal((await inCourse(f.pub, 'q=pub', as)).status, 200);
  });

  it('never returns course entities, only content', async () => {
    const res = await inCourse(f.pub, 'q=pub', admin);
    assert.ok(res.body.data.every((r) => r.type !== 'course'));
  });

  it('blocks unauthorized access: unenrolled student 403, other mentor 404, malformed id 400', async () => {
    assert.equal((await inCourse(f.other, 'q=other', student)).status, 403);
    assert.equal((await inCourse(f.other, 'q=other', mentorA)).status, 404);
    assert.equal((await req('GET', '/courses/not-an-id/search?q=other', { as: admin })).status, 400);
    assert.equal((await req('GET', `/courses/${MISSING_ID}/search?q=other`, { as: admin })).status, 404);
  });

  it('hides draft course content from students', async () => {
    assert.equal((await inCourse(f.draft, 'q=draft', student)).status, 404);
  });
});

describe('data leakage', () => {
  it('never returns answer keys, audit fields or password fields', async () => {
    for (const as of [admin, mentorA, student]) {
      const text = JSON.stringify((await search('q=pub&limit=50', as)).body);
      for (const forbidden of ['correctAnswer', 'createdBy', 'updatedBy', 'password', 'instructors']) {
        assert.equal(text.includes(forbidden), false, `${forbidden} leaked to ${as.role}`);
      }
    }
    assert.equal(JSON.stringify((await search('q=secret', admin)).body).includes('Secret question'), false); // questions are not searched
  });
});