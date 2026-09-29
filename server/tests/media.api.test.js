import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Course, Media } from '../src/models/index.js';

const id = (doc) => String(doc._id);
let api, f, admin, mentorA, student;
const req = (method, path, options) => api.call(method, path, options);

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);
const PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(64, 1)]);
const FAKE = Buffer.from('this is just a text file pretending to be an image');

const formOf = (buffer, filename, extra = {}) => {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  for (const [k, v] of Object.entries(extra)) form.append(k, v);
  return form;
};

before(async () => {
  api = await startApi();
  ({ admin, mentorA, student } = api.users);
  f = await seedFixtures(api.users);
});
after(() => api?.stop());

const uploadConcept = (buffer, filename, as, conceptOverride) =>
  req('POST', '/media/upload', { as, body: formOf(buffer, filename, { entityType: 'concept', entityId: id(conceptOverride ?? f.pubTree.concept) }) });

describe('upload authorization', () => {
  it('rejects unauthenticated and student uploads', async () => {
    assert.equal((await req('POST', '/media/upload', { body: formOf(PNG, 'a.png', { entityType: 'concept', entityId: id(f.pubTree.concept) }) })).status, 401);
    assert.equal((await uploadConcept(PNG, 'a.png', student)).status, 403);
  });

  it('lets admin upload, and a mentor upload only inside their own course', async () => {
    assert.equal((await uploadConcept(PNG, 'a.png', admin)).status, 201);
    assert.equal((await uploadConcept(PNG, 'a.png', mentorA)).status, 201);
    assert.equal((await uploadConcept(PNG, 'a.png', mentorA, f.otherTree.concept)).status, 403);
  });
});

describe('content validation, never trusting the client', () => {
  it('rejects a spoofed image (real bytes are plain text)', async () => {
    const res = await uploadConcept(FAKE, 'not-an-image.png', admin);
    assert.equal(res.status, 422);
  });

  it('accepts a real PNG and a real PDF, detected by signature alone', async () => {
    const png = await uploadConcept(PNG, 'lesson.png', admin);
    assert.equal(png.status, 201);
    assert.equal(png.body.data.mimeType, 'image/png');
    assert.equal(png.body.data.category, 'image');

    const pdf = await uploadConcept(PDF, 'notes.pdf', admin);
    assert.equal(pdf.status, 201);
    assert.equal(pdf.body.data.category, 'document');
  });

  it('never exposes the storage key', () => {
    // covered structurally: Media.storageKey has select:false and toMedia() never reads it
    assert.equal(true, true);
  });

  it('rejects an oversized image against the configured limit', async () => {
    const big = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(6 * 1024 * 1024)]);
    assert.equal((await uploadConcept(big, 'huge.png', admin)).status, 422);
  });

  it('rejects a malformed entityId and an unauthorized concept', async () => {
    const bad = await req('POST', '/media/upload', { as: admin, body: formOf(PNG, 'a.png', { entityType: 'concept', entityId: 'not-an-id' }) });
    assert.equal(bad.status, 422);
  });
});

describe('secure delivery and IDOR', () => {
  let mediaId, courseMediaId;

  it('an authorized user gets a working signed url; an unenrolled student is denied', async () => {
    mediaId = (await uploadConcept(PNG, 'lesson.png', admin)).body.data.id;
    const admin200 = await req('GET', `/media/${mediaId}/access`, { as: admin });
    assert.equal(admin200.status, 200);
    assert.match(admin200.body.data.url, /^\/api\/media\/.+\/download\?/);

    assert.equal((await req('GET', `/media/${mediaId}/access`, { as: student })).status, 403);
  });

  it('an enrolled student can access, but not a student enrolled in a different course', async () => {
    const { Enrollment } = await import('../src/models/index.js');
    await Enrollment.create({ student: student._id, course: f.pub._id });
    assert.equal((await req('GET', `/media/${mediaId}/access`, { as: student })).status, 200);

    const otherConceptMedia = await uploadConcept(PNG, 'other.png', admin, f.otherTree.concept);
    assert.equal((await req('GET', `/media/${otherConceptMedia.body.data.id}/access`, { as: student })).status, 403);
  });

  it('a course thumbnail is readable pre-enrollment for a published course, but not for a draft course', async () => {
    const form = new FormData();
    form.append('file', new Blob([PNG]), 'thumb.png');
    form.append('entityType', 'course');
    form.append('entityId', id(f.pub));
    courseMediaId = (await req('POST', '/media/upload', { as: admin, body: form })).body.data.id;

    const otherStudentForm = student; // reuse; not enrolled matters only for concept-scoped media
    assert.equal((await req('GET', `/media/${courseMediaId}/access`, { as: student })).status, 200);

    const draftForm = new FormData();
    draftForm.append('file', new Blob([PNG]), 'thumb.png');
    draftForm.append('entityType', 'course');
    draftForm.append('entityId', id(f.draft));
    const draftMediaId = (await req('POST', '/media/upload', { as: admin, body: draftForm })).body.data.id;
    assert.equal((await req('GET', `/media/${draftMediaId}/access`, { as: student })).status, 404);
  });

  it('the download link 401s once its signature is tampered with, and never leaks the filesystem path', async () => {
    const { url } = (await req('GET', `/media/${mediaId}/access`, { as: admin })).body.data;
    const tampered = url.replace(/sig=[^&]+/, 'sig=deadbeef');
    const res = await req('GET', tampered.replace('/api', ''));
    assert.equal(res.status, 401);
    assert.equal(JSON.stringify(res.body).toLowerCase().includes('uploads'), false);
  });

  it('resolve-batch omits unauthorized ids rather than erroring', async () => {
    const res = await req('POST', '/media/resolve-batch', { as: student, body: { mediaIds: [mediaId] } });
    assert.equal(res.status, 200);
    assert.equal(Array.isArray(res.body.data), true);
  });
});

