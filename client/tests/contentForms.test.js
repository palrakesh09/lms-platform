import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNodePayload, validateNodeForm } from '../src/utils/forms/nodeForm.js';
import { buildResourcePayload, validateResourceForm } from '../src/utils/forms/resourceForm.js';

const node = { title: 'Web Fundamentals', slug: '', description: '', order: '', status: 'draft' };

describe('node form (module/topic/concept)', () => {
  it('accepts a minimal valid node and omits blank slug/order', () => {
    assert.deepEqual(validateNodeForm(node), {});
    const payload = buildNodePayload(node, { isNew: true, original: null });
    assert.equal('slug' in payload, false);
    assert.equal('order' in payload, false);
  });

  it('rejects a bad slug and an out-of-range order', () => {
    assert.ok(validateNodeForm({ ...node, slug: 'Not Valid' }).slug);
    assert.ok(validateNodeForm({ ...node, order: '-1' }).order);
    assert.ok(validateNodeForm({ ...node, order: 'abc' }).order);
  });

  it('sends a numeric order when provided', () => {
    const payload = buildNodePayload({ ...node, order: '3' }, { isNew: true, original: null });
    assert.equal(payload.order, 3);
  });

  it('never includes a parent field, since the parent comes from the URL', () => {
    const payload = buildNodePayload(node, { isNew: true, original: null });
    for (const forbidden of ['course', 'module', 'topic', 'concept', 'createdBy']) {
      assert.equal(forbidden in payload, false);
    }
  });
});

const resource = { type: 'theory', title: 'How DNS works', description: '', url: 'https://example.com/dns', openInNewTab: true, order: '', status: 'draft' };

describe('resource form', () => {
  it('accepts a valid resource', () => {
    assert.deepEqual(validateResourceForm(resource), {});
  });

  it('requires a URL and rejects unsafe protocols with a friendly message', () => {
    assert.equal(validateResourceForm({ ...resource, url: '' }).url, 'URL is required');
    assert.equal(validateResourceForm({ ...resource, url: 'javascript:alert(1)' }).url, 'Please enter a valid HTTP/HTTPS URL.');
  });

  it('rejects an arbitrary type', () => {
    assert.ok(validateResourceForm({ ...resource, type: 'video' }).type);
  });

  it('builds a payload with a boolean openInNewTab and no concept field', () => {
    const payload = buildResourcePayload(resource);
    assert.equal(payload.openInNewTab, true);
    assert.equal('concept' in payload, false);
  });
});