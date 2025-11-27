/* eslint-env node */
/* global URL */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../common.js', import.meta.url), 'utf8');
const context = { window: { localStorage: {} } };
vm.runInNewContext(code, context);

const { Util } = context;

test('Util.limit clamps values within bounds', () => {
  assert.equal(Util.limit(5, 0, 10), 5);
  assert.equal(Util.limit(-1, 0, 10), 0);
  assert.equal(Util.limit(11, 0, 10), 10);
});
