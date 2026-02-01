import { MSG, GAME_CONFIG, RACE_STATE } from '../constants.mjs';

export class Room {
  constructor(id) {
    this.id = id;
    this.clients = new Set();
    this.state = RACE_STATE.WAITING;
    this.countdownTimer = null;
    this.seed = Math.floor(Math.random() * 2147483647);
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
      state: this.state,
      seed: this.seed,
      players: players
    });

    // 4. Notify others of new player
    this.broadcast(client, MSG.PLAYER_JOIN, {
      id: client.id,
      spriteIndex: client.state.spriteIndex,
      name: client.state.name
    });

    this.checkAutoStart();
  }

  remove(client) {
    this.clients.delete(client);
    client.room = null;
    this.broadcast(null, MSG.PLAYER_LEAVE, { id: client.id });
    this.checkAutoStart();
  }

  checkAutoStart() {
    if (this.state === RACE_STATE.WAITING && this.clients.size >= 2) {
      this.setState(RACE_STATE.COUNTDOWN);
    } else if (this.state === RACE_STATE.COUNTDOWN && this.clients.size < 2) {
      this.setState(RACE_STATE.WAITING);
    } else if (this.state === RACE_STATE.RACING && this.clients.size < 2) {
      this.setState(RACE_STATE.WAITING);
    }
  }

  setState(newState) {
    if (this.state === newState) return;

    // Cleanup old state
    if (this.state === RACE_STATE.COUNTDOWN) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.state = newState;
    // Broadcast to ALL clients (including sender if any)
    this.broadcast(null, MSG.STATE_UPDATE, { state: this.state });

    // Handle new state
    if (this.state === RACE_STATE.COUNTDOWN) {
      this.countdownTimer = setTimeout(() => {
        this.setState(RACE_STATE.RACING);
      }, 3000);
    }
  }

  handleMessage(client, message) {
    if (message.type === MSG.UPDATE) {
      let speed = message.speed ?? client.state.speed;
      let x = message.x ?? client.state.x;
      let z = message.z ?? client.state.z;
      let corrected = false;

      // Validate Speed
      if (Math.abs(speed) > GAME_CONFIG.maxSpeed * 1.1) {
        speed = (speed > 0) ? GAME_CONFIG.maxSpeed : -GAME_CONFIG.maxSpeed;
        corrected = true;
      }

      // Validate X
      if (Math.abs(x) > 3) {
        x = (x > 0) ? 3 : -3;
        corrected = true;
      }

      // Update state
      client.state.x = x;
      client.state.z = z;
      client.state.speed = speed;

      if (corrected) {
        // Send Correction to Sender (Authoritative)
        client.send(MSG.UPDATE, {
           id: client.id,
           x: client.state.x,
           z: client.state.z,
           speed: client.state.speed
        });
      }

      // Broadcast to others
      this.broadcast(client, MSG.UPDATE, {
        id: client.id,
        x: client.state.x,
        z: client.state.z,
        speed: client.state.speed
      });
    } else if (message.type === MSG.PING) {
      client.send(MSG.PONG, {
        clientTime: message.timestamp,
        serverTime: Date.now()
      });
    } else if (message.type === MSG.CHAT) {
      if (!message.message || typeof message.message !== 'string' || message.message.length > 140) {
        return; // Ignore invalid/too long messages
      }
      // Broadcast to ALL (including sender) to ensure ordering
      this.broadcast(null, MSG.CHAT, {
        id: client.id,
        name: client.state.name,
        message: message.message
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
