import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTweakUI, refreshTweakUI } from '../tweak-ui.mjs';

test('tweak UI utilities export functions', () => {
  assert.equal(typeof setupTweakUI, 'function');
  assert.equal(typeof refreshTweakUI, 'function');
});
