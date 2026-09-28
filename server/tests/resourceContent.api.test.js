import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Enrollment } from '../src/models/index.js';

const id = (doc) => String(doc._id);
let api, f, admin, mentorA, student;
const req = (method, path, options) => api.call(method, path, options);

const validContent = {
  version: 1,
  blocks: [
    { type: 'paragraph', text: 'HTML stands for HyperText Markup Language.' },
    { type: 'heading', level: 2, text: 'Introduction' },
    { type: 'code', language: 'html', code: '<!DOCTYPE html>' },
    { type: 'note', title: 'Important', text: 'HTML is not a programming language.' },
    { type: 'link', text: 'MDN', url: 'https://developer.mozilla.org' },
  ],
};

before(async () => {
  api = await startApi();
  ({ admin, mentorA, student } = api.users);
  f = await seedFixtures(api.users);
  await Enrollment.create({ student: student._id, course: f.pub._id }); // needed for the read tests below
});
after(() => api?.stop());

describe('resource content creation', () => {
  it('creates a resource with structured content and no url', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'HTML Basics', content: validContent } });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.content.blocks.length, 5);
    assert.equal(res.body.data.url, '');
  });

  it('rejects a resource with neither url nor content blocks', async () => {
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Empty' } })).status, 422);
  });

  it('rejects an unknown block type', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, {
      as: admin, body: { type: 'theory', title: 'Bad Block', content: { version: 1, blocks: [{ type: 'script', code: 'alert(1)' }] } },
    });
    assert.equal(res.status, 422);
  });

  it('rejects a javascript: URL inside a link block and an image block', async () => {
    const link = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'XSS Link', content: { version: 1, blocks: [{ type: 'link', text: 'Click', url: 'javascript:alert(1)' }] } } });
    assert.equal(link.status, 422);
    const image = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'XSS Image', content: { version: 1, blocks: [{ type: 'image', url: 'javascript:alert(1)', alt: 'x' }] } } });
    assert.equal(image.status, 422);
  });

  it('requires alt text on image blocks', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'No Alt', content: { version: 1, blocks: [{ type: 'image', url: 'https://example.com/x.png', alt: '' }] } } });
    assert.equal(res.status, 422);
  });

  it('rejects oversized content: too many blocks, and an oversized single code block', async () => {
    const tooMany = Array.from({ length: 101 }, () => ({ type: 'paragraph', text: 'x' }));
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Too Big', content: { version: 1, blocks: tooMany } } })).status, 422);

    const hugeCode = [{ type: 'code', language: 'javascript', code: 'x'.repeat(20001) }];
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Huge Code', content: { version: 1, blocks: hugeCode } } })).status, 422);
  });

  it('rejects mismatched table rows and an unsupported code language', async () => {
    const badTable = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Bad Table', content: { version: 1, blocks: [{ type: 'table', headers: ['A', 'B'], rows: [['1']] }] } } });
    assert.equal(badTable.status, 422);

    const badLang = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Bad Lang', content: { version: 1, blocks: [{ type: 'code', language: 'ruby', code: 'puts 1' }] } } });
    assert.equal(badLang.status, 422);
  });

  it('rejects a wrong content version and malformed JSON shape', async () => {
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Bad Version', content: { version: 2, blocks: [] } } })).status, 422);
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Bad Shape', content: { blocks: 'not-an-array' } } })).status, 422);
  });
});

describe('existing url-only resources keep working', () => {
  it('a legacy-style url-only resource is still valid', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Legacy style', url: 'https://example.com/legacy' } });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.data.content, { version: 1, blocks: [] });
  });

  it('removing the url while content blocks remain succeeds; removing both fields is rejected', async () => {
    const created = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Both', url: 'https://example.com/a', content: validContent } });
    const cleared = await req('PATCH', `/resources/${created.body.data.id}`, { as: admin, body: { url: '' } });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.data.url, '');

    const urlOnly = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'RemoveBoth', url: 'https://example.com/a' } });
    assert.equal((await req('PATCH', `/resources/${urlOnly.body.data.id}`, { as: admin, body: { url: '' } })).status, 422);
  });
});

describe('mentor authorization over content', () => {
  it('mentor can add content in their own course but not another mentor\'s', async () => {
    const own = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: mentorA, body: { type: 'theory', title: 'Mentor content', content: validContent } });
    assert.equal(own.status, 201);
    assert.equal((await req('POST', `/concepts/${id(f.otherTree.concept)}/resources`, { as: mentorA, body: { type: 'theory', title: 'Nope', content: validContent } })).status, 403);
  });
});

describe('student read access, draft protection, and enrollment', () => {
  it('never sees content for a draft resource, and sees it once published', async () => {
    const created = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Draft Content', content: validContent, status: 'draft' } });
    assert.equal((await req('GET', `/resources/${created.body.data.id}`, { as: student })).status, 404);

    await req('PATCH', `/resources/${created.body.data.id}`, { as: admin, body: { status: 'published' } });
    const res = await req('GET', `/resources/${created.body.data.id}`, { as: student });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.content.blocks.length, 5);
  });

  it('rejects a student who is not enrolled from reading resource content directly by id (Phase 11 gap closed)', async () => {
    const created = await req('POST', `/concepts/${id(f.otherTree.concept)}/resources`, { as: mentorA === admin ? admin : admin, body: { type: 'theory', title: 'Other course content', content: validContent, status: 'published' } });
    assert.equal((await req('GET', `/resources/${created.body.data.id}`, { as: student })).status, 403); // student is not enrolled in f.other
  });

  it('cannot inject a payload that manipulates score/audit-like fields not present on resources', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, {
      as: admin, body: { type: 'theory', title: 'Mass assignment', content: validContent, createdBy: id(student), concept: id(f.otherTree.concept) },
    });
    assert.equal(res.status, 422); // strictObject rejects unknown/protected fields
  });
});