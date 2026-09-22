import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { USERS, cookieWithToken, id, setupTestApp } from './helpers/testKit.js';

let ctx;
before(async () => {
  ctx = await setupTestApp();
});
after(() => ctx.teardown());

const sign = (claims = {}, options = {}, secret = process.env.JWT_SECRET) =>
  jwt.sign(claims, secret, { subject: USERS.student._id, expiresIn: 60, ...options });

const base64Url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const assertUnauthenticated = ({ status, body }, message) => {
  assert.equal(status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'UNAUTHORIZED');
  if (message) assert.equal(body.error.message, message);
};

describe('authenticate middleware', () => {
  it('rejects a request with no cookie', async () => {
    assertUnauthenticated(await ctx.call('/whoami'), 'Authentication required');
  });

  it('rejects a malformed token', async () => {
    const result = await ctx.call('/whoami', { cookie: cookieWithToken('not.a.token') });
    assertUnauthenticated(result, 'Invalid authentication token');
  });

  it('rejects an expired token', async () => {
    const result = await ctx.call('/whoami', { cookie: cookieWithToken(sign({}, { expiresIn: -10 })) });
    assertUnauthenticated(result, 'Session expired. Please log in again.');
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = sign({}, {}, 'a-different-secret-that-is-long-enough-1234');
    assertUnauthenticated(await ctx.call('/whoami', { cookie: cookieWithToken(forged) }));
  });

  it('rejects an unsigned token (alg "none") claiming to be the admin', async () => {
    const unsigned = `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({
      sub: USERS.admin._id,
      exp: Math.floor(Date.now() / 1000) + 60,
    })}.`;
    assertUnauthenticated(await ctx.call('/whoami', { cookie: cookieWithToken(unsigned) }));
  });

  it('rejects a valid token whose subject is not an ObjectId', async () => {
    const token = sign({}, { subject: 'not-an-object-id' });
    assertUnauthenticated(await ctx.call('/whoami', { cookie: cookieWithToken(token) }));
  });

  it('rejects a valid token for a user that no longer exists', async () => {
    const token = sign({}, { subject: id('ee') });
    assertUnauthenticated(await ctx.call('/whoami', { cookie: cookieWithToken(token) }), 'Authentication required');
  });

  it('rejects a valid token for a disabled account', async () => {
    assertUnauthenticated(await ctx.call('/whoami', { user: USERS.disabled }), 'This account is disabled');
  });

  it('accepts a valid token and exposes only safe user fields', async () => {
    const { status, body } = await ctx.call('/whoami', { user: USERS.student });

    assert.equal(status, 200);
    assert.equal(body.data.user.id, USERS.student._id);
    assert.equal(body.data.user.role, 'student');
    assert.equal('password' in body.data.user, false);
  });
});