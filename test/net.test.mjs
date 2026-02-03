import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocket, DEFAULT_COSMETICS, deserializePlayerState, serializePlayerState } from '../net.mjs';

test('net module exports createSocket', () => {
  assert.equal(typeof createSocket, 'function');
});

test('serializePlayerState includes cosmetic fields', () => {
  const packet = serializePlayerState({
    id: 'abc',
    x: 1,
    z: 2,
    speed: 3,
    carSkin: 'midnight-cyan',
    color: '#00ffee'
  });
  const parsed = JSON.parse(packet);
  assert.equal(parsed.carSkin, 'midnight-cyan');
  assert.equal(parsed.color, '#00ffee');
});

test('deserializePlayerState applies defaults for cosmetics', () => {
  const parsed = deserializePlayerState(JSON.stringify({ x: 1, z: 2, speed: 3 }));
  assert.equal(parsed.carSkin, DEFAULT_COSMETICS.carSkin);
  assert.equal(parsed.color, DEFAULT_COSMETICS.color);
});
