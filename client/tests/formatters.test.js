import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatLabel, padNumber, pluralize } from '../src/utils/formatters.js';

describe('formatters', () => {
  it('formatLabel turns slugs into readable labels', () => {
    assert.equal(formatLabel('web-development'), 'Web development');
    assert.equal(formatLabel('mini_project'), 'Mini project');
    assert.equal(formatLabel(''), '');
    assert.equal(formatLabel(undefined), '');
  });

  it('pluralize handles 0, 1 and many', () => {
    assert.equal(pluralize(0, 'module'), '0 modules');
    assert.equal(pluralize(1, 'module'), '1 module');
    assert.equal(pluralize(2, 'topic'), '2 topics');
  });

  it('padNumber zero-pads to two digits', () => {
    assert.equal(padNumber(1), '01');
    assert.equal(padNumber(12), '12');
  });
});