/* global global */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTweakUI } from '../tweak-ui.mjs';

// Mock Globals required by tweak-ui.mjs
global.Util = {
  limit: (v) => v,
  toInt: (v) => parseInt(v, 10)
};

test('setupTweakUI attaches input listeners for live updates', () => {
  const listeners = [];
  global.Dom = {
    on: (id, event, fn) => {
      listeners.push({ id, event, fn });
    },
    blur: () => {},
    get: () => ({ value: 0, options: [] })
  };

  setupTweakUI({ reset: () => {} });

  const rangeInputs = ['roadWidth', 'cameraHeight', 'drawDistance', 'fieldOfView', 'fogDensity'];

  for (const id of rangeInputs) {
    const inputListener = listeners.find(l => l.id === id && l.event === 'input');
    // We also expect change listener for blur
    const changeListener = listeners.find(l => l.id === id && l.event === 'change');

    assert.ok(inputListener, `Should have input listener for ${id} (live update)`);
    assert.ok(changeListener, `Should have change listener for ${id} (blur)`);
  }
});
