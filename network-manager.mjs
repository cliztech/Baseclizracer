import { createSocket } from './net.mjs';
import { RemotePlayer } from './remote-player.mjs';
import { SPRITES, MSG } from './constants.mjs';

/**
 * NetworkManager
 * The conductor of the multiplayer symphony.
 * Orchestrates connection, state synchronization, and resilience simulation.
 */
export class NetworkManager {
  constructor({ onRoomList, onPlayerJoin, onPlayerLeave, onChat }) {
    this.socket = null;
    this.remotePlayers = {};

    // Configuration
    this.simulatedLatency = 0; // ms
    this.smoothing = 10;       // convergence factor

    // Callbacks
    this.onRoomList = onRoomList || (() => {});
    this.onPlayerJoin = onPlayerJoin || (() => {});
    this.onPlayerLeave = onPlayerLeave || (() => {});
    this.onChat = onChat || (() => {});

    // State
    this.connected = false;
    this.timeSinceLastUpdate = 0;
    this.latency = 0; // Real network latency in ms
  }

  /**
   * Establishes the connection to the game server.
   * @param {string} url - WebSocket URL
   * @param {function} onConnect - Callback when ready
   */
  connect(url) {
    this.socket = createSocket(url, (data) => this._onMessage(data));
    this.connected = true; // Technically 'connecting', but createsocket buffers

    // Start Ping Loop (Heartbeat)
    setInterval(() => this.ping(), 2000);
  }

  /**
   * Joins a specific room.
   */
  join(roomId, name, spriteIndex) {
    this.send(MSG.JOIN, {
      roomId,
      name,
      spriteIndex
    });
  }

  /**
   * Sends a message to the server, potentially with simulated latency.
   */
  send(type, data) {
    if (!this.socket) return;

    if (this.simulatedLatency > 0) {
      setTimeout(() => {
        this.socket.send(type, data);
      }, this.simulatedLatency);
    } else {
      this.socket.send(type, data);
    }
  }

  /**
   * Broadcasts the local player's state to the room.
   * Throttled to ~10Hz to respect bandwidth.
   */
  broadcastUpdate(dt, state) {
    this.timeSinceLastUpdate += dt;
    if (this.timeSinceLastUpdate > 0.1) {
      this.send(MSG.UPDATE, state);
      this.timeSinceLastUpdate = 0;
    }
  }

  /**
   * Updates all remote players (physics/interpolation).
   */
  update(dt, trackLength) {
    for (const id in this.remotePlayers) {
      const player = this.remotePlayers[id];
      // Apply dynamic smoothing setting
      // We pass it to update, or set it on the player.
      // For now, let's assume we can modify the player's behavior or pass it here.
      // But RemotePlayer.update signature is (dt, trackLength).
      // We'll update RemotePlayer to accept options or read from a property.
      // Let's inject it.
      player.smoothing = this.smoothing;
      player.update(dt, trackLength);
    }
  }

  /**
   * Sends a ping to measure latency.
   */
  ping() {
    this.send(MSG.PING, { timestamp: Date.now() });
  }

  /**
   * Sends a chat message.
   */
  sendChat(message) {
    this.send(MSG.CHAT, { message });
  }

  /**
   * Internal message handler.
   */
  _onMessage(data) {
    // Simulate inbound latency as well for full effect
    if (this.simulatedLatency > 0) {
      setTimeout(() => this._handleDispatch(data), this.simulatedLatency);
    } else {
      this._handleDispatch(data);
    }
  }

  _handleDispatch(data) {
    switch (data.type) {
      case MSG.ROOM_LIST:
        this.onRoomList(data.rooms);
        break;
      case MSG.WELCOME:
        // Initial room population
        data.players.forEach(p => this._addRemotePlayer(p.id, p));
        break;
      case MSG.PLAYER_JOIN:
        this._addRemotePlayer(data.id, data);
        break;
      case MSG.PLAYER_LEAVE:
        if (this.remotePlayers[data.id]) {
          delete this.remotePlayers[data.id];
          this.onPlayerLeave(data.id);
        }
        break;
      case MSG.UPDATE:
        if (this.remotePlayers[data.id]) {
          this.remotePlayers[data.id].sync(data);
        }
        break;
      case MSG.PONG:
        this.latency = Math.round((Date.now() - data.clientTime) / 2);
        break;
      case MSG.CHAT:
        this.onChat(data);
        break;
    }
  }

  _addRemotePlayer(id, data) {
    if (this.remotePlayers[id]) return; // Already exists

    // Select sprite safely
    const sprite = SPRITES.CARS[(data.spriteIndex || 0) % SPRITES.CARS.length];

    const player = new RemotePlayer(id, { ...data, sprite });
    this.remotePlayers[id] = player;
    this.onPlayerJoin(id, player);
  }
}
