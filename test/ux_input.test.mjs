
import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock DOM environment
global.HTMLElement = class {};
global.document = {
  getElementById: () => ({ style: {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.window = {};

describe('Game Input UX', async () => {
  const { Game } = await import('../game.mjs');
  const { KEY } = await import('../constants.mjs');

  it('should prevent default scrolling behavior for game keys', () => {
    let keydownHandler;

    global.document.addEventListener = (type, handler) => {
       if (type === 'keydown') keydownHandler = handler;
    };

    const keys = [
      { keys: [KEY.UP], mode: 'down', action: () => {} }
    ];

    Game.setKeyListener(keys);

    assert.ok(keydownHandler, 'Keydown handler should be attached');

    let preventDefaultCalled = 0;
    const event = {
      keyCode: KEY.UP,
      target: { tagName: 'BODY' },
      preventDefault: () => { preventDefaultCalled++; },
      ctrlKey: false,
      metaKey: false,
      altKey: false
    };

    keydownHandler(event);

    assert.strictEqual(preventDefaultCalled, 1, 'preventDefault should be called for game keys');
  });

  it('should NOT prevent default for modifier keys', () => {
    let keydownHandler;

    global.document.addEventListener = (type, handler) => {
       if (type === 'keydown') keydownHandler = handler;
    };

    const keys = [
      { keys: [KEY.UP], mode: 'down', action: () => {} }
    ];

    Game.setKeyListener(keys);

    let preventDefaultCalled = 0;
    const event = {
      keyCode: KEY.UP,
      target: { tagName: 'BODY' },
      preventDefault: () => { preventDefaultCalled++; },
      ctrlKey: true, // Modifier pressed
      metaKey: false,
      altKey: false
    };

    keydownHandler(event);

    assert.strictEqual(preventDefaultCalled, 0, 'preventDefault should NOT be called when Ctrl is pressed');
  });

  it('should NOT prevent default for non-game keys', () => {
    let keydownHandler;

    global.document.addEventListener = (type, handler) => {
       if (type === 'keydown') keydownHandler = handler;
    };

    const keys = [
      { keys: [KEY.UP], mode: 'down', action: () => {} }
    ];

    Game.setKeyListener(keys);

    let preventDefaultCalled = 0;
    const event = {
      keyCode: 999, // Random key
      target: { tagName: 'BODY' },
      preventDefault: () => { preventDefaultCalled++; },
      ctrlKey: false,
      metaKey: false,
      altKey: false
    };

    keydownHandler(event);

    assert.strictEqual(preventDefaultCalled, 0, 'preventDefault should NOT be called for non-game keys');
  });
});
