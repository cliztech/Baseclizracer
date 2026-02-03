/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import vm from 'node:vm';
import { CAR_LIBRARY, DEFAULT_CAR_ID, LEVEL_ROTATION, createLevelRotation, findCarById } from '../game-config.mjs';

test('default car definition is available with stats', () => {
  const car = findCarById(DEFAULT_CAR_ID);
  assert.equal(car.id, DEFAULT_CAR_ID);
  assert.ok(car.stats.accel > 0);
  assert.ok(car.stats.topSpeed > 0);
  assert.ok(car.stats.grip > 0);
});

test('level rotation cycles through all entries and loops', () => {
  const rotation = createLevelRotation(LEVEL_ROTATION[0].id);
  const ids = LEVEL_ROTATION.map(() => rotation.nextId());
  assert.deepEqual(ids, LEVEL_ROTATION.map(level => level.id));
  assert.equal(rotation.nextId(), LEVEL_ROTATION[0].id);
});

test('car sprite keys map to defined sprites', () => {
  const code = readFileSync(new URL('../common.js', import.meta.url), 'utf8');
  const context = { window: { localStorage: {} } };
  vm.runInNewContext(code, context);
  const { SPRITES } = context;
  CAR_LIBRARY.forEach(car => {
    Object.values(car.spriteKeys).forEach(key => {
      assert.ok(SPRITES[key], `missing sprite key ${key} for ${car.id}`);
    });
    assert.ok(SPRITES[car.trafficSpriteKey], `missing traffic sprite for ${car.id}`);
  });
});
