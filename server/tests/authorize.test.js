import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { COURSES, USERS, cookieWithToken, setupTestApp } from './helpers/testKit.js';
import { authorize } from '../src/middleware/authorize.js';

let ctx;
before(async () => {
  ctx = await setupTestApp();
});
after(() => ctx.teardown());

const runMiddleware = (middleware, req) => {
  let received;
  middleware(req, {}, (error) => {
    received = error;
  });
  return received;
};

describe('authorize() factory', () => {
  it('refuses empty or unknown role lists at startup', () => {
    assert.throws(() => authorize());
    assert.throws(() => authorize('admn'));
    assert.throws(() => authorize('admin', 'superuser'));
  });

  it('answers 401, not a crash, when a route forgot authenticate', () => {
    assert.equal(runMiddleware(authorize('admin'), {}).statusCode, 401);
  });

  it('answers 403 for a role that is not listed', () => {
    assert.equal(runMiddleware(authorize('admin'), { user: { role: 'student' } }).statusCode, 403);
  });

  it('passes any of several listed roles', () => {
    const middleware = authorize('admin', 'mentor');
    assert.equal(runMiddleware(middleware, { user: { role: 'mentor' } }), undefined);
    assert.equal(runMiddleware(middleware, { user: { role: 'admin' } }), undefined);
  });
});

const COURSE = COURSES.assigned._id;

// [label, method, path, expected status per role]
const MATRIX = [
  ['admin-only route', 'GET', '/admin-only', { admin: 200, mentor: 403, student: 403 }],
  ['mentor area', 'GET', '/mentor-area', { admin: 200, mentor: 200, student: 403 }],
  ['student area', 'GET', '/student-area', { admin: 403, mentor: 403, student: 200 }],
  ['read published course', 'GET', `/courses/${COURSE}/read`, { admin: 200, mentor: 200, student: 200 }],
  ['write to course', 'POST', `/courses/${COURSE}/write`, { admin: 200, mentor: 200, student: 403 }],
  ['delete course', 'DELETE', `/courses/${COURSE}`, { admin: 200, mentor: 403, student: 403 }],
];

describe('role restrictions', () => {
  for (const [label, method, path, expected] of MATRIX) {
    describe(`${method} ${label}`, () => {
      it('is 401 without a login', async () => {
        assert.equal((await ctx.call(path, { method })).status, 401);
      });

      for (const [role, status] of Object.entries(expected)) {
        it(`is ${status} for ${role}`, async () => {
          const result = await ctx.call(path, { method, user: USERS[role] });

          assert.equal(result.status, status);
          if (status === 403) {
            assert.equal(result.body.success, false);
            assert.equal(result.body.error.code, 'FORBIDDEN');
            assert.equal(result.body.error.message, 'You do not have permission to perform this action');
          }
        });
      }
    });
  }
});

describe('the role can only come from the database', () => {
  it('ignores a role claim inside a validly signed token', async () => {
    const forged = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      subject: USERS.student._id,
      expiresIn: 60,
    });
    const { status } = await ctx.call('/admin-only', { cookie: cookieWithToken(forged) });

    assert.equal(status, 403);
  });

  it('ignores a role in the query string or headers', async () => {
    const { status } = await ctx.call('/admin-only?role=admin', {
      user: USERS.student,
      headers: { 'X-User-Role': 'admin', 'X-Role': 'admin' },
    });

    assert.equal(status, 403);
  });
});