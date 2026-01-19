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
  }

  send(type, payload = {}) {
    if (this.socket.readyState === 1) { // WebSocket.OPEN
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }
}
