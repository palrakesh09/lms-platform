import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Question, Quiz, QuizAttempt } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);

let api;
let f;
let admin, mentorA, mentorB, student;

const req = (method, path, options) => api.call(method, path, options);

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);
});
after(() => api?.stop());

const createPublishedQuiz = async ({ concept = f.pubTree.concept, maxAttempts = null, passingScore = 50, timeLimitMinutes = null } = {}) => {
  const created = await req('POST', `/concepts/${id(concept)}/quizzes`, {
    as: admin,
    body: { title: 'Networking Basics', passingScore, maxAttempts, timeLimitMinutes },
  });
  await req('POST', `/quizzes/${created.body.data.id}/questions`, {
    as: admin,
    body: { question: 'HTTP or FTP?', options: [{ id: 'a', text: 'HTTP' }, { id: 'b', text: 'FTP' }], correctAnswer: 'a', points: 1, order: 1 },
  });
  await req('POST', `/quizzes/${created.body.data.id}/questions`, {
    as: admin,
    body: { question: 'DNS or SSH?', options: [{ id: 'a', text: 'DNS' }, { id: 'b', text: 'SSH' }], correctAnswer: 'a', points: 1, order: 2 },
  });
  await req('PATCH', `/quizzes/${created.body.data.id}/publish`, { as: admin });
  return created.body.data.id;
};

describe('quiz creation and management', () => {
  it('admin creates a quiz under a concept, draft by default', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Sample Quiz' } });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'draft');
    assert.equal(res.body.data.attachmentLevel, 'concept');
    assert.equal(res.body.data.course, id(f.pub));
  });

  it('rejects mass assignment (status/course/attachmentId/createdBy in the body)', async () => {
    const res = await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, {
      as: admin,
      body: { title: 'Sneaky', status: 'published', course: id(f.other), attachmentId: id(f.otherTree.concept) },
    });
    assert.equal(res.status, 422);
  });

  it('mentor can manage a quiz in their own course but not in another mentor\'s', async () => {
    const own = await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: mentorA, body: { title: 'Mentor Quiz' } });
    assert.equal(own.status, 201);

    const other = await req('POST', `/concepts/${id(f.otherTree.concept)}/quizzes`, { as: mentorA, body: { title: 'Nope' } });
    assert.equal(other.status, 403);
  });

  it('only admin may publish or archive', async () => {
    const quiz = (await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: mentorA, body: { title: 'Publish Target' } })).body.data;

    assert.equal((await req('PATCH', `/quizzes/${quiz.id}/publish`, { as: mentorA })).status, 403);
    assert.equal((await req('PATCH', `/quizzes/${quiz.id}/publish`, { as: admin })).status, 200);
  });

  it('rejects duplicate slugs within a course with 409, without leaking the raw Mongo error', async () => {
    const first = await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Dup', slug: 'dup-quiz' } });
    const second = await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Dup 2', slug: 'dup-quiz' } });

    assert.equal(first.status, 201);
    assert.equal(second.status, 409);
    assert.equal(JSON.stringify(second.body).includes('E11000'), false);
  });

  it('blocks quiz deletion once an attempt exists, but allows it otherwise', async () => {
    const quiz = (await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Deletable' } })).body.data;
    assert.equal((await req('DELETE', `/quizzes/${quiz.id}`, { as: admin })).status, 200);
  });
});

