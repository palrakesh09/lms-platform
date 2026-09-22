import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Course, User } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);

let api;
let f; // fixtures: pub (mentorA), draft (mentorA), archived (mentorA), other (mentorB)
let admin, mentorA, mentorB, student;

const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);
});
after(() => api?.stop());

// Runs first, before any test changes users or courses.
describe('admin stats', () => {
  it('is admin-only', async () => {
    assert.equal((await req('GET', '/admin/stats')).status, 401);
    assert.equal((await req('GET', '/admin/stats', { as: mentorA })).status, 403);
    assert.equal((await req('GET', '/admin/stats', { as: student })).status, 403);
  });

  it('returns counts from the database', async () => {
    const res = await req('GET', '/admin/stats', { as: admin });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, {
      courses: { total: 4, published: 2, draft: 1, archived: 1 },
      users: { total: 4, active: 4, inactive: 0, admins: 1, mentors: 2, students: 1 },
    });
  });
});

describe('users: access and listing', () => {
  it('answers 401 without a login and 403 for mentors and students on every route', async () => {
    const routes = [
      ['GET', '/users'],
      ['GET', `/users/${id(student)}`],
      ['PATCH', `/users/${id(student)}/status`, { isActive: false }],
      ['PATCH', `/users/${id(student)}/role`, { role: 'mentor' }],
    ];
    for (const [method, path, body] of routes) {
      assert.equal((await req(method, path, { body })).status, 401, `${method} ${path}`);
      for (const as of [mentorA, student]) {
        assert.equal((await req(method, path, { as, body })).status, 403, `${method} ${path}`);
      }
    }
  });

  it('lists users with pagination and never exposes password fields', async () => {
    const res = await req('GET', '/users', { as: admin });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 4);
    assert.deepEqual(Object.keys(res.body.pagination).sort(), ['limit', 'page', 'total', 'totalPages']);
    assert.deepEqual(
      Object.keys(res.body.data[0]).sort(),
      ['avatar', 'createdAt', 'email', 'id', 'isActive', 'name', 'role', 'updatedAt'],
    );
    assert.equal(JSON.stringify(res.body).includes('password'), false);
  });

  it('filters by role, active state and search', async () => {
    const ids = async (query) => (await req('GET', `/users${query}`, { as: admin })).body.data.map((user) => user.id).sort();

    assert.deepEqual(await ids('?role=mentor'), [id(mentorA), id(mentorB)].sort());
    assert.deepEqual(await ids('?role=student'), [id(student)]);
    assert.equal((await ids('?isActive=true')).length, 4);
    assert.equal((await ids('?isActive=false')).length, 0);
    assert.deepEqual(await ids('?search=mentora'), [id(mentorA)]);
  });

  it('rejects bad query values and treats search literally', async () => {
    for (const query of ['?role=root', '?limit=51', '?page=0', '?isActive=maybe', '?sort=password']) {
      assert.equal((await req('GET', `/users${query}`, { as: admin })).status, 422, query);
    }
    const literal = await req('GET', '/users?search=.*', { as: admin });
    assert.equal(literal.status, 200);
    assert.deepEqual(literal.body.data, []);
  });

  it('gets one user, 404 for unknown and 400 for malformed ids', async () => {
    assert.equal((await req('GET', `/users/${id(student)}`, { as: admin })).body.data.email, 'student@example.com');
    assert.equal((await req('GET', `/users/${MISSING_ID}`, { as: admin })).status, 404);
    assert.equal((await req('GET', '/users/not-an-id', { as: admin })).status, 400);
  });
});

describe('users: status', () => {
  const patch = (target, body, as = admin) => req('PATCH', `/users/${id(target)}/status`, { as, body });

  it('deactivates and reactivates, taking effect on the next request', async () => {
    assert.equal((await req('GET', '/auth/me', { as: student })).status, 200);

    const off = await patch(student, { isActive: false });
    assert.equal(off.status, 200);
    assert.equal(off.body.data.isActive, false);

    const blocked = await req('GET', '/auth/me', { as: student });
    assert.equal(blocked.status, 401);
    assert.equal(blocked.body.error.message, 'This account is disabled');

    assert.equal((await patch(student, { isActive: true })).status, 200);
    assert.equal((await req('GET', '/auth/me', { as: student })).status, 200);
  });

  it('refuses to change the caller or another administrator', async () => {
    const admin2 = await User.create({ name: 'Second Admin', email: 'admin2@example.com', password: 'placeholder-hash', role: 'admin' });

    assert.equal((await patch(admin, { isActive: false })).status, 403);
    assert.equal((await patch(admin2, { isActive: false })).status, 403);
    assert.equal((await User.findById(admin2._id)).isActive, true);
  });

  it('validates the body strictly and answers 404 for unknown users', async () => {
    assert.equal((await patch(student, {})).status, 422);
    assert.equal((await patch(student, { isActive: 'no' })).status, 422);
    assert.equal((await patch(student, { isActive: false, role: 'admin' })).status, 422);
    assert.equal((await req('PATCH', `/users/${MISSING_ID}/status`, { as: admin, body: { isActive: false } })).status, 404);
  });
});

