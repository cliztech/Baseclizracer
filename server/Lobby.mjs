import { WebSocketServer } from 'ws';
import { Client } from './Client.mjs';
import { Room } from './Room.mjs';

export class Lobby {
  constructor(port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.rooms = new Map();
    this.clients = new Map();

    // Create a default room for now
    this.createRoom('default');

    this.wss.on('connection', ws => this.handleConnection(ws));

    console.log(`Nexus Lobby running on port ${port}`);
  }

  createRoom(id) {
    if (!this.rooms.has(id)) {
      this.rooms.set(id, new Room(id));
      console.log(`Room created: ${id}`);
    }
    return this.rooms.get(id);
  }

  handleConnection(ws) {
    const client = new Client(ws);
    this.clients.set(ws, client);

    console.log(`Client connected: ${client.id}`);

    ws.on('message', data => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(client, message);
      } catch (err) {
        console.error('Invalid message format:', err);
      }
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${client.id}`);
      if (client.room) {
        client.room.remove(client);
      }
      this.clients.delete(ws);
    });

    // Auto-join default room for now (simplifies migration)
    this.rooms.get('default').add(client);
    client.send('WELCOME', { id: client.id, roomId: 'default' });
  }

  handleMessage(client, message) {
    // Protocol: { type, ...payload }
    // For now, we just broadcast everything to the room
    if (client.room) {
      // If it's a specific action, handle it. Otherwise, broadcast.
      if (message.type === 'JOIN') {
         // Handle manual join if we want multiple rooms later
      } else {
         client.room.broadcast(client, message.type, message);
      }
    }
  }
}
