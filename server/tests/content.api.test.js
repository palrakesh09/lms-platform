import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Course, Module, Progress, Topic } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24); // well-formed, but nothing has it
const id = (doc) => String(doc._id);

let api;
let f; // fixtures
let admin, mentorA, mentorB, student;

const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);
});
after(() => api?.stop());

describe('authentication and identifiers', () => {
  it('answers 401 for every route without a login', async () => {
    const targets = [
      ['GET', '/courses'],
      ['POST', '/courses'],
      ['GET', `/courses/${id(f.pub)}`],
      ['GET', `/courses/${id(f.pub)}/structure`],
      ['GET', `/modules/${id(f.pubTree.mod)}`],
      ['DELETE', `/resources/${id(f.pubTree.resource)}`],
    ];
    for (const [method, path] of targets) {
      assert.equal((await req(method, path)).status, 401, `${method} ${path}`);
    }
  });

  it('answers 400 for malformed ids', async () => {
    const paths = [
      '/courses/not-an-id', '/courses/not-an-id/structure', '/courses/x/modules',
      '/modules/123', '/topics/abc', '/concepts/abc/resources', '/resources/abc',
    ];
    for (const path of paths) assert.equal((await req('GET', path, { as: admin })).status, 400, path);
  });

  it('answers 404 for well-formed ids that do not exist', async () => {
    const paths = [
      `/courses/${MISSING_ID}`, `/courses/${MISSING_ID}/structure`, `/courses/${MISSING_ID}/modules`,
      `/modules/${MISSING_ID}`, `/modules/${MISSING_ID}/topics`, `/topics/${MISSING_ID}`,
      `/topics/${MISSING_ID}/concepts`, `/concepts/${MISSING_ID}`, `/concepts/${MISSING_ID}/resources`,
      `/resources/${MISSING_ID}`,
    ];
    for (const path of paths) assert.equal((await req('GET', path, { as: admin })).status, 404, path);
  });
});

describe('courses: admin lifecycle', () => {
  let course;

  it('creates a draft, derives the slug, and takes createdBy from the token', async () => {
    const res = await req('POST', '/courses', {
      as: admin,
      body: { title: 'Full Stack Web Development', category: 'web-development', instructors: [id(mentorA)] },
    });

    assert.equal(res.status, 201);
    course = res.body.data;
    assert.equal(course.slug, 'full-stack-web-development');
    assert.equal(course.status, 'draft');
    assert.equal(course.createdBy, id(admin));
    assert.deepEqual(course.instructors, [id(mentorA)]);
  });

  it('answers 409 for a duplicate slug, without exposing the database error', async () => {
    const res = await req('POST', '/courses', { as: admin, body: { title: 'Another', slug: course.slug } });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'CONFLICT');
    assert.match(res.body.error.message, /already exists/);
    assert.equal(JSON.stringify(res.body).includes('E11000'), false);
  });

  it('rejects protected and unknown fields (mass assignment)', async () => {
    const res = await req('POST', '/courses', {
      as: admin,
      body: { title: 'Sneaky course', status: 'published', createdBy: id(student), role: 'admin' },
    });

    assert.equal(res.status, 422);
    assert.equal(await Course.countDocuments({ title: 'Sneaky course' }), 0);
  });

  it('rejects instructors who are not active mentors', async () => {
    const res = await req('PATCH', `/courses/${course.id}`, { as: admin, body: { instructors: [id(student)] } });

    assert.equal(res.status, 422);
    assert.equal(res.body.error.details[0].field, 'instructors');
  });

  it('updates a course and stamps updatedBy', async () => {
    const res = await req('PATCH', `/courses/${course.id}`, { as: admin, body: { title: 'FSWD version 2' } });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, 'FSWD version 2');
    assert.equal(res.body.data.updatedBy, id(admin));
  });

  it('answers 409 when an update takes another course\'s slug', async () => {
    const res = await req('PATCH', `/courses/${course.id}`, { as: admin, body: { slug: 'pub-course' } });
    assert.equal(res.status, 409);
  });

  it('validates fields and requires at least one', async () => {
    const bad = await req('PATCH', `/courses/${course.id}`, {
      as: admin,
      body: { level: 'expert', thumbnail: 'javascript:alert(1)' },
    });
    assert.equal(bad.status, 422);
    assert.deepEqual(bad.body.error.details.map((d) => d.field).sort(), ['level', 'thumbnail']);

    assert.equal((await req('PATCH', `/courses/${course.id}`, { as: admin, body: {} })).status, 422);
  });

  it('publishes, then archives, changing what a student can see', async () => {
    const published = await req('PATCH', `/courses/${course.id}/publish`, { as: admin });
    assert.equal(published.status, 200);
    assert.equal(published.body.data.status, 'published');
    assert.equal((await req('GET', `/courses/${course.id}`, { as: student })).status, 200);

    const archivedRes = await req('PATCH', `/courses/${course.id}/archive`, { as: admin });
    assert.equal(archivedRes.body.data.status, 'archived');
    assert.equal((await req('GET', `/courses/${course.id}`, { as: student })).status, 404);
  });

  it('refuses to delete a course that contains modules, and deletes an empty one', async () => {
    const blocked = await req('DELETE', `/courses/${id(f.pub)}`, { as: admin });
    assert.equal(blocked.status, 409);
    assert.match(blocked.body.error.message, /modules/);

    assert.equal((await req('DELETE', `/courses/${course.id}`, { as: admin })).status, 200);
    assert.equal((await req('GET', `/courses/${course.id}`, { as: admin })).status, 404);
  });
});

