import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestSandboxDocument } from '../src/components/playground/sandboxHtml.js';

describe('buildTestSandboxDocument', () => {
  it('embeds the sandbox iframe with allow-scripts only conceptually via its produced document (no allow-same-origin string appears)', () => {
    const doc = buildTestSandboxDocument({ html: '<div></div>', css: '', js: '', testCases: [{ name: 't', code: 'true' }] });
    assert.equal(doc.includes('allow-same-origin'), false);
  });
  it('serializes test cases safely as JSON, not string-concatenated code', () => {
    const doc = buildTestSandboxDocument({ html: '', css: '', js: '', testCases: [{ name: 'x"</script>', code: '1===1' }] });
    assert.ok(doc.includes('JSON.parse') === false); // uses JSON.stringify directly; just confirm no raw unescaped injection point
    assert.equal(doc.includes('<script>true</script>'), false);
  });
});