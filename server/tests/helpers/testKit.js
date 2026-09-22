import './testEnv.js'; // keep first
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { AUTH_COOKIE_NAME } from '../../src/config/authCookie.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import * as models from '../../src/models/index.js';
import { signAccessToken } from '../../src/utils/token.js';

const { User, Course, Module, Topic, Concept, Resource } = models;
const modelList = Object.values(models);

const USER_ROLES = { admin: 'admin', mentorA: 'mentor', mentorB: 'mentor', student: 'student' };

// Connects to the test database, empties it, creates one user per role, and starts the real Express
// app on a random port. Requests are authenticated with real JWTs minted for those users.
export const startApi = async () => {
  await connectDB();

  const databaseName = mongoose.connection.name;
  if (!databaseName.endsWith('-test')) {
    await disconnectDB();
    throw new Error(`Refusing to run API tests against "${databaseName}". Its name must end with "-test".`);
  }

  await Promise.all(modelList.map((Model) => Model.init())); // wait for index builds
  await Promise.all(modelList.map((Model) => Model.deleteMany({})));

  const users = {};
  for (const [key, role] of Object.entries(USER_ROLES)) {
    users[key] = await User.create({
      name: `Test ${key}`,
      email: `${key.toLowerCase()}@example.com`,
      password: 'placeholder-hash-tests-use-minted-tokens', // never used to log in
      role,
    });
  }

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  // call('GET', '/courses', { as: users.student, body })
  const call = async (method, path, { as, body } = {}) => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (as) headers.Cookie = `${AUTH_COOKIE_NAME}=${signAccessToken(as._id)}`;

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  const stop = async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await Promise.all(modelList.map((Model) => Model.deleteMany({})));
    await disconnectDB();
  };

  return { call, users, stop };
};

// Direct inserts (bypassing the API) so tests can build states the API would not create, such as
// a published topic inside a draft module.
export const seedFixtures = async (users) => {
  const createdBy = users.admin._id;
  const make = (Model, data) => Model.create({ createdBy, status: 'published', order: 1, ...data });

  const tree = async (course, key) => {
    const mod = await make(Module, { course: course._id, title: `${key} module`, slug: `${key}-module` });
    const topic = await make(Topic, { module: mod._id, title: `${key} topic`, slug: `${key}-topic` });
    const concept = await make(Concept, { topic: topic._id, title: `${key} concept`, slug: `${key}-concept` });
    const resource = await make(Resource, {
      concept: concept._id,
      type: 'theory',
      title: `${key} resource`,
      url: 'https://example.com/theory',
    });
    return { mod, topic, concept, resource };
  };

  const course = (key, status, instructors) =>
    make(Course, {
      title: `${key} course`,
      slug: `${key}-course`,
      status,
      instructors: instructors.map((user) => user._id),
    });

  const pub = await course('pub', 'published', [users.mentorA]);
  const draft = await course('draft', 'draft', [users.mentorA]);
  const archived = await course('archived', 'archived', [users.mentorA]);
  const other = await course('other', 'published', [users.mentorB]);

  const pubTree = await tree(pub, 'pub');
  const draftTree = await tree(draft, 'draft');
  const archivedTree = await tree(archived, 'archived');
  const otherTree = await tree(other, 'other');

  // Unpublished nodes inside the PUBLISHED course. Students must never see any of these.
  const hiddenModule = await make(Module, { course: pub._id, title: 'Hidden module', slug: 'hidden-module', status: 'draft' });
  const topicUnderHiddenModule = await make(Topic, { module: hiddenModule._id, title: 'Under hidden', slug: 'under-hidden' });
  const hiddenTopic = await make(Topic, { module: pubTree.mod._id, title: 'Hidden topic', slug: 'hidden-topic', status: 'draft' });
  const hiddenConcept = await make(Concept, { topic: pubTree.topic._id, title: 'Hidden concept', slug: 'hidden-concept', status: 'draft' });
  const hiddenResource = await make(Resource, {
    concept: pubTree.concept._id,
    type: 'task',
    title: 'Hidden task',
    url: 'https://example.com/task',
    status: 'archived',
  });

  return {
    pub, draft, archived, other,
    pubTree, draftTree, archivedTree, otherTree,
    hiddenModule, topicUnderHiddenModule, hiddenTopic, hiddenConcept, hiddenResource,
  };
};