describe('courses: listing', () => {
  const list = (as, query = '') => req('GET', `/courses${query}`, { as });

  it('uses the envelope with pagination', async () => {
    const res = await list(admin);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.deepEqual(Object.keys(res.body.pagination).sort(), ['limit', 'page', 'total', 'totalPages']);
  });

  it('shows students published courses only, without staff fields', async () => {
    const res = await list(student, '?limit=50');
    const ids = res.body.data.map((course) => course.id);

    assert.ok(res.body.data.length >= 2);
    assert.ok(res.body.data.every((course) => course.status === 'published'));
    assert.equal(ids.includes(id(f.draft)), false);
    assert.equal(ids.includes(id(f.archived)), false);
    assert.equal('createdBy' in res.body.data[0], false);
    assert.equal('instructors' in res.body.data[0], false);
  });

  it('does not let a student ask for drafts', async () => {
    const res = await list(student, '?status=draft');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
    assert.equal(res.body.pagination.total, 0);
  });

  it('shows a mentor only the courses they instruct, in any status', async () => {
    const forA = (await list(mentorA, '?limit=50')).body.data.map((course) => course.id).sort();
    assert.deepEqual(forA, [id(f.pub), id(f.draft), id(f.archived)].sort());

    const forB = (await list(mentorB)).body.data.map((course) => course.id);
    assert.deepEqual(forB, [id(f.other)]);
  });

  it('lets an admin filter by status, category, level and search', async () => {
    const drafts = await list(admin, '?status=draft');
    assert.ok(drafts.body.data.every((course) => course.status === 'draft'));
    assert.ok(drafts.body.data.some((course) => course.id === id(f.draft)));

    assert.ok((await list(admin, '?category=general&level=beginner')).body.data.length >= 4);
    assert.equal((await list(admin, '?level=advanced')).body.data.length, 0);
    assert.ok((await list(admin, '?search=PUB')).body.data.some((course) => course.id === id(f.pub)));
  });

  it('paginates', async () => {
    const res = await list(admin, '?limit=2&page=1');

    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.pagination.limit, 2);
    assert.equal(res.body.pagination.totalPages, Math.ceil(res.body.pagination.total / 2));
  });

  it('rejects unsafe pagination and sort values', async () => {
    for (const query of ['?limit=0', '?limit=51', '?page=0', '?page=abc', '?sort=password']) {
      assert.equal((await list(admin, query)).status, 422, query);
    }
  });

  it('treats search text literally, never as a regular expression', async () => {
    for (const query of ['?search=.*', '?search=(', '?search=%5B']) {
      const res = await list(admin, query);
      assert.equal(res.status, 200, query);
      assert.deepEqual(res.body.data, [], query);
    }
  });

  it('sorts by title descending', async () => {
    const titles = (await list(admin, '?sort=-title&limit=50')).body.data.map((course) => course.title);
    assert.deepEqual(titles, [...titles].sort().reverse());
  });
});

