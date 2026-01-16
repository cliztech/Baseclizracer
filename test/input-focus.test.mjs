import test from 'node:test';
import assert from 'node:assert/strict';

// Mock globals before importing Game (which imports Dom)
global.HTMLElement = class {};
global.document = {
  getElementById: () => ({ addEventListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.window = {}; // For Util

import { Game } from '../game.mjs';
import { KEY } from '../constants.mjs';

test('Game.setKeyListener ignores input fields', () => {
    let listeners = {};

    // Update global.document behavior for this test to capture listeners
    global.document.addEventListener = (type, fn) => { listeners[type] = fn; };

    let actionCalled = false;
    const keys = [
        { keys: [KEY.UP], mode: 'down', action: () => { actionCalled = true; } }
    ];

    Game.setKeyListener(keys);

    // Test 1: Keydown on body should trigger action
    actionCalled = false;
    listeners['keydown']({
        keyCode: KEY.UP,
        target: { tagName: 'BODY' }
    });
    assert.equal(actionCalled, true, 'Action should be called when target is BODY');

    // Test 2: Keydown on INPUT should NOT trigger action
    actionCalled = false;
    listeners['keydown']({
        keyCode: KEY.UP,
        target: { tagName: 'INPUT' }
    });

    assert.equal(actionCalled, false, 'Action should NOT be called when target is INPUT');
});
