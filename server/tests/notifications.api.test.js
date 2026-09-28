import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedFixtures, startApi } from './helpers/apiKit.js';
import { Announcement, Course, Enrollment, LearningActivity, Notification, User } from '../src/models/index.js';

const MISSING_ID = '0'.repeat(24);
const id = (doc) => String(doc._id);
let api, f, admin, mentorA, mentorB, student, otherStudent, loner;
const req = (method, path, options) => api.call(method, path, options);
const count = (recipient, type) => Notification.countDocuments({ recipient: recipient._id, type });
const activities = (user, type) => LearningActivity.countDocuments({ user: user._id, type });

before(async () => {
  api = await startApi();
  ({ admin, mentorA, mentorB, student } = api.users);
  f = await seedFixtures(api.users);
  const mk = (name) => User.create({ name, email: `${name}@example.com`, password: 'placeholder-hash', role: 'student' });
  otherStudent = await mk('other-student');
  loner = await mk('loner'); // enrolled nowhere
});
after(() => api?.stop());

describe('enrollment, concept and course completion events (duplicate-safe)', () => {
  it('enrolling creates one notification and one activity', async () => {
    assert.equal((await req('POST', '/enrollments', { as: student, body: { courseId: id(f.pub) } })).status, 201);
    assert.equal(await count(student, 'enrollment'), 1);
    assert.equal(await activities(student, 'course_enrolled'), 1);
  });

  it('completing a concept twice records ONE activity and no concept notification', async () => {
    const path = `/progress/concept/${id(f.pubTree.concept)}/complete`;
    await req('PATCH', path, { as: student });
    await req('PATCH', path, { as: student });
    assert.equal(await activities(student, 'concept_completed'), 1);
    assert.equal(await count(student, 'concept_completed'), 0);
  });

  it('course completion notifies once, even after undo and redo', async () => {
    assert.equal(await count(student, 'course_completed'), 1); // the only published concept was completed above
    await req('PATCH', `/progress/concept/${id(f.pubTree.concept)}/incomplete`, { as: student });
    await req('PATCH', `/progress/concept/${id(f.pubTree.concept)}/complete`, { as: student });
    assert.equal(await count(student, 'course_completed'), 1);
    assert.equal(await activities(student, 'course_completed'), 1);
  });

  it('opening a resource repeatedly logs one resource_viewed per day', async () => {
    const body = { conceptId: id(f.pubTree.concept), resourceId: id(f.pubTree.resource) };
    await req('PATCH', `/progress/course/${id(f.pub)}/access`, { as: student, body });
    await req('PATCH', `/progress/course/${id(f.pub)}/access`, { as: student, body });
    assert.equal(await activities(student, 'resource_viewed'), 1);
  });
});

describe('publishing events', () => {
  it('a draft resource notifies nobody; publishing it notifies enrolled students once', async () => {
    const created = await req('POST', `/concepts/${id(f.pubTree.concept)}/resources`, { as: admin, body: { type: 'theory', title: 'Fresh Lesson', url: 'https://example.com/x' } });
    const rid = created.body.data.id; // drafts by default
    assert.equal(await count(student, 'resource_published'), 0);

    await req('PATCH', `/resources/${rid}`, { as: admin, body: { status: 'published' } });
    assert.equal(await count(student, 'resource_published'), 1);
    assert.equal(await count(loner, 'resource_published'), 0); // not enrolled

    await req('PATCH', `/resources/${rid}`, { as: admin, body: { status: 'archived' } });
    await req('PATCH', `/resources/${rid}`, { as: admin, body: { status: 'published' } });
    assert.equal(await count(student, 'resource_published'), 1); // one per resource, ever
  });

  it('a resource published under a draft parent notifies nobody', async () => {
    const before = await Notification.countDocuments({ type: 'resource_published' });
    await req('POST', `/concepts/${id(f.hiddenConcept)}/resources`, { as: admin, body: { type: 'theory', title: 'Under hidden', url: 'https://example.com/h', status: 'published' } });
    assert.equal(await Notification.countDocuments({ type: 'resource_published' }), before);
  });

  it('course re-publish notifies enrolled students; first publish notifies nobody', async () => {
    const course = (await req('POST', '/courses', { as: admin, body: { title: 'Events Course' } })).body.data;
    await req('PATCH', `/courses/${course.id}/publish`, { as: admin });
    assert.equal(await Notification.countDocuments({ type: 'course_published' }), 0);

    await req('POST', '/enrollments', { as: student, body: { courseId: course.id } });
    await req('PATCH', `/courses/${course.id}/publish`, { as: admin }); // already published: no transition
    assert.equal(await count(student, 'course_published'), 0);

    await req('PATCH', `/courses/${course.id}/archive`, { as: admin });
    await req('PATCH', `/courses/${course.id}/publish`, { as: admin });
    assert.equal(await count(student, 'course_published'), 1);
  });
});