describe('mentor: courses', () => {
  it('reads assigned courses (any status) but gets 404 for others', async () => {
    const own = await req('GET', `/courses/${id(f.draft)}`, { as: mentorA });
    assert.equal(own.status, 200);
    assert.equal('instructors' in own.body.data, false);

    assert.equal((await req('GET', `/courses/${id(f.other)}`, { as: mentorA })).status, 404);
  });

  it('may edit descriptive fields of an assigned course', async () => {
    const res = await req('PATCH', `/courses/${id(f.pub)}`, { as: mentorA, body: { shortDescription: 'By mentor' } });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.updatedBy, id(mentorA));
  });

  it('cannot change slug, order, status or instructors', async () => {
    for (const body of [{ slug: 'x' }, { order: 3 }, { status: 'published' }, { instructors: [id(mentorA)] }]) {
      assert.equal((await req('PATCH', `/courses/${id(f.pub)}`, { as: mentorA, body })).status, 422, JSON.stringify(body));
    }
  });

  it('cannot create, delete, publish or archive, or edit an unassigned course', async () => {
    const attempts = [
      ['POST', '/courses', { title: 'Mentor course' }],
      ['DELETE', `/courses/${id(f.pub)}`],
      ['PATCH', `/courses/${id(f.pub)}/publish`],
      ['PATCH', `/courses/${id(f.draft)}/archive`],
      ['PATCH', `/courses/${id(f.other)}`, { title: 'Hijack' }],
    ];
    for (const [method, path, body] of attempts) {
      assert.equal((await req(method, path, { as: mentorA, body })).status, 403, `${method} ${path}`);
    }
  });
});

describe('mentor: content in an assigned course', () => {
  const made = {};

  it('creates module, topic, concept and resource', async () => {
    const post = async (path, body) => {
      const res = await req('POST', path, { as: mentorA, body });
      assert.equal(res.status, 201, JSON.stringify(res.body));
      return res.body.data;
    };

    const mod = await post(`/courses/${id(f.pub)}/modules`, { title: 'Mentor module' });
    assert.equal(mod.course, id(f.pub));
    assert.equal(mod.createdBy, id(mentorA));

    const topic = await post(`/modules/${mod.id}/topics`, { title: 'Mentor topic' });
    const concept = await post(`/topics/${topic.id}/concepts`, { title: 'Mentor concept' });
    const resource = await post(`/concepts/${concept.id}/resources`, {
      type: 'mini-project',
      title: 'Build a page',
      url: 'https://example.com/project',
    });
    assert.equal(resource.openInNewTab, true);

    Object.assign(made, { mod: mod.id, topic: topic.id, concept: concept.id, resource: resource.id });
  });

  it('updates every level', async () => {
    const paths = [`/modules/${made.mod}`, `/topics/${made.topic}`, `/concepts/${made.concept}`, `/resources/${made.resource}`];

    for (const path of paths) {
      const res = await req('PATCH', path, { as: mentorA, body: { title: 'Renamed' } });
      assert.equal(res.status, 200, path);
      assert.equal(res.body.data.updatedBy, id(mentorA));
    }
  });

  it('cannot delete a parent that still has children', async () => {
    for (const path of [`/modules/${made.mod}`, `/topics/${made.topic}`, `/concepts/${made.concept}`]) {
      assert.equal((await req('DELETE', path, { as: mentorA })).status, 409, path);
    }
  });

  it('deletes leaf first', async () => {
    for (const path of [`/resources/${made.resource}`, `/concepts/${made.concept}`, `/topics/${made.topic}`, `/modules/${made.mod}`]) {
      assert.equal((await req('DELETE', path, { as: mentorA })).status, 200, path);
    }
    assert.equal((await req('GET', `/modules/${made.mod}`, { as: admin })).status, 404);
  });
});

