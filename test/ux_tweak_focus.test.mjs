import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTweakUI } from '../tweak-ui.mjs';

test('tweak UI should not blur on change', () => {
  let blurCalled = false;
  const handlers = {};

  const mockDom = {
    get: (id) => ({
      value: 1000,
      getAttribute: () => 1000,
      selectedIndex: 0,
      options: [{ value: 'high' }],
      blur: () => {
        blurCalled = true;
      }
    }),
    on: (id, event, handler) => {
      if (!handlers[id]) handlers[id] = {};
      handlers[id][event] = handler;
    },
    blur: (ev) => {
      blurCalled = true;
    }
  };

  const mockUtil = {
    limit: (v) => v,
    toInt: (v) => parseInt(v, 10)
  };

  const callbacks = { reset: () => {} };

  setupTweakUI(callbacks, { Dom: mockDom, Util: mockUtil });

  // Test 'lanes' (SELECT element, uses 'change')
  const evLanes = {
    target: {
      options: [{ value: '3' }],
      selectedIndex: 0,
      blur: () => {
        blurCalled = true;
      }
    }
  };

  if (handlers['lanes'] && handlers['lanes']['change']) {
    handlers['lanes']['change'](evLanes);
    assert.equal(
      blurCalled,
      false,
      'Dom.blur should not be called on lanes change'
    );
  } else {
    throw new Error('Change handler not registered for lanes');
  }

  // Test 'roadWidth' (INPUT range, should NOT have change handler or should not blur)
  // In my implementation, I removed the change handler for roadWidth entirely.
  if (handlers['roadWidth'] && handlers['roadWidth']['change']) {
    const evRoad = {
      target: {
        blur: () => {
          blurCalled = true;
        }
      }
    };
    handlers['roadWidth']['change'](evRoad);
    assert.equal(
      blurCalled,
      false,
      'Dom.blur should not be called on roadWidth change'
    );
  } else {
    // If no handler, then obviously no blur happens on change event via our code.
    assert.ok(true, 'No change handler for roadWidth, implicitly safe');
  }
});
