import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuizPayload, validateQuizForm } from '../src/utils/forms/quizForm.js';
import { buildQuestionPayload, validateQuestionForm } from '../src/utils/forms/questionForm.js';

const quiz = { title: 'Networking Basics', slug: '', description: '', instructions: '', passingScore: '70', maxAttempts: '', timeLimitMinutes: '', order: '' };

describe('validateQuizForm', () => {
  it('accepts a minimal valid quiz with unlimited attempts/time', () => {
    assert.deepEqual(validateQuizForm(quiz), {});
  });
  it('rejects an out-of-range passing score and a non-positive maxAttempts', () => {
    assert.ok(validateQuizForm({ ...quiz, passingScore: '150' }).passingScore);
    assert.ok(validateQuizForm({ ...quiz, maxAttempts: '0' }).maxAttempts);
  });
});

describe('buildQuizPayload never sends status/course/attachmentId', () => {
  it('omits protected fields', () => {
    const payload = buildQuizPayload(quiz, { isNew: true, original: null });
    for (const forbidden of ['status', 'course', 'attachmentId', 'attachmentLevel', 'createdBy']) {
      assert.equal(forbidden in payload, false);
    }
    assert.equal(payload.maxAttempts, null);
  });
});

const question = { question: 'Which protocol serves web pages?', options: [{ id: 'a', text: 'HTTP' }, { id: 'b', text: 'FTP' }], correctAnswer: 'a', explanation: '', points: '1', order: '' };

describe('validateQuestionForm', () => {
  it('accepts a valid mcq-single question', () => {
    assert.deepEqual(validateQuestionForm(question), {});
  });
  it('rejects fewer than 2 options, duplicate ids, and a correctAnswer with no matching option', () => {
    assert.ok(validateQuestionForm({ ...question, options: [{ id: 'a', text: 'HTTP' }] }).options);
    assert.ok(validateQuestionForm({ ...question, options: [{ id: 'a', text: 'HTTP' }, { id: 'a', text: 'FTP' }] }).options);
    assert.ok(validateQuestionForm({ ...question, correctAnswer: 'z' }).correctAnswer);
  });
});

describe('buildQuestionPayload', () => {
  it('lowercases option/answer ids and never includes quiz or correctness fields', () => {
    const payload = buildQuestionPayload({ ...question, correctAnswer: 'A' });
    assert.equal(payload.correctAnswer, 'a');
    for (const forbidden of ['quiz', 'isCorrect', 'pointsEarned']) assert.equal(forbidden in payload, false);
  });
});