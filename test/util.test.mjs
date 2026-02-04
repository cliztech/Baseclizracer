import test from 'node:test';
import assert from 'node:assert/strict';
import { Util } from '../util.mjs';

test('Util.limit clamps values within bounds', () => {
  assert.equal(Util.limit(5, 0, 10), 5);
  assert.equal(Util.limit(-1, 0, 10), 0);
  assert.equal(Util.limit(11, 0, 10), 10);
});

test('Util.project centers point at screen midpoint', () => {
  const p = { world: { x: 0, y: 0, z: 1000 }, camera: {}, screen: {} };
  Util.project(p, 0, 0, 0, 1, 800, 600, 2000);
  assert.equal(p.screen.x, 400);
  assert.equal(p.screen.y, 300);
});