describe('quiz events never leak answers', () => {
  let quizId;
  it('publishing notifies enrolled students; a draft quiz notifies nobody', async () => {
    quizId = (await req('POST', `/concepts/${id(f.pubTree.concept)}/quizzes`, { as: admin, body: { title: 'Events Quiz', passingScore: 50 } })).body.data.id;
    await req('POST', `/quizzes/${quizId}/questions`, { as: admin, body: { question: 'Pick a', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctAnswer: 'a' } });
    assert.equal(await count(student, 'quiz_published'), 0);
    await req('PATCH', `/quizzes/${quizId}/publish`, { as: admin });
    assert.equal(await count(student, 'quiz_published'), 1);
  });

  it('submitting creates one result notification and activity, with no answer data', async () => {
    const start = await req('POST', `/quizzes/${quizId}/start`, { as: student });
    await req('POST', `/quizzes/${quizId}/start`, { as: student }); // resume: logs nothing new
    assert.equal(await activities(student, 'quiz_started'), 1);

    const q = start.body.data.questions[0];
    await req('POST', `/quizzes/${quizId}/submit`, { as: student, body: { attemptId: start.body.data.attemptId, answers: [{ questionId: q.id, selectedAnswer: 'a' }] } });
    assert.equal(await count(student, 'quiz_result'), 1);
    assert.equal(await activities(student, 'quiz_submitted'), 1);
    assert.equal(await activities(student, 'quiz_passed'), 1);

    const list = await req('GET', '/notifications?limit=50', { as: student });
    const result = list.body.data.find((n) => n.type === 'quiz_result');
    assert.match(result.link, /^\/quiz\/[a-f0-9]{24}\/result\/[a-f0-9]{24}$/);
    assert.equal(JSON.stringify(list.body).includes('correctAnswer'), false);
  });
});

describe('notification API: ownership, pagination, read state', () => {
  it('requires authentication', async () => assert.equal((await req('GET', '/notifications')).status, 401));

  it('lists only the caller\'s notifications and ignores ?userId=', async () => {
    const res = await req('GET', `/notifications?userId=${id(student)}`, { as: otherStudent });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 0);
    assert.equal(res.body.meta.unreadCount, 0);
  });

  it('paginates newest first with safe limits', async () => {
    const page = await req('GET', '/notifications?limit=2&page=1', { as: student });
    assert.equal(page.body.data.length, 2);
    assert.ok(page.body.pagination.total > 2);
    const dates = page.body.data.map((n) => new Date(n.createdAt).getTime());
    assert.ok(dates[0] >= dates[1]);
    for (const q of ['limit=51', 'limit=0', 'page=0', 'filter=x']) assert.equal((await req('GET', `/notifications?${q}`, { as: student })).status, 422, q);
  });

  it('reports the unread count for the caller only', async () => {
    const mine = (await req('GET', '/notifications/unread-count', { as: student })).body.data.count;
    assert.equal(mine, await Notification.countDocuments({ recipient: student._id, isRead: false }));
    assert.equal((await req('GET', '/notifications/unread-count', { as: loner })).body.data.count, 0);
  });

  it('marks read idempotently, and cannot touch another user\'s notification', async () => {
    const first = (await req('GET', '/notifications?filter=unread', { as: student })).body.data[0];
    assert.equal((await req('PATCH', `/notifications/${first.id}/read`, { as: student })).status, 200);
    const again = await req('PATCH', `/notifications/${first.id}/read`, { as: student });
    assert.equal(again.status, 200);
    assert.equal(again.body.data.isRead, true);

    assert.equal((await req('PATCH', `/notifications/${first.id}/read`, { as: otherStudent })).status, 404);
    assert.equal((await req('DELETE', `/notifications/${first.id}`, { as: otherStudent })).status, 404);
    assert.equal((await req('PATCH', `/notifications/${MISSING_ID}/read`, { as: student })).status, 404);
    assert.equal((await req('PATCH', '/notifications/not-an-id/read', { as: student })).status, 400);
  });

  it('marks all read in one call, only for the caller, and deletes own notifications', async () => {
    const others = await Notification.countDocuments({ recipient: { $ne: student._id }, isRead: false });
    await req('PATCH', '/notifications/read-all', { as: student });
    assert.equal(await Notification.countDocuments({ recipient: student._id, isRead: false }), 0);
    assert.equal(await Notification.countDocuments({ recipient: { $ne: student._id }, isRead: false }), others);

    const any = (await req('GET', '/notifications', { as: student })).body.data[0];
    assert.equal((await req('DELETE', `/notifications/${any.id}`, { as: student })).status, 200);
  });
});

