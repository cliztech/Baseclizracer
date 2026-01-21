import { WebSocket } from 'ws';
import assert from 'assert';
import { spawn } from 'child_process';

const PORT = 8080;
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
  const serverProcess = spawn('node', ['server/index.mjs'], { stdio: 'inherit' });

  // Give server time to start
  await new Promise(r => setTimeout(r, 1000));

  try {
    console.log('Connecting Client A...');
    const clientA = await createClient('A');

    console.log('Client A joining room "race1"...');
    clientA.send(JSON.stringify({ type: 'JOIN', roomId: 'race1', spriteIndex: 0, name: 'Maverick' }));

    // Give A time to switch rooms
    await new Promise(r => setTimeout(r, 200));

    console.log('Connecting Client B...');
    const clientB = await createClient('B');
    // Client B auto-joins 'default'. A is in 'race1'. A sees nothing.

    console.log('Client B joining room "race1"...');
    clientB.send(JSON.stringify({ type: 'JOIN', roomId: 'race1', spriteIndex: 1, name: 'Goose' }));

    // Client A should see Client B join
    console.log('Waiting for Client A to see Client B join...');
    const joinMsg = await waitForMessage(clientA, 'PLAYER_JOIN');
    console.log('Client A received PLAYER_JOIN:', joinMsg);
    assert.strictEqual(joinMsg.spriteIndex, 1);
    assert.strictEqual(joinMsg.name, 'Goose');

    // Client B sends update
    console.log('Client B sending UPDATE...');
    const updateData = { type: 'UPDATE', x: 0.5, z: 100, speed: 50 };
    clientB.send(JSON.stringify(updateData));

    // Client A should receive update
    console.log('Waiting for Client A to receive UPDATE...');
    const updateMsg = await waitForMessage(clientA, 'UPDATE');
    console.log('Client A received UPDATE:', updateMsg);
    assert.strictEqual(updateMsg.x, 0.5);
    assert.strictEqual(updateMsg.speed, 50);

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
