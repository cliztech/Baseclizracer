import { randomUUID } from 'crypto';

export class Client {
  constructor(socket) {
    this.socket = socket;
    this.id = randomUUID();
    this.room = null;
  }

  send(type, payload = {}) {
    if (this.socket.readyState === 1) { // WebSocket.OPEN
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }
}