describe('users: role', () => {
  let promo;
  before(async () => {
    promo = await User.create({ name: 'Promo User', email: 'promo@example.com', password: 'placeholder-hash', role: 'student' });
  });

  const patch = (target, body, as = admin) => req('PATCH', `/users/${id(target)}/role`, { as, body });

  it('promotes a student to mentor, and demoting removes them from courses', async () => {
    const up = await patch(promo, { role: 'mentor' });
    assert.equal(up.status, 200);
    assert.equal(up.body.data.role, 'mentor');

    await Course.updateOne({ _id: f.pub._id }, { $addToSet: { instructors: promo._id } });
    assert.equal((await patch(promo, { role: 'student' })).body.data.role, 'student');

    const course = await Course.findById(f.pub._id).lean();
    const instructors = course.instructors.map(String);
    assert.equal(instructors.includes(id(promo)), false);
    assert.equal(instructors.includes(id(mentorA)), true);
  });

  it('never grants the admin role', async () => {
    for (const role of ['admin', 'superuser', '', undefined]) {
      assert.equal((await patch(promo, { role })).status, 422, String(role));
    }
    assert.equal((await User.findById(promo._id)).role, 'student');
  });

  it('refuses to change the caller or an administrator', async () => {
    assert.equal((await patch(admin, { role: 'student' })).status, 403);
    const other = await User.findOne({ email: 'admin2@example.com' });
    assert.equal((await patch(other, { role: 'mentor' })).status, 403);
    assert.equal((await User.findById(other._id)).role, 'admin');
  });
});

describe('course mentors', () => {
  const url = (course) => `/courses/${id(course)}/mentors`;
  const instructorsOf = async (course) => (await Course.findById(course._id).lean()).instructors.map(String).sort();

  it('lists assigned mentors', async () => {
    const res = await req('GET', url(f.pub), { as: admin });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((mentor) => mentor.id), [id(mentorA)]);
    assert.deepEqual(Object.keys(res.body.data[0]).sort(), ['avatar', 'email', 'id', 'isActive', 'name', 'role']);
  });

  it('is admin-only: mentors (even the course\'s own) and students get 403, guests 401', async () => {
    assert.equal((await req('GET', url(f.pub))).status, 401);
    for (const as of [mentorA, mentorB, student]) {
      assert.equal((await req('GET', url(f.pub), { as })).status, 403);
      assert.equal((await req('PATCH', url(f.pub), { as, body: { mentorIds: [id(as)] } })).status, 403);
    }
    assert.deepEqual(await instructorsOf(f.pub), [id(mentorA)]);
  });

  it('rejects ids that are not active mentors, and changes nothing', async () => {
    for (const mentorIds of [[id(student)], [MISSING_ID], [id(mentorA), id(admin)]]) {
      const res = await req('PATCH', url(f.pub), { as: admin, body: { mentorIds } });
      assert.equal(res.status, 422, JSON.stringify(mentorIds));
    }
    assert.deepEqual(await instructorsOf(f.pub), [id(mentorA)]);
  });

  it('replaces the list and stamps updatedBy', async () => {
    const res = await req('PATCH', url(f.pub), { as: admin, body: { mentorIds: [id(mentorA), id(mentorB)] } });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2);
    assert.deepEqual(await instructorsOf(f.pub), [id(mentorA), id(mentorB)].sort());
    assert.equal(String((await Course.findById(f.pub._id)).updatedBy), id(admin));
  });

  it('lets an admin keep or remove a mentor who was deactivated, but not add one', async () => {
    await User.updateOne({ _id: mentorB._id }, { isActive: false });

    const keep = await req('PATCH', url(f.pub), { as: admin, body: { mentorIds: [id(mentorA), id(mentorB)] } });
    assert.equal(keep.status, 200);
    assert.equal(keep.body.data.find((mentor) => mentor.id === id(mentorB)).isActive, false);

    const add = await req('PATCH', url(f.draft), { as: admin, body: { mentorIds: [id(mentorA), id(mentorB)] } });
    assert.equal(add.status, 422);

    assert.equal((await req('PATCH', url(f.pub), { as: admin, body: { mentorIds: [id(mentorA)] } })).status, 200);
    await User.updateOne({ _id: mentorB._id }, { isActive: true });
  });

  it('removes duplicates', async () => {
    const res = await req('PATCH', url(f.pub), { as: admin, body: { mentorIds: [id(mentorA), id(mentorA)] } });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
  });

  it('validates the body and the course id', async () => {
    const tooMany = Array.from({ length: 21 }, (_, index) => index.toString(16).padStart(24, '0'));
    const bad = [{}, { mentorIds: 'x' }, { mentorIds: ['nope'] }, { mentorIds: tooMany }, { mentorIds: [], instructors: [] }];

    for (const body of bad) {
      assert.equal((await req('PATCH', url(f.pub), { as: admin, body })).status, 422, JSON.stringify(body).slice(0, 60));
    }
    assert.equal((await req('GET', `/courses/${MISSING_ID}/mentors`, { as: admin })).status, 404);
    assert.equal((await req('GET', '/courses/not-an-id/mentors', { as: admin })).status, 400);
  });
});