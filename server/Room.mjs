import { MSG, GAME_CONFIG } from '../constants.mjs';

export class Room {
  constructor(id) {
    this.id = id;
    this.clients = new Set();
  }

  add(client) {
    // 1. Gather existing players state
    const players = [];
    for (const c of this.clients) {
      players.push({
        id: c.id,
        ...c.state
      });
    }

    // 2. Add new client
    this.clients.add(client);
    client.room = this;

    // 3. Send WELCOME to new client
    client.send(MSG.WELCOME, {
      id: client.id,
      room: this.id,
      players: players
    });

    // 4. Notify others of new player
    this.broadcast(client, MSG.PLAYER_JOIN, {
      id: client.id,
      spriteIndex: client.state.spriteIndex,
      name: client.state.name
    });
  }

  remove(client) {
    this.clients.delete(client);
    client.room = null;
    this.broadcast(null, MSG.PLAYER_LEAVE, { id: client.id });
  }

  handleMessage(client, message) {
    if (message.type === MSG.UPDATE) {
      // Validate Speed
      const speed = message.speed ?? client.state.speed;
      if (Math.abs(speed) > GAME_CONFIG.maxSpeed * 1.1) {
        return; // Ignore invalid speed
      }

      // Validate X
      const x = message.x ?? client.state.x;
      if (Math.abs(x) > 3) {
        return; // Ignore invalid X
      }

      // Update state
      client.state.x = x;
      client.state.z = message.z ?? client.state.z;
      client.state.speed = speed;

      // Broadcast to others
      this.broadcast(client, MSG.UPDATE, {
        id: client.id,
        x: client.state.x,
        z: client.state.z,
        speed: client.state.speed
      });
    }
  }

  broadcast(sender, type, payload) {
    for (const client of this.clients) {
      if (client !== sender) {
        client.send(type, payload);
      }
    }
  }
}