describe('announcements: authorization and delivery', () => {
  const body = (extra = {}) => ({ title: 'Heads up', message: 'Class moved.', audienceType: 'course_students', courseId: id(f.pub), ...extra });

  it('students cannot create, edit, publish or delete', async () => {
    assert.equal((await req('POST', '/announcements', { as: student, body: body() })).status, 403);
    const made = (await req('POST', '/announcements', { as: admin, body: body() })).body.data;
    for (const [method, path, b] of [['PATCH', `/announcements/${made.id}`, { title: 'x!' }], ['POST', `/announcements/${made.id}/publish`], ['DELETE', `/announcements/${made.id}`]]) {
      assert.equal((await req(method, path, { as: student, body: b })).status, 403, path);
    }
  });

  it('rejects mass assignment and bad audience/course combinations', async () => {
    assert.equal((await req('POST', '/announcements', { as: admin, body: body({ status: 'published', createdBy: id(student) }) })).status, 422);
    assert.equal((await req('POST', '/announcements', { as: admin, body: body({ courseId: undefined }) })).status, 422);
    assert.equal((await req('POST', '/announcements', { as: admin, body: body({ audienceType: 'all_students' }) })).status, 422); // courseId not allowed here
  });

  it('a mentor may target their own course but not another course or a global audience', async () => {
    assert.equal((await req('POST', '/announcements', { as: mentorA, body: body() })).status, 201);
    assert.equal((await req('POST', '/announcements', { as: mentorA, body: body({ courseId: id(f.other) }) })).status, 403);
    assert.equal((await req('POST', '/announcements', { as: mentorA, body: body({ audienceType: 'all_students', courseId: undefined }) })).status, 403);
    assert.equal((await req('POST', '/announcements', { as: mentorA, body: body({ audienceType: 'enrolled_students', courseId: undefined }) })).status, 403);
  });

  it('a mentor cannot modify another mentor\'s announcement, even for a shared course', async () => {
    await Course.updateOne({ _id: f.pub._id }, { $addToSet: { instructors: mentorB._id } });
    const mine = (await req('POST', '/announcements', { as: mentorA, body: body({ title: 'By mentor A' }) })).body.data;
    for (const [method, path, b] of [['PATCH', `/announcements/${mine.id}`, { title: 'Hijacked' }], ['POST', `/announcements/${mine.id}/publish`], ['DELETE', `/announcements/${mine.id}`]]) {
      assert.equal((await req(method, path, { as: mentorB, body: b })).status, 403, path);
    }
    assert.equal((await req('GET', `/announcements/${mine.id}`, { as: mentorB })).status, 200); // read is allowed for course mentors
    await Course.updateOne({ _id: f.pub._id }, { $pull: { instructors: mentorB._id } });
  });

  it('drafts are invisible to students', async () => {
    const draft = (await req('POST', '/announcements', { as: admin, body: body() })).body.data;
    assert.equal((await req('GET', `/announcements/${draft.id}`, { as: student })).status, 404);
    assert.equal((await req('GET', '/announcements?limit=50', { as: student })).body.data.some((a) => a.id === draft.id), false);
  });

  it('course_students reaches enrolled students only, and a second publish creates nothing', async () => {
    const made = (await req('POST', '/announcements', { as: admin, body: body({ title: 'Course only' }) })).body.data;
    const first = await req('POST', `/announcements/${made.id}/publish`, { as: admin });
    assert.equal(first.status, 200);
    assert.equal(first.body.data.recipients, await Enrollment.countDocuments({ course: f.pub._id, status: { $ne: 'cancelled' } }));

    const student1 = await Notification.countDocuments({ recipient: student._id, type: 'announcement', entityId: made.id });
    assert.equal(student1, 1);
    assert.equal(await Notification.countDocuments({ recipient: loner._id, type: 'announcement' }), 0);

    assert.equal((await req('POST', `/announcements/${made.id}/publish`, { as: admin })).status, 409);
    assert.equal(await Notification.countDocuments({ type: 'announcement', entityId: made.id }), first.body.data.recipients);
    assert.equal((await req('PATCH', `/announcements/${made.id}`, { as: admin, body: { title: 'Late edit' } })).status, 409);
  });

  it('all_students reaches every active student, enrolled or not; students then see it', async () => {
    const made = (await req('POST', '/announcements', { as: admin, body: { title: 'Everyone', message: 'Hello all', audienceType: 'all_students' } })).body.data;
    await req('POST', `/announcements/${made.id}/publish`, { as: admin });
    for (const s of [student, otherStudent, loner]) assert.equal(await Notification.countDocuments({ recipient: s._id, entityId: made.id }), 1);
    assert.equal(await Notification.countDocuments({ recipient: admin._id, entityId: made.id }), 0); // staff are not students
    assert.equal((await req('GET', `/announcements/${made.id}`, { as: loner })).status, 200);
  });

  it('a student sees course announcements only for courses they are enrolled in', async () => {
    const made = (await req('POST', '/announcements', { as: admin, body: body({ courseId: id(f.other), title: 'Other course news' }) })).body.data;
    await req('POST', `/announcements/${made.id}/publish`, { as: admin });
    assert.equal((await req('GET', `/announcements/${made.id}`, { as: student })).status, 404);
  });
});

