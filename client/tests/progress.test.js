import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatPercentage, isConceptComplete, summarizeConcepts, toProgressMap } from '../src/utils/progress.js';

const rows = [
  { conceptId: 'c1', completed: true, completedAt: '2026-01-01', lastAccessedAt: '2026-01-02' },
  { conceptId: 'c2', completed: false, completedAt: null, lastAccessedAt: '2026-01-01' },
];

describe('toProgressMap / isConceptComplete', () => {
  it('maps rows by conceptId', () => {
    const map = toProgressMap(rows);
    assert.equal(map.get('c1').completed, true);
    assert.equal(map.size, 2);
  });

  it('defaults an unlisted concept to not completed', () => {
    const map = toProgressMap(rows);
    assert.equal(isConceptComplete(map, 'c1'), true);
    assert.equal(isConceptComplete(map, 'c2'), false);
    assert.equal(isConceptComplete(map, 'unknown'), false);
  });

  it('copes with an empty or missing list', () => {
    assert.equal(toProgressMap().size, 0);
    assert.equal(toProgressMap([]).size, 0);
  });
});

describe('summarizeConcepts', () => {
  it('counts completed concepts among a given list', () => {
    const map = toProgressMap(rows);
    const concepts = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }];
    assert.deepEqual(summarizeConcepts(concepts, map), { total: 3, completed: 1 });
  });

  it('returns zero of zero for an empty list', () => {
    assert.deepEqual(summarizeConcepts([], toProgressMap()), { total: 0, completed: 0 });
  });
});

describe('formatPercentage', () => {
  it('rounds to a whole number with a percent sign', () => {
    assert.equal(formatPercentage(37.5), '38%');
    assert.equal(formatPercentage(0), '0%');
    assert.equal(formatPercentage(100), '100%');
  });
});