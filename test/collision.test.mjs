import { test } from 'node:test';
import assert from 'node:assert';

// Mock dependencies
const SPRITES = {
  SCALE: 1,
  PLAYER_STRAIGHT: { w: 100 },
  CARS: [{ w: 100 }]
};

const Util = {
  overlap: (x1, w1, x2, w2, percent) => {
    // Simple 1D overlap check centered at 0
    // x is center, w is full width
    const half1 = w1/2;
    const half2 = w2/2;
    const min1 = x1 - half1;
    const max1 = x1 + half1;
    const min2 = x2 - half2;
    const max2 = x2 + half2;
    return max1 >= min2 && min1 <= max2;
  },
  increase: (start, increment, max) => (start + increment) % max
};

// Mock Game State
let speed = 1000;
const playerZ = 100;
let position = 0;
const trackLength = 10000;
const segmentLength = 200;

function findSegment(z) {
  return { index: Math.floor(z / segmentLength) };
}

// Replicate collision logic
function update(remotePlayers, playerX) {
  const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  const playerSegment = findSegment(position + playerZ);

  for (const id in remotePlayers) {
    let p = remotePlayers[id];
    let pW = p.sprite.w * SPRITES.SCALE;
    let pSegment = findSegment(p.z);

    if (Math.abs(pSegment.index - playerSegment.index) < 2) {
      if (speed > p.speed) {
        if (Util.overlap(playerX, playerW, p.x, pW, 0.8)) {
          speed    = p.speed * (p.speed/speed);
          position = Util.increase(p.z, -playerZ, trackLength);
          return true; // Collision happened
        }
      }
    }
  }
  return false;
}

test('Remote Player Collision Logic', (t) => {
  // Setup Remote Player directly in front
  const remotePlayers = {
    'p1': {
      x: 0,
      z: 100, // Same Z as player (position 0 + playerZ 100)
      speed: 0,
      sprite: { w: 100 }
    }
  };

  // Player at X=0 (collision)
  const hit = update(remotePlayers, 0);
  assert.strictEqual(hit, true, 'Should detect collision when directly behind');
  assert.strictEqual(speed, 0, 'Speed should drop to remote player speed (0)');

  // Reset speed
  speed = 1000;

  // Player at X=0.9 (no collision)
  // Player width 100, Remote width 100.
  // Normalized X range -1 to 1?
  // In game, X is normalized -1 to 1. Width is relative to road width?
  // Actually, Util.overlap takes raw numbers.
  // In v4.final.js: playerW = SPRITES... * SCALE.
  // playerX is -1 to 1.
  // In my mock, I used 100 for width.
  // If roadWidth is 2000, then playerW should be small relative to X?
  // Wait, in v4.final.js:
  // Util.overlap(playerX, playerW, p.x, pW, 0.8)
  // playerX is normalized (-1..1).
  // playerW must be normalized too?
  // Let's check v4.final.js:
  // var playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  // This is in pixels?
  // overlap(x1, w1, x2, w2)
  // Game uses normalized X for car.offset and playerX.
  // But playerW is likely in pixels?
  // NO.
  // In `render()`: `Util.project` uses `playerX * roadWidth`.
  // In `update()`: `Util.overlap(playerX, playerW, ...)`
  // If `playerX` is -1..1, and `playerW` is pixels (e.g. 80 * 0.003 = 0.24?), then it works if both are normalized or both are pixels.
  // `SPRITES.SCALE` is `(1/sprites.height) * 1000`? No, it's defined in constants.
  // `v4.final.js`: `var playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;`
  // `constants.mjs`: `SCALE: 0.3 * (1/80)` (example).
  // It seems `playerW` is normalized to road width.

  // So my test setup needs to assume normalized widths.
  // Let's assume width is 0.2.

  // Reset for test 2
  SPRITES.PLAYER_STRAIGHT.w = 0.2 / SPRITES.SCALE;
  remotePlayers['p1'].sprite.w = 0.2 / SPRITES.SCALE;

  const miss = update(remotePlayers, 0.5); // 0.5 vs 0. Width 0.2. Should miss.
  assert.strictEqual(miss, false, 'Should miss when X is far apart');
});
