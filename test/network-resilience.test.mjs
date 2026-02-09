import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NetworkManager } from '../network-manager.mjs';

// Capture instances
let instances = [];

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN immediately for simplicity
    this.sentMessages = [];
    instances.push(this);
  }

  send(data) {
    this.sentMessages.push({ time: Date.now(), data });
  }

  addEventListener(type, callback) {
    if (type === 'message') this.onmessage = callback;
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

global.WebSocket = MockWebSocket;

describe('NetworkManager Resilience', () => {
  it('should delay outgoing messages', async () => {
    instances = [];
    const manager = new NetworkManager({});
    manager.connect('ws://localhost:8080');

    const ws = instances[0];
    manager.simulatedLatency = 50;

    const start = Date.now();
    manager.send('TEST', { val: 1 });

    // Should not have sent yet
    assert.strictEqual(ws.sentMessages.length, 0, 'Message should be delayed');

    // Wait
    await new Promise((r) => setTimeout(r, 100));

    assert.strictEqual(ws.sentMessages.length, 1, 'Message should be sent');
    const msg = ws.sentMessages[0];
    // Allow small margin for execution time
    assert.ok(
      msg.time - start >= 45,
      `Delay was ${msg.time - start}ms, expected ~50ms`
    );
  });

  it('should inject smoothing factor into remote players', () => {
    const manager = new NetworkManager({});
    // Manually add a remote player
    manager._addRemotePlayer('p1', { name: 'Bot', x: 0, z: 0, spriteIndex: 0 });
    const player = manager.remotePlayers['p1'];

    manager.smoothing = 25;
    manager.update(0.1, 1000);

    // Check if smoothing property was updated on the player
    assert.strictEqual(player.smoothing, 25);
  });
});
