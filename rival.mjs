import { Util } from './util.mjs';
import { SPRITES } from './constants.mjs';

export class Rival {
  constructor(config) {
    this.offset = config.offset || 0;
    this.z = config.z || 0;
    this.speed = config.speed || 0;
    this.sprite = config.sprite;
    this.percent = 0; // Used for rendering interpolation

    // AI State
    this.targetOffset = this.offset;
    this.laneChangeSpeed = 2; // Units per second
  }

  /**
   * Scans ahead for obstacles and adjusts targetOffset to avoid collision.
   * @param {Array} segments - The road segments array
   * @param {number} segmentLength - Length of one segment
   */
  checkTraffic(segments, segmentLength, player) {
    const lookahead = 20;
    const index = Math.floor(this.z / segmentLength) % segments.length;
    const myW = this.sprite.w * SPRITES.SCALE;

    for (let i = 1; i < lookahead; i++) {
      const segment = segments[(index + i) % segments.length];

      // Check for cars
      for (const car of segment.cars) {
        if (car === this) continue;

        const carW = car.sprite.w * SPRITES.SCALE;

        if (this.speed > car.speed && Util.overlap(this.offset, myW, car.offset, carW, 1.2)) {
          this.avoid(car.offset);
          return;
        }
      }

      // Check for player
      if (player) {
        const playerSegmentIndex = Math.floor(player.z / segmentLength) % segments.length;
        if (segment.index === playerSegmentIndex) {
           if (this.speed > player.speed && Util.overlap(this.offset, myW, player.x, player.w, 1.2)) {
              this.avoid(player.x);
              return;
           }
        }
      }
    }

    // Return to center if clear? (Optional behavior)
    // if (Math.random() < 0.01) this.targetOffset = 0;
  }

  avoid(obstacleOffset) {
    // Simple logic: if obstacle is right, go left. If left, go right.
    // Add some randomness to target lane (-0.5 or 0.5 or 0.8)
    if (obstacleOffset > 0) {
      this.targetOffset = -0.5;
    } else {
      this.targetOffset = 0.5;
    }
  }

  update(dt, trackLength) {
    // 1. Move forward
    this.z = Util.increase(this.z, dt * this.speed, trackLength);

    // 2. Lateral Movement (Smooth Lane Change)
    if (this.offset !== this.targetOffset) {
      const dir = this.targetOffset > this.offset ? 1 : -1;
      const step = this.laneChangeSpeed * dt;

      if (Math.abs(this.targetOffset - this.offset) <= step) {
        this.offset = this.targetOffset;
      } else {
        this.offset += dir * step;
      }
    }

    // 3. Update percent (optional, but good for consistency with cars)
    // We don't have segmentLength here usually, but if we need it we can add it.
  }
}
