import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock DOM environment
global.HTMLElement = class {};
class MockElement {
  constructor(tagOrId) {
    this.id = tagOrId;
    this.tagName = (tagOrId || 'div').toUpperCase();
    this.style = {};
    this.classList = {
      add: (cls) => {},
      remove: (cls) => {},
      contains: (cls) => false,
    };
    this.className = '';
    this.innerHTML = '';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.value = '';
    this.tabIndex = -1;
  }

  appendChild(child) {
    this.children.push(child);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(type, fn) {
    this.listeners[type] = fn;
  }

  trigger(type, event) {
    if (this.listeners[type]) {
      this.listeners[type](event);
    }
    if (this['on' + type]) {
      this['on' + type](event);
    }
  }
}

global.document = {
  getElementById: (id) => {
    if (!global.mocks[id]) {
        global.mocks[id] = new MockElement(id);
    }
    return global.mocks[id];
  },
  createElement: (tag) => {
    return new MockElement(tag);
  },
};
global.window = {};

// Global store for mocks to verify
global.mocks = {};

describe('Lobby UX', async () => {
  const { renderRoomList } = await import('../lobby-ui.mjs');

  it('should render room list with accessible attributes', () => {
    const rooms = [
      { id: 'room1', count: 2 },
      { id: 'room2', count: 0 }
    ];

    // Mock the list container
    global.mocks['room_list'] = new MockElement('ul');

    renderRoomList(rooms);

    const list = global.mocks['room_list'];
    assert.strictEqual(list.children.length, 2);

    const li1 = list.children[0];
    assert.strictEqual(li1.tagName, 'LI');
    assert.strictEqual(li1.tabIndex, 0, 'Should be focusable');
    assert.strictEqual(li1.getAttribute('role'), 'button', 'Should have button role');
    assert.strictEqual(li1.getAttribute('aria-label'), 'Join room room1, 2 players');
  });

  it('should select room on click', () => {
    const rooms = [{ id: 'room1', count: 2 }];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input'); // The input field

    renderRoomList(rooms);
    const li = global.mocks['room_list'].children[0];

    li.trigger('click');

    assert.strictEqual(global.mocks['input_room'].value, 'room1');
  });

  it('should select room on Enter key', () => {
    const rooms = [{ id: 'room1', count: 2 }];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input');

    renderRoomList(rooms);
    const li = global.mocks['room_list'].children[0];

    let prevented = false;
    const event = {
      key: 'Enter',
      preventDefault: () => { prevented = true; }
    };

    li.trigger('keydown', event);

    assert.ok(prevented, 'Should prevent default on Enter');
    assert.strictEqual(global.mocks['input_room'].value, 'room1');
  });

  it('should select room on Space key', () => {
    const rooms = [{ id: 'room1', count: 2 }];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input');

    renderRoomList(rooms);
    const li = global.mocks['room_list'].children[0];

    let prevented = false;
    const event = {
      key: ' ',
      preventDefault: () => { prevented = true; }
    };

    li.trigger('keydown', event);

    assert.ok(prevented, 'Should prevent default on Space');
    assert.strictEqual(global.mocks['input_room'].value, 'room1');
  });

    it('should NOT select room on other keys', () => {
    const rooms = [{ id: 'room1', count: 2 }];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input');
    global.mocks['input_room'].value = 'original';

    renderRoomList(rooms);
    const li = global.mocks['room_list'].children[0];

    let prevented = false;
    const event = {
      key: 'ArrowDown',
      preventDefault: () => { prevented = true; }
    };

    li.trigger('keydown', event);

    assert.strictEqual(prevented, false, 'Should NOT prevent default on other keys');
    assert.strictEqual(global.mocks['input_room'].value, 'original', 'Should NOT change value');
  });
});