describe('activity privacy', () => {
  it('a student sees only their own feed and cannot select another user', async () => {
    const mine = await req('GET', '/activity/my?limit=50', { as: student });
    assert.ok(mine.body.data.length > 0);
    const spoof = await req('GET', `/activity/my?userId=${id(student)}`, { as: otherStudent });
    assert.equal(spoof.body.data.length, 0);
    assert.equal(JSON.stringify(mine.body).includes('dedupeKey'), false);
  });

  it('course activity is aggregate-only, and only for admin or the assigned mentor', async () => {
    const asAdmin = await req('GET', `/activity/course/${id(f.pub)}?range=30d`, { as: admin });
    assert.equal(asAdmin.status, 200);
    assert.ok(asAdmin.body.data.activeLearners >= 1);
    assert.equal(JSON.stringify(asAdmin.body).includes(id(student)), false); // no individual learner ids
    assert.equal((await req('GET', `/activity/course/${id(f.pub)}`, { as: mentorA })).status, 200);
    assert.equal((await req('GET', `/activity/course/${id(f.other)}`, { as: mentorA })).status, 403);
    assert.equal((await req('GET', `/activity/course/${id(f.pub)}`, { as: student })).status, 403);
    assert.equal((await req('GET', `/activity/course/${id(f.pub)}?range=14d`, { as: admin })).status, 422);
    assert.equal((await req('GET', '/activity/course/not-an-id', { as: admin })).status, 400);
  });
});