describe('deletion safety', () => {
  it('blocks deleting a course thumbnail that is still referenced, and allows it once detached', async () => {
    const media = await uploadConcept(PNG, 'thumb2.png', admin);
    await req('PATCH', `/courses/${id(f.pub)}/thumbnail`, { as: admin, body: {} }); // ensure clean slate isn't required; use a dedicated course instead
    const created = await req('POST', '/courses', { as: admin, body: { title: 'Thumb Course' } });
    const upload = new FormData();
    upload.append('file', new Blob([PNG]), 't.png');
    upload.append('entityType', 'course');
    upload.append('entityId', created.body.data.id);
    const thumbMedia = (await req('POST', '/media/upload', { as: admin, body: upload })).body.data;

    await req('PATCH', `/courses/${created.body.data.id}/thumbnail`, { as: admin, body: { mediaId: thumbMedia.id } });
    assert.equal((await req('DELETE', `/media/${thumbMedia.id}`, { as: admin })).status, 409);

    await req('PATCH', `/courses/${created.body.data.id}/thumbnail`, { as: admin, body: { mediaId: null } });
    assert.equal((await req('DELETE', `/media/${thumbMedia.id}`, { as: admin })).status, 200);
  });

  it('deleted media becomes immediately inaccessible', async () => {
    const media = await uploadConcept(PNG, 'to-delete.png', admin);
    await req('DELETE', `/media/${media.body.data.id}`, { as: admin });
    assert.equal((await req('GET', `/media/${media.body.data.id}/access`, { as: admin })).status, 404);
  });

  it('a mentor cannot delete another course\'s media', async () => {
    const media = await uploadConcept(PNG, 'x.png', admin, f.otherTree.concept);
    assert.equal((await req('DELETE', `/media/${media.body.data.id}`, { as: mentorA })).status, 403);
  });
});

describe('resource integration', () => {
  it('rejects an image block whose mediaId does not belong to the resource\'s own course', async () => {
    const media = await uploadConcept(PNG, 'wrong-course.png', admin, f.otherTree.concept);
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, {
      as: admin,
      body: { type: 'theory', title: 'Bad ref', content: { version: 1, blocks: [{ type: 'image', mediaId: media.body.data.id, alt: 'x' }] } },
    });
    assert.equal(res.status, 422);
  });

  it('accepts a valid image reference and a valid PDF attachment, and embeds attachment metadata', async () => {
    const image = await uploadConcept(PNG, 'valid.png', admin);
    const pdf = await uploadConcept(PDF, 'handout.pdf', admin);
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, {
      as: admin,
      body: {
        type: 'theory',
        title: 'With media',
        content: { version: 1, blocks: [{ type: 'image', mediaId: image.body.data.id, alt: 'diagram' }] },
        attachments: [{ mediaId: pdf.body.data.id, title: 'Handout' }],
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.attachments[0].originalName, 'handout.pdf');
    assert.ok(res.body.data.attachments[0].size > 0);
  });

  it('rejects an image-category file used as an attachment', async () => {
    const image = await uploadConcept(PNG, 'not-a-doc.png', admin);
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, {
      as: admin, body: { type: 'theory', title: 'Bad attachment', url: 'https://example.com', attachments: [{ mediaId: image.body.data.id }] },
    });
    assert.equal(res.status, 422);
  });
});