describe('mentor: content they do not own', () => {
  it('cannot manipulate another mentor\'s course', async () => {
    const t = f.otherTree;
    const attempts = [
      ['POST', `/courses/${id(f.other)}/modules`, { title: 'Nope' }],
      ['PATCH', `/modules/${id(t.mod)}`, { title: 'Nope' }],
      ['POST', `/modules/${id(t.mod)}/topics`, { title: 'Nope' }],
      ['PATCH', `/topics/${id(t.topic)}`, { title: 'Nope' }],
      ['POST', `/topics/${id(t.topic)}/concepts`, { title: 'Nope' }],
      ['PATCH', `/concepts/${id(t.concept)}`, { title: 'Nope' }],
      ['POST', `/concepts/${id(t.concept)}/resources`, { type: 'theory', title: 'Nope', url: 'https://example.com' }],
      ['DELETE', `/resources/${id(t.resource)}`],
    ];
    for (const [method, path, body] of attempts) {
      assert.equal((await req(method, path, { as: mentorA, body })).status, 403, `${method} ${path}`);
    }
    assert.equal(await Module.countDocuments({ course: f.other._id }), 1);
  });

  it('cannot even read it directly by id (404), and the reverse holds for mentor B', async () => {
    assert.equal((await req('GET', `/modules/${id(f.otherTree.mod)}`, { as: mentorA })).status, 404);
    assert.equal((await req('GET', `/courses/${id(f.other)}/structure`, { as: mentorA })).status, 404);
    assert.equal((await req('GET', `/modules/${id(f.pubTree.mod)}`, { as: mentorB })).status, 404);
    assert.equal((await req('DELETE', `/resources/${id(f.pubTree.resource)}`, { as: mentorB })).status, 403);
  });
});

describe('student', () => {
  it('reads published courses, including ones run by other mentors', async () => {
    assert.equal((await req('GET', `/courses/${id(f.pub)}`, { as: student })).status, 200);
    assert.equal((await req('GET', `/courses/${id(f.other)}`, { as: student })).status, 200);
  });

  it('gets the same 404 for draft and archived courses as for missing ones', async () => {
    const missing = await req('GET', `/courses/${MISSING_ID}`, { as: student });

    for (const course of [f.draft, f.archived]) {
      const res = await req('GET', `/courses/${id(course)}`, { as: student });
      assert.equal(res.status, 404);
      assert.deepEqual(res.body, missing.body);
    }
  });

  it('gets only published content in the structure', async () => {
    const res = await req('GET', `/courses/${id(f.pub)}/structure`, { as: student });
    const { modules } = res.body.data;

    assert.equal(res.status, 200);
    assert.deepEqual(modules.map((m) => m.id), [id(f.pubTree.mod)]);
    assert.deepEqual(modules[0].topics.map((t) => t.id), [id(f.pubTree.topic)]);
    assert.deepEqual(modules[0].topics[0].concepts.map((c) => c.id), [id(f.pubTree.concept)]);
    assert.deepEqual(modules[0].topics[0].concepts[0].resources.map((r) => r.id), [id(f.pubTree.resource)]);
    assert.equal('status' in modules[0], false);

    for (const course of [f.draft, f.archived]) {
      assert.equal((await req('GET', `/courses/${id(course)}/structure`, { as: student })).status, 404);
    }
  });

  it('cannot reach unpublished content directly by id', async () => {
    const paths = [
      `/modules/${id(f.hiddenModule)}`, `/topics/${id(f.topicUnderHiddenModule)}`, `/topics/${id(f.hiddenTopic)}`,
      `/concepts/${id(f.hiddenConcept)}`, `/resources/${id(f.hiddenResource)}`,
      `/modules/${id(f.draftTree.mod)}`, `/resources/${id(f.draftTree.resource)}`, `/resources/${id(f.archivedTree.resource)}`,
      `/courses/${id(f.draft)}/modules`, `/concepts/${id(f.draftTree.concept)}/resources`,
    ];
    for (const path of paths) assert.equal((await req('GET', path, { as: student })).status, 404, path);
  });

  it('gets only published items in list endpoints', async () => {
    const ids = async (path) => (await req('GET', path, { as: student })).body.data.map((item) => item.id);

    assert.deepEqual(await ids(`/courses/${id(f.pub)}/modules`), [id(f.pubTree.mod)]);
    assert.deepEqual(await ids(`/modules/${id(f.pubTree.mod)}/topics`), [id(f.pubTree.topic)]);
    assert.deepEqual(await ids(`/topics/${id(f.pubTree.topic)}/concepts`), [id(f.pubTree.concept)]);
    assert.deepEqual(await ids(`/concepts/${id(f.pubTree.concept)}/resources`), [id(f.pubTree.resource)]);
  });

  it('is denied every write with 403', async () => {
    const t = f.pubTree;
    const attempts = [
      ['POST', '/courses', { title: 'Nope course' }],
      ['PATCH', `/courses/${id(f.pub)}`, { title: 'Nope' }],
      ['DELETE', `/courses/${id(f.pub)}`],
      ['PATCH', `/courses/${id(f.pub)}/publish`],
      ['PATCH', `/courses/${id(f.pub)}/archive`],
      ['POST', `/courses/${id(f.pub)}/modules`, { title: 'Nope' }],
      ['PATCH', `/modules/${id(t.mod)}`, { title: 'Nope' }],
      ['DELETE', `/topics/${id(t.topic)}`],
      ['POST', `/topics/${id(t.topic)}/concepts`, { title: 'Nope' }],
      ['POST', `/concepts/${id(t.concept)}/resources`, { type: 'theory', title: 'Nope', url: 'https://example.com' }],
      ['DELETE', `/resources/${id(t.resource)}`],
    ];
    for (const [method, path, body] of attempts) {
      assert.equal((await req(method, path, { as: student, body })).status, 403, `${method} ${path}`);
    }
  });
});

