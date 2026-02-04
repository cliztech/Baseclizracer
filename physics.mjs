import { Util } from './util.mjs';

export const Physics = {
  /**
   * Checks for collision between player and a target (car/remote player)
   * and calculates the resolved state (slow down + snap behind).
   *
   * @param {Object} player - { x, w, speed, relativeZ }
   * @param {Object} target - { x, w, speed, z }
   * @param {number} trackLength - Total length of track for wrapping calculations
   * @returns {Object|null} - Returns { speed, position } if collision occurs, else null.
   */
  checkCollision(player, target, trackLength) {
    // 1. Check Speed Differential: Only collide if player is faster (rear-ending)
    if (player.speed <= target.speed) {
      return null;
    }

    // 2. Check Longitudinal Proximity (Z-depth)
    // Determine distance taking track wrapping into account
    // player.z and target.z are absolute track positions
    let dist = Math.abs(player.z - target.z);
    if (trackLength) { // Handle wrapping
      const halfTrack = trackLength / 2;
      if (dist > halfTrack) {
        dist = trackLength - dist;
      }
    }

    // Assume a car length/depth of roughly one segment (200) or less.
    // Using 250 as a safe collision box depth.
    if (dist > 250) {
      return null;
    }

    // 3. Check Lateral Overlap
    // Uses 0.8 fudge factor from original game logic to be forgiving
    if (Util.overlap(player.x, player.w, target.x, target.w, 0.8)) {

      // 4. Resolve Collision
      // Formula: speed = target.speed * (target.speed / player.speed)
      // This drastically slows the player down if they are much faster.
      const newSpeed = target.speed * (target.speed / player.speed);

      // Snap position behind the target
      // position (camera Z) = target.z - player.relativeZ
      // We use Util.increase to handle track wrapping math safely
      const newPosition = Util.increase(target.z, -player.relativeZ, trackLength);

      return {
        speed: newSpeed,
        position: newPosition
      };
    }

    return null;
  }
};
