import { randomUUID } from 'crypto';

export class Client {
  constructor(socket) {
    this.socket = socket;
    this.id = randomUUID();
    this.room = null;
    this.state = {
      x: 0,
      z: 0,
      speed: 0,
      spriteIndex: 0
    };

    // Rate Limiting
    this.lastMessageTime = 0;
    this.messageCount = 0;
  }

  rateLimit(limitPerSecond) {
    const now = Date.now();
    if (now - this.lastMessageTime > 1000) {
      this.lastMessageTime = now;
      this.messageCount = 0;
    }
    this.messageCount++;
    return this.messageCount <= limitPerSecond;
  }

  send(type, payload = {}) {
    if (this.socket.readyState === 1) { // WebSocket.OPEN
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }
}
