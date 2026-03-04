import { Util } from './util.mjs';

export class RemotePlayer {
  constructor(id, data) {
    this.id = id;
    this.name = data.name || 'Unknown';
    this.sprite = data.sprite; // Expects the sprite object from SPRITES

    // Current State (Visible)
    this.x = data.x || 0;
    this.z = data.z || 0;
    this.speed = data.speed || 0;

    // Target State (Authoritative from Server)
    this.target = {
      x: data.x || 0,
      z: data.z || 0,
      speed: data.speed || 0
    };

    // Rendering helpers
    this.offset = 0;
    this.percent = 0;

    // Tweakable physics
    this.smoothing = 10;
  }

  /**
   * Syncs the player state with a network update.
   * @param {Object} data - { x, z, speed }
   */
  sync(data) {
    if (data.x !== undefined) this.target.x = data.x;
    if (data.z !== undefined) this.target.z = data.z;
    if (data.speed !== undefined) this.target.speed = data.speed;
  }

  /**
   * Updates the player position using Dead Reckoning + Interpolation.
   * @param {number} dt - Time delta in seconds
   * @param {number} trackLength - Total length of the track for wrapping
   */
  update(dt, trackLength) {
    const smoothing = this.smoothing * dt; // Uses dynamic smoothing factor

    // 1. Interpolate lateral position and speed
    this.x = Util.interpolate(this.x, this.target.x, smoothing);
    this.speed = Util.interpolate(this.speed, this.target.speed, smoothing);

    // 2. Dead Reckoning: Project Z forward based on current speed
    // This reduces the visual "lag" behind the real-time position.
    this.z = Util.increase(this.z, dt * this.speed, trackLength);

    // 3. Correction: Softly blend towards the server target
    // Handle Z wrapping (Finish Line) to prevent driving backwards to meet target
    if (trackLength && Math.abs(this.target.z - this.z) > trackLength / 2) {
      // If we are on opposite sides of the finish line, snap to target
      // (or we could implement smart wrapping logic, but snapping is safer for big jumps)
      this.z = this.target.z;
    } else {
      this.z = Util.interpolate(this.z, this.target.z, smoothing);
    }

    // 4. Update rendering percent
    // (This requires segmentLength, but percent is derived from z usually outside)
    // We'll leave percent calculation to the main loop if it depends on segments,
    // or we can add segmentLength to params if needed.
    // v4.final.js calculates percent: Util.percentRemaining(car.z, segmentLength)
    // We won't calculate it here to avoid dependency on segmentLength unless passed.
  }
}
