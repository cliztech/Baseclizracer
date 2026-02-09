import { WebSocket } from 'ws';
import assert from 'assert';
import { spawn } from 'child_process';
import { MSG } from '../constants.mjs';

const PORT = 8083; // Use different port to avoid conflicts
const URL = `ws://localhost:${PORT}`;

function createClient() {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    ws.on('open', () => resolve(ws));
  });
}

function waitForMessage(ws, type) {
  return new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.type === type) {
        ws.off('message', handler);
        resolve(msg);
      }
    };
    ws.on('message', handler);
  });
}

async function runTest() {
  console.log('Starting server...');
  const serverProcess = spawn('node', ['server/index.mjs'], {
    stdio: 'inherit',
    env: { ...process.env, PORT }
  });

  // Give server time to start
  await new Promise((r) => setTimeout(r, 1000));

  try {
    console.log('Connecting Client A...');
    const clientA = await createClient();

    console.log('Client A joining room "race1"...');
    clientA.send(
      JSON.stringify({
        type: MSG.JOIN,
        roomId: 'race1',
        spriteIndex: 0,
        name: 'Maverick'
      })
    );

    // Give A time to switch rooms
    await new Promise((r) => setTimeout(r, 200));

    console.log('Connecting Client B...');
    const clientB = await createClient();

    console.log('Client B joining room "race1"...');
    clientB.send(
      JSON.stringify({
        type: MSG.JOIN,
        roomId: 'race1',
        spriteIndex: 1,
        name: 'Goose'
      })
    );

    // Client A should see Client B join
    console.log('Waiting for Client A to see Client B join...');
    const joinMsg = await waitForMessage(clientA, MSG.PLAYER_JOIN);
    console.log('Client A received PLAYER_JOIN:', joinMsg);
    assert.strictEqual(joinMsg.spriteIndex, 1);
    assert.strictEqual(joinMsg.name, 'Goose');

    // === CHAT TEST ===
    console.log('Client A sending CHAT...');
    const chatMsg = 'Talk to me, Goose.';
    clientA.send(JSON.stringify({ type: MSG.CHAT, message: chatMsg }));

    console.log('Waiting for Client B to receive CHAT...');
    const receivedChat = await waitForMessage(clientB, MSG.CHAT);
    console.log('Client B received CHAT:', receivedChat);
    assert.strictEqual(receivedChat.message, chatMsg);
    assert.strictEqual(receivedChat.name, 'Maverick');

    // === PING TEST ===
    console.log('Client A sending PING...');
    const now = Date.now();
    clientA.send(JSON.stringify({ type: MSG.PING, timestamp: now }));

    console.log('Waiting for Client A to receive PONG...');
    const pongMsg = await waitForMessage(clientA, MSG.PONG);
    console.log('Client A received PONG:', pongMsg);
    assert.strictEqual(pongMsg.clientTime, now);
    assert.ok(pongMsg.serverTime >= now);

    console.log('TEST PASSED');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

runTest();
