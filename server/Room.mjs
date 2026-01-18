export class Room {
  constructor(id) {
    this.id = id;
    this.clients = new Set();
  }

  add(client) {
    this.clients.add(client);
    client.room = this;
    // Notify others
    this.broadcast(client, 'PLAYER_JOIN', { id: client.id });
  }

  remove(client) {
    this.clients.delete(client);
    client.room = null;
    this.broadcast(null, 'PLAYER_LEAVE', { id: client.id });
  }

  broadcast(sender, type, payload) {
    for (const client of this.clients) {
      if (client !== sender) {
        client.send(type, payload);
      }
    }
  }
}
