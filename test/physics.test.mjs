/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import vm from 'node:vm';

const code = readFileSync(new URL('../common.js', import.meta.url), 'utf8');
const context = { window: { localStorage: {} } };
vm.runInNewContext(code, context);
const { Util } = context;

test('Util.project centers point at screen midpoint', () => {
  const p = { world: { x: 0, y: 0, z: 1000 }, camera: {}, screen: {} };
  Util.project(p, 0, 0, 0, 1, 800, 600, 2000);
  assert.equal(p.screen.x, 400);
  assert.equal(p.screen.y, 300);
});
