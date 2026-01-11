
/* global URL */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../common.js', import.meta.url), 'utf8');

test('Game.setKeyListener ignores input fields', () => {
    let listeners = {};
    const documentMock = {
        getElementById: () => ({ addEventListener: () => {} }),
        addEventListener: (type, fn) => { listeners[type] = fn; },
        removeEventListener: () => {},
    };
    const windowMock = {
        localStorage: {},
        requestAnimationFrame: () => {},
        setTimeout: () => {},
    };

    const context = {
        document: documentMock,
        window: windowMock,
        HTMLElement: class {},
        Stats: class { constructor() { this.domElement = {}; } },
        setInterval: () => {},
    };

    vm.createContext(context);
    vm.runInContext(code, context);

    const { Game, KEY } = context;

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

    // Test 2: Keydown on INPUT should NOT trigger action (This is what we want to implement)
    actionCalled = false;
    listeners['keydown']({
        keyCode: KEY.UP,
        target: { tagName: 'INPUT' }
    });

    assert.equal(actionCalled, false, 'Action should NOT be called when target is INPUT');
});
