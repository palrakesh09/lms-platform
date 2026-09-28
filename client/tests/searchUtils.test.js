import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterStructure, groupByKind, normalizeQuery, toSafeInternalPath } from '../src/utils/searchUtils.js';

const r = (id, title) => ({ id, title, resources: [] });
const structure = {
  course: { id: 'c', title: 'Course' },
  modules: [
    { id: 'm1', title: 'HTML5', topics: [
      { id: 't1', title: 'Forms', concepts: [{ ...r('k1', 'Form Validation'), resources: [r('r1', 'Validation Theory'), r('r2', 'Practice Task')] }, r('k2', 'Inputs')] },
      { id: 't2', title: 'Media', concepts: [r('k3', 'Audio')] },
    ] },
    { id: 'm2', title: 'CSS', topics: [{ id: 't3', title: 'Layout', concepts: [r('k4', 'Grid')] }] },
  ],
};

describe('normalizeQuery / toSafeInternalPath', () => {
  it('collapses whitespace and caps length', () => {
    assert.equal(normalizeQuery('  html   forms '), 'html forms');
    assert.equal(normalizeQuery('x'.repeat(300)).length, 100);
    assert.equal(normalizeQuery(null), '');
  });
  it('only allows in-app paths', () => {
    assert.equal(toSafeInternalPath('/learn/a/resource/b'), '/learn/a/resource/b');
    for (const bad of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', '', null]) assert.equal(toSafeInternalPath(bad), '/');
  });
});

describe('groupByKind', () => {
  it('groups in display order and drops empty groups', () => {
    const groups = groupByKind([{ type: 'quiz', id: '1' }, { type: 'course', id: '2' }, { type: 'quiz', id: '3' }]);
    assert.deepEqual(groups.map((g) => [g.type, g.items.length]), [['course', 1], ['quiz', 2]]);
  });
});

describe('filterStructure', () => {
  it('returns the original structure for an empty query', () => {
    const out = filterStructure(structure, '  ');
    assert.equal(out.structure, structure);
    assert.equal(out.expandedIds, null);
  });
  it('reveals only the matching path, expanded, with original numbering', () => {
    const out = filterStructure(structure, 'validation');
    assert.deepEqual(out.structure.modules.map((m) => m.id), ['m1']);
    assert.deepEqual(out.structure.modules[0].topics.map((t) => t.id), ['t1']);
    assert.deepEqual(out.structure.modules[0].topics[0].concepts.map((c) => c.id), ['k1']);
    assert.ok(out.expandedIds.has('m1') && out.expandedIds.has('t1'));
  });
  it('filters resources inside a concept when only a resource title matches', () => {
    const out = filterStructure(structure, 'practice');
    assert.deepEqual(out.structure.modules[0].topics[0].concepts[0].resources.map((x) => x.id), ['r2']);
  });
  it('keeps the whole subtree when a module matches, and preserves _index', () => {
    const out = filterStructure(structure, 'css');
    assert.equal(out.structure.modules[0]._index, 1);
    assert.equal(out.structure.modules[0].topics[0].concepts.length, 1);
  });
  it('returns no modules when nothing matches', () => {
    const out = filterStructure(structure, 'zzz');
    assert.equal(out.structure.modules.length, 0);
    assert.equal(out.conceptCount, 0);
  });
});