import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { CodingAttempt, CodingExercise, Enrollment } from '../src/models/index.js';

const id = (d) => String(d._id);
let api, f, admin, mentorA, student;
const req = (m, p, o) => api.call(m, p, o);

before(async () => { api = await startApi(); ({ admin, mentorA, student } = api.users); f = await seedFixtures(api.users); await Enrollment.create({ student: student._id, course: f.pub._id }); });
after(() => api?.stop());

const createExercise = async () => {
  const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/coding-exercises`, { as: admin, body: { title: 'Center a div', testCases: [{ name: 'has flex', code: 'document.body.innerHTML.includes("flex")', hidden: false }] } });
  return res.body.data.id;
};

describe('authorization', () => {
  it('rejects student access to a draft exercise, and enforces enrollment', async () => {
    const exId = await createExercise();
    assert.equal((await req('GET', `/coding-exercises/${exId}`, { as: student })).status, 404); // still draft
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    assert.equal((await req('GET', `/coding-exercises/${exId}/play`, { as: student })).status, 200);

    const otherEx = (await req('POST', `/concepts/${id(f.otherTree.concept)}/coding-exercises`, { as: admin, body: { title: 'Other' } })).body.data;
    await req('PATCH', `/coding-exercises/${otherEx.id}/publish`, { as: admin });
    assert.equal((await req('GET', `/coding-exercises/${otherEx.id}/play`, { as: student })).status, 403); // not enrolled in f.other
  });

  it('mentor manages only their own course\'s exercises', async () => {
    assert.equal((await req('POST', `/concepts/${id(f.pubTree.concept)}/coding-exercises`, { as: mentorA, body: { title: 'Mentor ex' } })).status, 201);
    assert.equal((await req('POST', `/concepts/${id(f.otherTree.concept)}/coding-exercises`, { as: mentorA, body: { title: 'Nope' } })).status, 403);
  });
});

describe('hidden test leakage', () => {
  it('never returns test code from the detail endpoint, only from /play', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    const detail = await req('GET', `/coding-exercises/${exId}`, { as: student });
    assert.equal(JSON.stringify(detail.body).includes('document.body.innerHTML.includes'), false);
    const play = await req('GET', `/coding-exercises/${exId}/play`, { as: student });
    assert.equal(play.body.data.testCases[0].code, 'document.body.innerHTML.includes("flex")');
  });
});

describe('submission integrity', () => {
  it('ignores a spoofed test name not belonging to the exercise, and computes pass/fail from valid results only', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    const res = await req('POST', `/coding-exercises/${exId}/attempts`, {
      as: student, body: { submittedHtml: '<div>x</div>', results: [{ name: 'has flex', passed: true }, { name: 'fake extra test', passed: true }] },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.totalTests, 1);
    assert.equal(res.body.data.passedTests, 1);
    assert.equal(res.body.data.status, 'passed');
  });

  it('rejects oversized submitted code', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    const res = await req('POST', `/coding-exercises/${exId}/attempts`, { as: student, body: { submittedJavaScript: 'x'.repeat(20001) } });
    assert.equal(res.status, 422);
  });

  it('attempts are self-service only', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    const submit = await req('POST', `/coding-exercises/${exId}/attempts`, { as: student, body: { results: [{ name: 'has flex', passed: true }] } });
    assert.equal((await req('GET', `/coding-attempts/${submit.body.data.id}`, { as: mentorA })).status, 403);
    assert.equal((await req('GET', `/coding-attempts/${submit.body.data.id}`, { as: student })).status, 200);
  });
});

describe('completion is independent of Progress', () => {
  it('a passed coding exercise does not touch Progress or Enrollment status', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    await req('POST', `/coding-exercises/${exId}/attempts`, { as: student, body: { results: [{ name: 'has flex', passed: true }] } });
    const enrollment = await Enrollment.findOne({ student: student._id, course: f.pub._id }).lean();
    assert.notEqual(enrollment.status, 'completed'); // unrelated to concept completion, as documented
  });

  it('deletion is blocked once attempts exist', async () => {
    const exId = await createExercise();
    await req('PATCH', `/coding-exercises/${exId}/publish`, { as: admin });
    await req('POST', `/coding-exercises/${exId}/attempts`, { as: student, body: {} });
    assert.equal((await req('DELETE', `/coding-exercises/${exId}`, { as: admin })).status, 409);
  });
});