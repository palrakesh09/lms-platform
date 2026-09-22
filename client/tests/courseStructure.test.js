import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countStructure, findEntry, flattenResources } from '../src/utils/courseStructure.js';

const res = (id) => ({ id, type: 'theory', title: id, url: 'https://example.com', openInNewTab: true });

const structure = {
  course: { id: 'c1', title: 'Course' },
  modules: [
    {
      id: 'm1',
      title: 'Module 1',
      topics: [
        {
          id: 't1',
          title: 'Topic 1',
          concepts: [
            { id: 'k1', title: 'Concept 1', resources: [res('r1'), res('r2')] },
            { id: 'k2', title: 'Concept 2', resources: [] },
          ],
        },
        { id: 't2', title: 'Topic 2', concepts: [] },
      ],
    },
    { id: 'm2', title: 'Module 2', topics: [] },
    {
      id: 'm3',
      title: 'Module 3',
      topics: [{ id: 't3', title: 'Topic 3', concepts: [{ id: 'k3', title: 'Concept 3', resources: [res('r3')] }] }],
    },
  ],
};

describe('flattenResources', () => {
  it('lists every resource in display order with the nodes it sits under', () => {
    const entries = flattenResources(structure);

    assert.deepEqual(entries.map((entry) => entry.resource.id), ['r1', 'r2', 'r3']);
    assert.equal(entries[0].concept.id, 'k1');
    assert.equal(entries[0].topic.id, 't1');
    assert.equal(entries[0].module.id, 'm1');
    assert.equal(entries[2].module.id, 'm3');
  });

  it('copes with empty, partial or missing structures', () => {
    assert.deepEqual(flattenResources(null), []);
    assert.deepEqual(flattenResources({ modules: [] }), []);
    assert.deepEqual(flattenResources({ modules: [{ id: 'm', title: 'M' }] }), []);
  });
});

describe('findEntry', () => {
  const entries = flattenResources(structure);

  it('finds a resource that belongs to the course', () => {
    assert.equal(findEntry(entries, 'r3').resource.id, 'r3');
  });

  it('returns null for unknown ids and empty input', () => {
    assert.equal(findEntry(entries, 'from-another-course'), null);
    assert.equal(findEntry(entries, ''), null);
    assert.equal(findEntry(entries, null), null);
  });
});

describe('countStructure', () => {
  it('counts every level', () => {
    assert.deepEqual(countStructure(structure), { modules: 3, topics: 3, concepts: 3, resources: 3 });
  });

  it('returns zeros for nothing', () => {
    assert.deepEqual(countStructure(undefined), { modules: 0, topics: 0, concepts: 0, resources: 0 });
  });
});