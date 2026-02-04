import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Physics } from '../physics.mjs';

describe('Physics Engine', () => {
  const trackLength = 10000;

  // Base player mock
  const player = {
    x: 0,
    w: 100,
    speed: 1000,
    relativeZ: 100, // Player is 100 units in front of camera
    z: 2000 // Player is at Z=2000 (colliding with target)
  };

  // Base target mock
  const target = {
    x: 0,
    w: 100,
    speed: 500,
    z: 2000 // Target is at Z=2000
  };

  test('should detect collision when overlapping and faster', () => {
    const result = Physics.checkCollision(player, target, trackLength);
    assert.ok(result, 'Collision should be detected');
  });

  test('should ignore collision when Z distance is too large', () => {
    const farZPlayer = { ...player, z: 1000 }; // Target is 2000
    const result = Physics.checkCollision(farZPlayer, target, trackLength);
    assert.strictEqual(result, null);
  });

  test('should ignore collision when slower than target', () => {
    const slowPlayer = { ...player, speed: 400 };
    const result = Physics.checkCollision(slowPlayer, target, trackLength);
    assert.strictEqual(result, null);
  });

  test('should ignore collision when not overlapping laterally', () => {
    // Player at 0, width 100 -> -50 to 50
    // Target at 0, width 100 -> -50 to 50
    // Move player to 200 -> 150 to 250. No overlap.
    const farPlayer = { ...player, x: 200 };
    const result = Physics.checkCollision(farPlayer, target, trackLength);
    assert.strictEqual(result, null);
  });

  test('should resolve speed correctly', () => {
    // Formula: target.speed * (target.speed / player.speed)
    // 500 * (500 / 1000) = 250
    const result = Physics.checkCollision(player, target, trackLength);
    assert.strictEqual(result.speed, 250);
  });

  test('should resolve position correctly (snap behind)', () => {
    // Target Z = 2000. Player relative Z = 100.
    // Camera Position should be 2000 - 100 = 1900.
    const result = Physics.checkCollision(player, target, trackLength);
    assert.strictEqual(result.position, 1900);
  });

  test('should handle track wrapping for position snap', () => {
    // Target at 50 (just started). TrackLength 10000.
    // Player relative Z = 100.
    // Position = 50 - 100 = -50.
    // Wrapped: 10000 - 50 = 9950.
    const wrappedTarget = { ...target, z: 50 };
    // Player must be logically close for collision (e.g., at 9950)
    const wrappedPlayer = { ...player, z: 9950 };
    const result = Physics.checkCollision(wrappedPlayer, wrappedTarget, trackLength);
    assert.strictEqual(result.position, 9950);
  });
});
