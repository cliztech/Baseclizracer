import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RemotePlayer } from '../remote-player.mjs';

describe('RemotePlayer', () => {
  it('should initialize with default values', () => {
    const p = new RemotePlayer('p1', { name: 'Ace' });
    assert.strictEqual(p.id, 'p1');
    assert.strictEqual(p.x, 0);
    assert.strictEqual(p.z, 0);
    assert.strictEqual(p.speed, 0);
  });

  it('should sync with server data', () => {
    const p = new RemotePlayer('p1', {});
    p.sync({ x: 0.5, z: 100, speed: 50 });
    assert.strictEqual(p.target.x, 0.5);
    assert.strictEqual(p.target.z, 100);
    assert.strictEqual(p.target.speed, 50);
    // Current state shouldn't snap immediately (handled in update)
    assert.strictEqual(p.x, 0);
  });

  it('should predict movement (Dead Reckoning)', () => {
    const p = new RemotePlayer('p1', { z: 0, speed: 100 });
    // Target is also 0 initially.
    // dt = 0.01 (10ms). Smoothing = 0.1.
    // Predicted Z = 0 + 100 * 0.01 = 1.
    // Corrected Z = interpolate(1, 0, 0.1) = 1 + (0-1)*0.1 = 0.9.
    p.update(0.01, 1000);

    assert.ok(p.z > 0, 'Player should move forward due to speed');
    assert.ok(p.z < 1, 'Player should be pulled back slightly towards target');
    assert.strictEqual(p.z, 0.9);
  });

  it('should smooth towards target', () => {
     const p = new RemotePlayer('p1', { x: 0 });
     p.sync({ x: 1 }); // Target x = 1
     // dt = 0.01. Smoothing = 0.1.
     p.update(0.01, 1000);
     // x = interpolate(0, 1, 0.1) = 0.1.
     assert.strictEqual(p.x, 0.1);
  });

  it('should handle Z wrapping', () => {
    const trackLength = 1000;
    // Player at 990. Target at 10 (crossed finish line).
    const p = new RemotePlayer('p1', { z: 990, speed: 0 });
    p.sync({ z: 10 });

    // dt=0.01. Smoothing=0.1.
    // Distance 990 -> 10 is wrapped distance 20.
    // Logic: if abs(10 - 990) > 500 -> True.
    // It should snap to target (per current implementation).
    p.update(0.01, trackLength);
    assert.strictEqual(p.z, 10);
  });
});
