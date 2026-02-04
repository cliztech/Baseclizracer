import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocket } from '../net.mjs';

test('net module exports createSocket', () => {
  assert.equal(typeof createSocket, 'function');
});
