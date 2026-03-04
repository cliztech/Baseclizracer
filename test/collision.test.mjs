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
function update(remotePlayers, playerXState) {
  let playerX = playerXState;
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

          // Bounce
          if (playerX > p.x) playerX += 0.1;
          else               playerX -= 0.1;

          return { hit: true, playerX: playerX };
        }
      }
    }
  }
  return { hit: false, playerX: playerX };
}

test('Remote Player Collision Logic', (t) => {
  // Assume width is 0.2
  SPRITES.PLAYER_STRAIGHT.w = 0.2 / SPRITES.SCALE;

  // Setup Remote Player directly in front at x=0
  const remotePlayers = {
    'p1': {
      x: 0,
      z: 100, // Same Z as player (position 0 + playerZ 100)
      speed: 0,
      sprite: { w: 0.2 / SPRITES.SCALE }
    }
  };

  // Test 1: Hit from right (playerX = 0.05) -> Should bounce Right (+)
  speed = 1000;
  let res = update(remotePlayers, 0.05);
  assert.strictEqual(res.hit, true, 'Should hit when overlapping');
  assert.strictEqual(speed, 0, 'Speed should drop to 0');
  assert.ok(res.playerX > 0.05, 'Should bounce to the right (increase X)');

  // Test 2: Hit from left (playerX = -0.05) -> Should bounce Left (-)
  speed = 1000;
  res = update(remotePlayers, -0.05);
  assert.strictEqual(res.hit, true, 'Should hit from left');
  assert.ok(res.playerX < -0.05, 'Should bounce to the left (decrease X)');

  // Test 3: Miss (playerX = 0.5)
  speed = 1000;
  res = update(remotePlayers, 0.5);
  assert.strictEqual(res.hit, false, 'Should miss when far away');
  assert.strictEqual(res.playerX, 0.5, 'X position should not change on miss');
});