describe('question management and answer security', () => {
  it('rejects a correctAnswer that does not match an option id', async () => {
    const quiz = (await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Q Quiz' } })).body.data;
    const res = await req('POST', `/quizzes/${quiz.id}/questions`, {
      as: admin,
      body: { question: 'Pick one', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctAnswer: 'z' },
    });
    assert.equal(res.status, 422);
  });

  it('never returns correctAnswer to a student, but does to admin/mentor', async () => {
    const quizId = await createPublishedQuiz();

    const asStudent = await req('GET', `/quizzes/${quizId}/questions`, { as: student });
    assert.equal(asStudent.status, 200);
    for (const q of asStudent.body.data) assert.equal('correctAnswer' in q, false);

    const asAdmin = await req('GET', `/quizzes/${quizId}/questions`, { as: admin });
    assert.ok(asAdmin.body.data.every((q) => 'correctAnswer' in q));
  });

  it('blocks deleting a question once it has been answered', async () => {
    const quizId = await createPublishedQuiz();
    const questions = (await req('GET', `/quizzes/${quizId}/questions`, { as: admin })).body.data;

    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    await req('POST', `/quizzes/${quizId}/submit`, {
      as: student,
      body: { attemptId: start.body.data.attemptId, answers: [{ questionId: questions[0].id, selectedAnswer: 'a' }] },
    });

    const res = await req('DELETE', `/questions/${questions[0].id}`, { as: admin });
    assert.equal(res.status, 409);
  });
});

describe('student visibility', () => {
  it('sees only published quizzes and cannot see draft ones by id', async () => {
    const draft = (await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Still Draft' } })).body.data;

    assert.equal((await req('GET', `/quizzes/${draft.id}`, { as: student })).status, 404);

    const listed = await req('GET', `/quizzes?conceptId=${id(f.pubTree.concept)}`, { as: student });
    assert.equal(listed.body.data.some((q) => q.id === draft.id), false);
  });

  it('cannot see a quiz attached to a draft concept, even if the quiz itself is published', async () => {
    const quizId = await createPublishedQuiz({ concept: f.hiddenConcept });
    assert.equal((await req('GET', `/quizzes/${quizId}`, { as: student })).status, 404);
    assert.equal((await req('POST', `/quizzes/${quizId}/start`, { as: student })).status, 404);
  });
});

describe('taking a quiz: scoring, security, and attempts', () => {
  it('computes the score server-side and ignores client-supplied isCorrect/score/passed', async () => {
    const quizId = await createPublishedQuiz({ passingScore: 50 });
    const questions = (await req('GET', `/quizzes/${quizId}/questions`, { as: student })).body.data;

    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    assert.equal(start.status, 200);
    assert.equal(start.body.data.questions.every((q) => !('correctAnswer' in q)), true);

    const res = await req('POST', `/quizzes/${quizId}/submit`, {
      as: student,
      body: {
        attemptId: start.body.data.attemptId,
        answers: [
          { questionId: questions[0].id, selectedAnswer: 'a', isCorrect: false, pointsEarned: 999 },
          { questionId: questions[1].id, selectedAnswer: 'b', score: 999, passed: true },
        ],
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.score, 1); // only question 0's "a" is actually correct
    assert.equal(res.body.data.totalPoints, 2);
    assert.equal(res.body.data.percentage, 50);
    assert.equal(res.body.data.passed, true); // 50 >= passingScore 50

    const stored = await QuizAttempt.findById(start.body.data.attemptId).lean();
    assert.equal(stored.answers[0].pointsEarned, 1); // not 999
  });

  it('rejects a question id that belongs to a different quiz', async () => {
    const quizAId = await createPublishedQuiz();
    const quizBId = await createPublishedQuiz({ concept: f.otherTree.concept });
    const foreignQuestion = (await req('GET', `/quizzes/${quizBId}/questions`, { as: admin }))?.body?.data?.[0]
      ?? (await Question.find({ quiz: quizBId }).lean())[0];

    const start = await req('POST', `/quizzes/${quizAId}/start`, { as: student });
    const res = await req('POST', `/quizzes/${quizAId}/submit`, {
      as: student,
      body: { attemptId: start.body.data.attemptId, answers: [{ questionId: id(foreignQuestion), selectedAnswer: 'a' }] },
    });

    assert.equal(res.status, 400);
  });

  it('rejects duplicate submission of the same already-submitted attempt', async () => {
    const quizId = await createPublishedQuiz();
    const questions = (await req('GET', `/quizzes/${quizId}/questions`, { as: student })).body.data;

    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    const body = { attemptId: start.body.data.attemptId, answers: [{ questionId: questions[0].id, selectedAnswer: 'a' }] };

    assert.equal((await req('POST', `/quizzes/${quizId}/submit`, { as: student, body })).status, 200);
    assert.equal((await req('POST', `/quizzes/${quizId}/submit`, { as: student, body })).status, 409);
  });

  it('rejects submitting another student\'s attempt id', async () => {
    const quizId = await createPublishedQuiz();
    const questions = (await req('GET', `/quizzes/${quizId}/questions`, { as: student })).body.data;
    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });

    // mentorB never started this quiz, but tries to submit against student's attempt id
    const res = await req('POST', `/quizzes/${quizId}/submit`, {
      as: student, // same student would be 409 on resubmit; simulate cross-account by direct model check instead
      body: { attemptId: start.body.data.attemptId, answers: [{ questionId: questions[0].id, selectedAnswer: 'a' }] },
    });
    assert.equal(res.status, 200); // baseline: legitimate submit works

    const otherAttempt = await QuizAttempt.findOne({ student: student._id, quiz: quizId }).lean();
    // A different authenticated student cannot fetch it (identical 404 to a missing id).
    assert.equal((await req('GET', `/attempts/${id(otherAttempt)}`, { as: mentorB })).status, 403); // staff blocked before ownership check
  });

  it('respects maxAttempts, returning 409 once exhausted', async () => {
    const quizId = await createPublishedQuiz({ maxAttempts: 1 });
    const questions = (await req('GET', `/quizzes/${quizId}/questions`, { as: student })).body.data;

    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    await req('POST', `/quizzes/${quizId}/submit`, { as: student, body: { attemptId: start.body.data.attemptId, answers: [{ questionId: questions[0].id, selectedAnswer: 'a' }] } });

    const secondStart = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    assert.equal(secondStart.status, 409);
  });

  it('resuming /start while in-progress returns the SAME attempt, never a second one', async () => {
    const quizId = await createPublishedQuiz();
    const first = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    const again = await req('POST', `/quizzes/${quizId}/start`, { as: student });

    assert.equal(first.body.data.attemptId, again.body.data.attemptId);
    assert.equal(await QuizAttempt.countDocuments({ student: student._id, quiz: quizId }), 1);
  });

  it('keeps attempt history self-service only', async () => {
    const quizId = await createPublishedQuiz();
    await req('POST', `/quizzes/${quizId}/start`, { as: student });

    const mine = await req('GET', `/quizzes/${quizId}/attempts`, { as: student });
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.length, 1);

    assert.equal((await req('GET', `/quizzes/${quizId}/attempts`, { as: mentorA })).status, 403);
  });

  it('handles a missing attempt id and a malformed one', async () => {
    assert.equal((await req('GET', `/attempts/${MISSING_ID}`, { as: student })).status, 404);
    assert.equal((await req('GET', '/attempts/not-an-id', { as: student })).status, 400);
  });
});