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
    client.send('WELCOME', {
      id: client.id,
      room: this.id,
      players: players
    });

    // 4. Notify others of new player
    this.broadcast(client, 'PLAYER_JOIN', {
      id: client.id,
      spriteIndex: client.state.spriteIndex
    });
  }

  remove(client) {
    this.clients.delete(client);
    client.room = null;
    this.broadcast(null, 'PLAYER_LEAVE', { id: client.id });
  }

  handleMessage(client, message) {
    if (message.type === 'UPDATE') {
      // Update state
      client.state.x = message.x ?? client.state.x;
      client.state.z = message.z ?? client.state.z;
      client.state.speed = message.speed ?? client.state.speed;

      // Broadcast to others
      this.broadcast(client, 'UPDATE', {
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
