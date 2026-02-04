import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { Util } from '../util.mjs';

describe('Util RNG', () => {
  after(() => {
    Util.setSeed(null);
  });

  it('should produce identical sequences with the same seed', () => {
    Util.setSeed(12345);
    const seq1 = [Util.random(), Util.random(), Util.randomInt(0, 100)];

    Util.setSeed(12345);
    const seq2 = [Util.random(), Util.random(), Util.randomInt(0, 100)];

    assert.deepStrictEqual(seq1, seq2, 'Sequences should be identical');
  });

  it('should produce different sequences with different seeds', () => {
    Util.setSeed(12345);
    const seq1 = [Util.random(), Util.random(), Util.randomInt(0, 100)];

    Util.setSeed(67890);
    const seq2 = [Util.random(), Util.random(), Util.randomInt(0, 100)];

    assert.notDeepStrictEqual(seq1, seq2, 'Sequences should differ');
  });

  it('should default to unseeded behavior', () => {
    Util.setSeed(null); // Reset
    const val = Util.random();
    assert.ok(val >= 0 && val <= 1, 'Random should be between 0 and 1');
  });
});
