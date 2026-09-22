import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { getErrorInfo } from '../src/utils/getErrorInfo.js';

const httpError = (status) =>
  new axios.AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, { status, data: {}, headers: {} });

describe('getErrorInfo', () => {
  it('maps 401 to an unauthorized, non-retryable error', () => {
    const info = getErrorInfo(httpError(401), 'course');
    assert.equal(info.kind, 'unauthorized');
    assert.equal(info.retryable, false);
  });

  it('maps 403 to an access-denied message that names the subject', () => {
    const info = getErrorInfo(httpError(403), 'course');
    assert.equal(info.kind, 'forbidden');
    assert.equal(info.message, "You don't have permission to access this course.");
  });

  it('maps 404 and 400 to "not found"', () => {
    assert.equal(getErrorInfo(httpError(404), 'course').message, 'Course not found.');
    assert.equal(getErrorInfo(httpError(400), 'resource').message, 'Resource not found.');
  });

  it('treats 5xx as a retryable server error', () => {
    const info = getErrorInfo(httpError(500));
    assert.equal(info.kind, 'server');
    assert.equal(info.retryable, true);
  });

  it('treats a missing response as a network error', () => {
    const info = getErrorInfo(new axios.AxiosError('Network Error', 'ERR_NETWORK'));
    assert.equal(info.kind, 'network');
    assert.equal(info.message, 'Unable to load course content. Please try again.');
  });

  it('never leaks a raw error message for unknown errors', () => {
    const info = getErrorInfo(new Error('secret internal detail'));
    assert.equal(info.kind, 'unknown');
    assert.equal(info.message.includes('secret'), false);
  });
});