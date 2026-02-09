import { WebSocketServer } from 'ws';
import { Client } from './Client.mjs';
import { Room } from './Room.mjs';
import { MSG } from '../constants.mjs';

export class Lobby {
  constructor(port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.rooms = new Map();
    this.clients = new Map();

    // Create a default room for now
    this.createRoom('default');

    this.wss.on('connection', (ws) => this.handleConnection(ws));

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

    ws.on('message', (data) => {
      if (!client.rateLimit(20)) {
        // 20 msg/sec limit
        // console.warn(`Client ${client.id} exceeded rate limit.`);
        return;
      }

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
      this.broadcastRoomList();
    });

    // Send room list to new client
    client.send(MSG.ROOM_LIST, { rooms: this.getRoomList() });
  }

  handleMessage(client, message) {
    if (message.type === MSG.JOIN) {
      this.joinRoom(client, message.roomId, message.spriteIndex, message.name);
    } else if (client.room) {
      client.room.handleMessage(client, message);
    }
  }

  joinRoom(client, roomId, spriteIndex, name) {
    if (client.room) {
      client.room.remove(client);
    }

    // Create room if it doesn't exist (auto-create)
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    client.state.spriteIndex = spriteIndex || 0;
    client.state.name = name || 'Anonymous';
    room.add(client);

    this.broadcastRoomList();
  }

  getRoomList() {
    const list = [];
    for (const [id, room] of this.rooms) {
      // Only show rooms that have players, or 'default'
      if (room.clients.size > 0 || id === 'default') {
        list.push({ id, count: room.clients.size });
      }
    }
    return list;
  }

  broadcastRoomList() {
    const rooms = this.getRoomList();
    for (const client of this.clients.values()) {
      client.send(MSG.ROOM_LIST, { rooms });
    }
  }
}
