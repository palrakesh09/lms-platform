import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseInline, parseMarkdown } from '../src/utils/markdown.js';

describe('parseMarkdown', () => {
  it('parses headings, paragraphs, lists and code fences', () => {
    const blocks = parseMarkdown('## Title\n\nHello **world**.\n\n- one\n- two\n\n```js\nconst x = 1;\n```');
    assert.equal(blocks[0].type, 'heading');
    assert.equal(blocks[1].type, 'paragraph');
    assert.equal(blocks[2].type, 'list');
    assert.equal(blocks[2].items.length, 2);
    assert.equal(blocks[3].type, 'code');
    assert.equal(blocks[3].code, 'const x = 1;');
  });
});

describe('parseInline', () => {
  it('extracts bold, italic, inline code, and safe links', () => {
    const tokens = parseInline('a **b** c *d* `e` [text](https://example.com)');
    assert.ok(tokens.some((t) => t.kind === 'bold' && t.text === 'b'));
    assert.ok(tokens.some((t) => t.kind === 'italic' && t.text === 'd'));
    assert.ok(tokens.some((t) => t.kind === 'code' && t.text === 'e'));
    assert.ok(tokens.some((t) => t.kind === 'link' && t.url === 'https://example.com/'));
  });

  it('never renders an unsafe link URL', () => {
    const tokens = parseInline('[click](javascript:alert(1))');
    const link = tokens.find((t) => t.kind === 'link');
    assert.equal(link.url, null);
  });
});