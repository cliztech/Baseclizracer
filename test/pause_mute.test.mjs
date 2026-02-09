import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('Game Pause and Mute UX', async () => {
  // Set up globals before importing modules
  global.HTMLElement = class {
    constructor() {
      this.style = {};
      this.className = '';
      this.classList = { add: () => {}, remove: () => {} };
    }
    addEventListener() {}
    appendChild() {}
    setAttribute() {}
  };

  let keydownHandlers = [];
  let elements = {};

  global.document = {
    getElementById: (id) => elements[id] || null,
    createElement: (tag) => {
      const el = new global.HTMLElement();
      el.tagName = tag.toUpperCase();
      return el;
    },
    addEventListener: (type, fn) => {
      if (type === 'keydown') keydownHandlers.push(fn);
    },
    removeEventListener: () => {}
  };
  global.window = { localStorage: {} };

  const { Game } = await import('../game.mjs');

  beforeEach(() => {
    keydownHandlers = [];
    elements = {
      music: { muted: false, play: () => {}, style: {} },
      mute: new global.HTMLElement(),
      racer: new global.HTMLElement()
    };
    elements['mute'].id = 'mute';
    elements['racer'].id = 'racer';

    // Mock appendChild to track elements
    elements['racer'].appendChild = (child) => {
      if (child.id) elements[child.id] = child;
    };

    // Reset Game state
    Game.paused = false;
  });

  it('Game.togglePause should toggle paused state and DOM', () => {
    assert.strictEqual(Game.paused, false);

    // 1. Pause
    Game.togglePause();
    assert.strictEqual(Game.paused, true);

    const pausedEl = elements['paused'];
    assert.ok(pausedEl, 'Paused element should be created');
    assert.strictEqual(pausedEl.innerHTML, 'PAUSED');
    assert.strictEqual(pausedEl.style.display, 'block');

    // 2. Unpause
    Game.togglePause();
    assert.strictEqual(Game.paused, false);
    assert.strictEqual(pausedEl.style.display, 'none');
  });
});
