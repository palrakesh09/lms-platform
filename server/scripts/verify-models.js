// Development-only check that all models load, indexes build, and validation rules behave.
// It writes NO documents. It does create empty collections and indexes in the database that
// MONGODB_URI points to, so never point it at production data.
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import * as models from '../src/models/index.js';

const { User, Course, Module, Topic, Concept, Resource, Progress } = models;

const id = () => new mongoose.Types.ObjectId();
const audit = () => ({ createdBy: id() });

// [Model, index key, expected unique flag]
const expectedIndexes = [
  [User, { email: 1 }, true],
  [User, { role: 1, createdAt: -1 }, false],
  [Course, { slug: 1 }, true],
  [Course, { status: 1, order: 1 }, false],
  [Course, { instructors: 1 }, false],
  [Module, { course: 1, order: 1 }, false],
  [Module, { course: 1, slug: 1 }, true],
  [Topic, { module: 1, order: 1 }, false],
  [Topic, { module: 1, slug: 1 }, true],
  [Concept, { topic: 1, order: 1 }, false],
  [Concept, { topic: 1, slug: 1 }, true],
  [Resource, { concept: 1, type: 1, order: 1 }, false],
  [Progress, { student: 1, concept: 1 }, true],
  [Progress, { student: 1, course: 1, lastAccessedAt: -1 }, false],
];

// `invalid` lists the paths that must fail validation ([] means the document must be valid).
// `checks` are extra assertions on documents that are expected to be valid.
const validationCases = [
  {
    label: 'User: valid input',
    Model: User,
    data: { name: 'Test User', email: '  Test@Example.COM ', password: 'x'.repeat(60) },
    invalid: [],
    checks: [
      ['email is trimmed and lowercased', (doc) => doc.email === 'test@example.com'],
      ['role defaults to student', (doc) => doc.role === 'student'],
      ['isActive defaults to true', (doc) => doc.isActive === true],
      ['toJSON() omits password', (doc) => !('password' in doc.toJSON())],
    ],
  },
  {
    label: 'User: bad email, unknown role, missing password',
    Model: User,
    data: { name: 'Test User', email: 'not-an-email', role: 'superuser' },
    invalid: ['email', 'password', 'role'],
  },
  {
    label: 'Course: valid input',
    Model: Course,
    data: { title: 'Sample Course', slug: 'Sample-Course', ...audit() },
    invalid: [],
    checks: [
      ['slug is lowercased', (doc) => doc.slug === 'sample-course'],
      ['status defaults to draft', (doc) => doc.status === 'draft'],
      ['level defaults to beginner', (doc) => doc.level === 'beginner'],
      ['instructors defaults to empty', (doc) => doc.instructors.length === 0],
    ],
  },
  {
    label: 'Course: bad slug, level, thumbnail and title',
    Model: Course,
    data: {
      title: 'x',
      slug: 'Not A Slug!',
      level: 'expert',
      thumbnail: 'javascript:alert(1)',
      ...audit(),
    },
    invalid: ['level', 'slug', 'thumbnail', 'title'],
  },
  {
    label: 'Module: valid input',
    Model: Module,
    data: { course: id(), title: 'Sample Module', slug: 'sample-module', ...audit() },
    invalid: [],
  },
  {
    label: 'Module: missing course and createdBy',
    Model: Module,
    data: { title: 'Sample Module', slug: 'sample-module' },
    invalid: ['course', 'createdBy'],
  },
  {
    label: 'Topic: valid input',
    Model: Topic,
    data: { module: id(), title: 'Sample Topic', slug: 'sample-topic', ...audit() },
    invalid: [],
  },
  {
    label: 'Topic: negative order, unknown status',
    Model: Topic,
    data: {
      module: id(),
      title: 'Sample Topic',
      slug: 'sample-topic',
      order: -1,
      status: 'live',
      ...audit(),
    },
    invalid: ['order', 'status'],
  },
  {
    label: 'Concept: valid input',
    Model: Concept,
    data: { topic: id(), title: 'Sample Concept', slug: 'sample-concept', ...audit() },
    invalid: [],
  },
  {
    label: 'Concept: malformed topic id, fractional order',
    Model: Concept,
    data: {
      topic: 'not-an-object-id',
      title: 'Sample Concept',
      slug: 'sample-concept',
      order: 1.5,
      ...audit(),
    },
    invalid: ['order', 'topic'],
  },
  {
    label: 'Resource: valid mini-project',
    Model: Resource,
    data: {
      concept: id(),
      type: 'mini-project',
      title: 'Sample Resource',
      url: 'https://example.com/resource',
      ...audit(),
    },
    invalid: [],
    checks: [
      ['openInNewTab defaults to true', (doc) => doc.openInNewTab === true],
      ['status defaults to draft', (doc) => doc.status === 'draft'],
    ],
  },
  {
    label: 'Resource: unknown type, javascript: URL',
    Model: Resource,
    data: {
      concept: id(),
      type: 'video',
      title: 'Sample Resource',
      url: 'javascript:alert(1)',
      ...audit(),
    },
    invalid: ['type', 'url'],
  },
  {
    label: 'Resource: missing URL',
    Model: Resource,
    data: { concept: id(), type: 'theory', title: 'Sample Resource', ...audit() },
    invalid: ['url'],
  },
  {
    label: 'Progress: valid input',
    Model: Progress,
    data: { student: id(), course: id(), concept: id() },
    invalid: [],
    checks: [
      ['completed defaults to false', (doc) => doc.completed === false],
      ['lastAccessedAt defaults to a date', (doc) => doc.lastAccessedAt instanceof Date],
    ],
  },
  {
    label: 'Progress: missing student',
    Model: Progress,
    data: { course: id(), concept: id() },
    invalid: ['student'],
  },
];

