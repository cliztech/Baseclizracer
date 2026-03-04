import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock DOM environment
global.HTMLElement = class {};
class MockElement {
  constructor(tagOrId) {
    this.id = tagOrId;
    this.tagName = (tagOrId || 'div').toUpperCase();
    this.style = {};
    this._classes = new Set();
    this.classList = {
      add: (cls) => { this._classes.add(cls); this.className = Array.from(this._classes).join(' '); },
      remove: (cls) => { this._classes.delete(cls); this.className = Array.from(this._classes).join(' '); },
      contains: (cls) => this._classes.has(cls),
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

  removeAttribute(name) {
    delete this.attributes[name];
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

  it('should visually select room matching input value on render', () => {
    const rooms = [
      { id: 'room1', count: 2 },
      { id: 'room2', count: 0 }
    ];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input');
    global.mocks['input_room'].value = 'room1'; // Pre-selected

    renderRoomList(rooms);

    const list = global.mocks['room_list'];
    const li1 = list.children[0];
    const li2 = list.children[1];

    assert.ok(li1.classList.contains('selected'), 'Matching room should have selected class');
    assert.strictEqual(li1.getAttribute('aria-current'), 'true', 'Matching room should have aria-current');

    assert.strictEqual(li2.classList.contains('selected'), false, 'Non-matching room should NOT have selected class');
    assert.strictEqual(li2.getAttribute('aria-current'), undefined, 'Non-matching room should NOT have aria-current');
  });

  it('should update visual selection on click', () => {
    const rooms = [
      { id: 'room1', count: 2 },
      { id: 'room2', count: 0 }
    ];
    global.mocks['room_list'] = new MockElement('ul');
    global.mocks['input_room'] = new MockElement('input');
    global.mocks['input_room'].value = 'room1';

    renderRoomList(rooms);

    const list = global.mocks['room_list'];
    const li1 = list.children[0];
    const li2 = list.children[1];

    // Initial state check
    assert.ok(li1.classList.contains('selected'));
    assert.strictEqual(li1.getAttribute('aria-current'), 'true');

    // Click second room
    li2.trigger('click');

    // Verify update
    assert.strictEqual(li1.classList.contains('selected'), false, 'Old selection should be removed');
    assert.strictEqual(li1.getAttribute('aria-current'), undefined, 'Old aria-current should be removed');

    assert.ok(li2.classList.contains('selected'), 'New selection should be added');
    assert.strictEqual(li2.getAttribute('aria-current'), 'true', 'New aria-current should be added');
    assert.strictEqual(global.mocks['input_room'].value, 'room2', 'Input value should update');
  });

  it('should render empty state when no rooms are available', () => {
    const rooms = [];
    global.mocks['room_list'] = new MockElement('ul');

    renderRoomList(rooms);

    const list = global.mocks['room_list'];
    assert.strictEqual(list.children.length, 1);

    const li = list.children[0];
    assert.strictEqual(li.tagName, 'LI');
    assert.ok(li.classList.contains('empty-state'), 'Should have empty-state class');
    assert.strictEqual(li.innerHTML, 'No signals detected...');
  });
});