describe('admin: content rules', () => {
  const made = {};

  it('reads draft and archived content', async () => {
    const paths = [
      `/courses/${id(f.draft)}`, `/courses/${id(f.archived)}`, `/resources/${id(f.draftTree.resource)}`,
      `/modules/${id(f.hiddenModule)}`, `/resources/${id(f.hiddenResource)}`,
    ];
    for (const path of paths) assert.equal((await req('GET', path, { as: admin })).status, 200, path);

    const { modules } = (await req('GET', `/courses/${id(f.pub)}/structure`, { as: admin })).body.data;
    assert.equal(modules.length, 2);
    assert.equal(modules.find((m) => m.id === id(f.hiddenModule)).topics.length, 1);
    assert.equal(modules.find((m) => m.id === id(f.pubTree.mod)).topics.length, 2);
  });

  it('builds a course tree through the nested routes', async () => {
    const post = async (path, body) => {
      const res = await req('POST', path, { as: admin, body });
      assert.equal(res.status, 201, JSON.stringify(res.body));
      return res.body.data;
    };

    const course = await post('/courses', { title: 'Admin Course' });
    const mod = await post(`/courses/${course.id}/modules`, { title: 'Module One' });
    assert.equal(mod.order, 1);
    assert.equal(mod.status, 'draft');
    assert.equal(mod.slug, 'module-one');

    const topic = await post(`/modules/${mod.id}/topics`, { title: 'Topic One' });
    const concept = await post(`/topics/${topic.id}/concepts`, { title: 'Concept One' });
    const theory = await post(`/concepts/${concept.id}/resources`, { type: 'theory', title: 'Theory', url: 'https://example.com/t', order: 2 });
    const task = await post(`/concepts/${concept.id}/resources`, { type: 'task', title: 'Task', url: 'https://example.com/k', order: 1 });

    Object.assign(made, { course: course.id, mod: mod.id, topic: topic.id, concept: concept.id, theory: theory.id, task: task.id });
  });

  it('lists resources by order, and filters by type', async () => {
    const all = await req('GET', `/concepts/${made.concept}/resources`, { as: admin });
    assert.deepEqual(all.body.data.map((r) => r.title), ['Task', 'Theory']);

    const onlyTheory = await req('GET', `/concepts/${made.concept}/resources?type=theory`, { as: admin });
    assert.deepEqual(onlyTheory.body.data.map((r) => r.title), ['Theory']);

    assert.equal((await req('GET', `/concepts/${made.concept}/resources?type=video`, { as: admin })).status, 422);
  });

  it('sorts the structure by order', async () => {
    await req('POST', `/courses/${made.course}/modules`, { as: admin, body: { title: 'Module Late', order: 9 } });
    await req('POST', `/courses/${made.course}/modules`, { as: admin, body: { title: 'Module Early', order: 0 } });

    const { modules } = (await req('GET', `/courses/${made.course}/structure`, { as: admin })).body.data;
    assert.deepEqual(modules.map((m) => m.title), ['Module Early', 'Module One', 'Module Late']);
    assert.deepEqual(modules[1].topics[0].concepts[0].resources.map((r) => r.title), ['Task', 'Theory']);
  });

  it('validates resource input', async () => {
    const bad = await req('POST', `/concepts/${made.concept}/resources`, {
      as: admin,
      body: { type: 'video', title: 'Bad', url: 'javascript:alert(1)' },
    });
    assert.equal(bad.status, 422);
    assert.deepEqual(bad.body.error.details.map((d) => d.field).sort(), ['type', 'url']);

    const noUrl = await req('POST', `/concepts/${made.concept}/resources`, { as: admin, body: { type: 'theory', title: 'No url' } });
    assert.equal(noUrl.status, 422);
  });

  it('answers 409 for a duplicate slug within a course, but allows it in another course', async () => {
    const dup = await req('POST', `/courses/${made.course}/modules`, { as: admin, body: { title: 'Again', slug: 'module-one' } });
    assert.equal(dup.status, 409);
    assert.match(dup.body.error.message, /module with this slug already exists in this course/);

    const second = await req('POST', '/courses', { as: admin, body: { title: 'Second Course' } });
    const ok = await req('POST', `/courses/${second.body.data.id}/modules`, { as: admin, body: { title: 'Module One' } });
    assert.equal(ok.status, 201);
  });

  it('rejects mismatched parents in the body and never re-parents', async () => {
    const before = await Module.countDocuments({ course: f.other._id });

    const attempts = [
      ['POST', `/courses/${made.course}/modules`, { title: 'Sneaky', course: id(f.other) }],
      ['POST', `/modules/${made.mod}/topics`, { title: 'Sneaky', module: id(f.otherTree.mod) }],
      ['PATCH', `/topics/${made.topic}`, { module: id(f.otherTree.mod) }],
      ['PATCH', `/modules/${made.mod}`, { course: id(f.other) }],
    ];
    for (const [method, path, body] of attempts) {
      assert.equal((await req(method, path, { as: admin, body })).status, 422, `${method} ${path}`);
    }

    assert.equal(await Module.countDocuments({ course: f.other._id }), before);
    assert.equal(String((await Topic.findById(made.topic)).module), made.mod);
  });

  it('refuses to delete parents that still have children', async () => {
    const cases = [
      [`/courses/${made.course}`, /modules/],
      [`/modules/${made.mod}`, /topics/],
      [`/topics/${made.topic}`, /concepts/],
      [`/concepts/${made.concept}`, /resources/],
    ];
    for (const [path, pattern] of cases) {
      const res = await req('DELETE', path, { as: admin });
      assert.equal(res.status, 409, path);
      assert.equal(res.body.error.code, 'CONFLICT');
      assert.match(res.body.error.message, pattern);
    }
  });

  it('refuses to delete a concept that has student progress', async () => {
    const tracked = (await req('POST', `/topics/${made.topic}/concepts`, { as: admin, body: { title: 'Tracked concept' } })).body.data;
    await Progress.create({ student: student._id, course: made.course, concept: tracked.id });

    const blocked = await req('DELETE', `/concepts/${tracked.id}`, { as: admin });
    assert.equal(blocked.status, 409);
    assert.match(blocked.body.error.message, /progress/);

    await Progress.deleteMany({ concept: tracked.id });
    assert.equal((await req('DELETE', `/concepts/${tracked.id}`, { as: admin })).status, 200);
  });

  it('deletes leaf first', async () => {
    for (const path of [`/resources/${made.theory}`, `/resources/${made.task}`, `/concepts/${made.concept}`, `/topics/${made.topic}`, `/modules/${made.mod}`]) {
      assert.equal((await req('DELETE', path, { as: admin })).status, 200, path);
    }
  });
});