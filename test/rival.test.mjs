import { test } from 'node:test';
import assert from 'node:assert';
import { Rival } from '../rival.mjs';

test('Rival instantiation', () => {
  const rival = new Rival({ offset: 0.5, z: 100, speed: 500 });
  assert.strictEqual(rival.offset, 0.5);
  assert.strictEqual(rival.z, 100);
  assert.strictEqual(rival.speed, 500);
});

test('Rival update moves forward', () => {
  const rival = new Rival({ z: 0, speed: 100 });
  rival.update(1, 1000); // dt=1s, trackLength=1000
  assert.strictEqual(rival.z, 100);
});

test('Rival update wraps around track', () => {
  const rival = new Rival({ z: 950, speed: 100 });
  rival.update(1, 1000);
  assert.strictEqual(rival.z, 50); // 950 + 100 = 1050 -> 50
});

test('Rival smooth lane change', () => {
  const rival = new Rival({ offset: 0 });
  rival.targetOffset = 1;
  rival.laneChangeSpeed = 1; // 1 unit/sec

  rival.update(0.5, 1000); // 0.5s passed
  assert.strictEqual(rival.offset, 0.5);

  rival.update(0.5, 1000); // Another 0.5s passed
  assert.strictEqual(rival.offset, 1);

  rival.update(0.1, 1000); // Overshoot check
  assert.strictEqual(rival.offset, 1);
});

test('Rival avoids slower car ahead', () => {
  // Use a sprite mock that mimics the structure expected
  const mockSprite = { w: 1000 };
  const rival = new Rival({ offset: 0, z: 0, speed: 1000, sprite: mockSprite });

  // Mock segments
  const segments = Array.from({ length: 100 }, (v, i) => ({
    index: i,
    cars: []
  }));

  // Place slower car ahead in same lane (segment 1, dist 200)
  const slowerCar = {
    offset: 0,
    speed: 500,
    sprite: mockSprite,
    // Add other props if needed by loop
  };
  segments[1].cars.push(slowerCar);

  // Run check
  rival.checkTraffic(segments, 200, null);

  // Expect targetOffset to change from 0 (avoidance)
  assert.ok(rival.targetOffset !== 0, 'Should have steered away');
});
