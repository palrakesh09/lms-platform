import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { getMutationError } from '../src/utils/getMutationError.js';

const httpError = (status, data = {}) =>
  new axios.AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, { status, data, headers: {} });

describe('getMutationError', () => {
  it('shows the API 409 message verbatim, since it names the real reason', () => {
    const info = getMutationError(httpError(409, { error: { message: 'Cannot delete module because it contains topics. Remove its topics first.' } }));
    assert.equal(info.kind, 'conflict');
    assert.equal(info.message, 'Cannot delete module because it contains topics. Remove its topics first.');
  });

  it('maps 422 to field errors', () => {
    const info = getMutationError(
      httpError(422, { error: { message: 'Validation failed', details: [{ field: 'title', message: 'Title is required' }] } }),
    );
    assert.equal(info.kind, 'validation');
    assert.deepEqual(info.fieldErrors, { title: 'Title is required' });
  });

  it('maps 403 without leaking backend wording', () => {
    const info = getMutationError(httpError(403, { error: { message: 'internal policy XYZ denied' } }));
    assert.equal(info.message, "You don't have permission to perform this action.");
  });

  it('maps network and unknown errors safely', () => {
    assert.equal(getMutationError(new axios.AxiosError('Network Error', 'ERR_NETWORK')).kind, 'network');
    assert.equal(getMutationError(new Error('boom')).message.includes('boom'), false);
  });
});