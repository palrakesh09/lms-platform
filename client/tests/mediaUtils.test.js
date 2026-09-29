import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatFileSize, resolveDeliveryUrl } from '../src/utils/mediaUtils.js';

describe('formatFileSize', () => {
  it('formats bytes, KB and MB sensibly', () => {
    assert.equal(formatFileSize(0), '0 KB');
    assert.equal(formatFileSize(500), '500 B');
    assert.equal(formatFileSize(2048), '2.0 KB');
    assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB');
  });
});

describe('resolveDeliveryUrl', () => {
  it('passes through an absolute URL (S3) unchanged', () => {
    assert.equal(resolveDeliveryUrl('https://bucket.s3.amazonaws.com/x?sig=1', 'http://localhost:5000/api'), 'https://bucket.s3.amazonaws.com/x?sig=1');
  });
  it('prefixes an app-relative path (local storage) with the API origin', () => {
    assert.equal(resolveDeliveryUrl('/api/media/1/download?exp=1', 'http://localhost:5000/api'), 'http://localhost:5000/api/media/1/download?exp=1');
  });
  it('returns null for a missing url', () => assert.equal(resolveDeliveryUrl(null, 'http://x/api'), null));
});