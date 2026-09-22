import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getSafeUrl } from '../src/utils/safeUrl.js';

describe('getSafeUrl', () => {
  it('accepts http and https URLs and normalizes them', () => {
    assert.equal(getSafeUrl('https://example.com/path?q=1'), 'https://example.com/path?q=1');
    assert.equal(getSafeUrl('http://example.com'), 'http://example.com/');
    assert.equal(getSafeUrl('  HTTPS://EXAMPLE.COM  '), 'https://example.com/');
  });

  it('rejects javascript:, data:, vbscript: and other protocols, however they are disguised', () => {
    const unsafe = [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      '  javascript:alert(1)',
      'java\nscript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'mailto:someone@example.com',
      'ftp://example.com/file',
    ];
    for (const value of unsafe) assert.equal(getSafeUrl(value), null, value);
  });

  it('rejects relative, empty and non-string values', () => {
    for (const value of ['//evil.example', '/relative/path', 'example.com', '', '   ', null, undefined, 42, {}]) {
      assert.equal(getSafeUrl(value), null, String(value));
    }
  });
});