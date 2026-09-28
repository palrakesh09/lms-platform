import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateBlock, validateContent } from '../src/utils/forms/contentValidation.js';

describe('validateBlock', () => {
  it('accepts a well-formed block of each type', () => {
    const cases = [
      { type: 'paragraph', text: 'Hello' },
      { type: 'heading', level: 2, text: 'Intro' },
      { type: 'bullet-list', items: ['a'] },
      { type: 'code', code: 'const x = 1;' },
      { type: 'note', text: 'Remember this' },
      { type: 'warning', text: 'Careful' },
      { type: 'image', url: 'https://example.com/a.png', alt: 'diagram' },
      { type: 'link', text: 'MDN', url: 'https://developer.mozilla.org' },
      { type: 'table', headers: ['A'], rows: [['1']] },
      { type: 'divider' },
    ];
    for (const block of cases) assert.equal(validateBlock(block, 0), null, JSON.stringify(block));
  });

  it('rejects an image with an unsafe URL or missing alt text', () => {
    assert.ok(validateBlock({ type: 'image', url: 'javascript:alert(1)', alt: 'x' }, 0));
    assert.ok(validateBlock({ type: 'image', url: 'https://example.com/a.png', alt: '' }, 0));
  });

  it('rejects a link with an unsafe URL', () => {
    assert.ok(validateBlock({ type: 'link', text: 'Click', url: 'javascript:alert(1)' }, 0));
  });

  it('rejects a table whose row length does not match its headers', () => {
    assert.ok(validateBlock({ type: 'table', headers: ['A', 'B'], rows: [['1']] }, 0));
  });

  it('rejects an unknown block type', () => {
    assert.ok(validateBlock({ type: 'script', code: 'alert(1)' }, 0));
  });
});

describe('validateContent', () => {
  it('returns null for empty or well-formed content', () => {
    assert.equal(validateContent(null), null);
    assert.equal(validateContent({ version: 1, blocks: [] }), null);
    assert.equal(validateContent({ version: 1, blocks: [{ type: 'paragraph', text: 'ok' }] }), null);
  });

  it('surfaces the first invalid block', () => {
    const error = validateContent({ version: 1, blocks: [{ type: 'paragraph', text: 'ok' }, { type: 'image', url: '', alt: '' }] });
    assert.match(error, /Block 2/);
  });
});