const main = async () => {
  if (env.isProduction) {
    console.error('[verify] Refusing to run with NODE_ENV=production.');
    return 1;
  }

  let failures = 0;
  const report = (ok, message) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);
    if (!ok) failures += 1;
  };

  await connectDB();

  console.log('\n-- Models and indexes --');
  const modelList = Object.values(models);
  await Promise.all(modelList.map((Model) => Model.init())); // creates collections and builds indexes
  console.log(`Collections: ${modelList.map((Model) => Model.collection.name).join(', ')}`);

  for (const [Model, key, unique] of expectedIndexes) {
    const indexes = await Model.collection.indexes();
    const found = indexes.find((index) => JSON.stringify(index.key) === JSON.stringify(key));
    report(
      Boolean(found) && Boolean(found.unique) === unique,
      `${Model.collection.name} ${JSON.stringify(key)}${unique ? ' (unique)' : ''}`,
    );
  }

  console.log('\n-- Schema rules --');
  report(User.schema.path('password').options.select === false, 'users.password is select:false');

  console.log('\n-- Validation (in memory, nothing is saved) --');
  for (const { label, Model, data, invalid, checks = [] } of validationCases) {
    const doc = new Model(data);
    const failedPaths = await doc.validate().then(
      () => [],
      (error) => {
        // Anything other than a validation failure is a real bug, so don't swallow it.
        if (error.name !== 'ValidationError') throw error;
        return Object.keys(error.errors).sort();
      },
    );
    const expectedPaths = [...invalid].sort();
    const detail = failedPaths.length > 0 ? ` -> rejected: ${failedPaths.join(', ')}` : '';

    report(JSON.stringify(failedPaths) === JSON.stringify(expectedPaths), `${label}${detail}`);

    for (const [description, predicate] of checks) {
      report(predicate(doc), `${label}: ${description}`);
    }
  }

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  return failures === 0 ? 0 : 1;
};

main()
  .then(async (exitCode) => {
    await disconnectDB();
    process.exit(exitCode);
  })
  .catch(async (error) => {
    console.error('[verify] Unexpected error:', error.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  });