import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RANGES } from '../src/hooks/useAnalyticsRange.js';

describe('analytics range options', () => {
  it('exposes exactly the three supported ranges, matching the backend enum', () => {
    assert.deepEqual(RANGES.map((r) => r.value), ['7d', '30d', '90d']);
  });
});