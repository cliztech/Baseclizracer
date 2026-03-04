import { WebSocket } from 'ws';
import assert from 'assert';
import { spawn } from 'child_process';
import { MSG, GAME_CONFIG } from '../constants.mjs';

const PORT = 8083;
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

  await new Promise(r => setTimeout(r, 1000));

  try {
    const clientA = await createClient();

    // Verify Seed in WELCOME
    const welcomePromise = waitForMessage(clientA, MSG.WELCOME);
    clientA.send(JSON.stringify({ type: MSG.JOIN, roomId: 'val', name: 'A' }));
    const welcomeMsg = await welcomePromise;
    assert.ok(welcomeMsg.seed, 'Welcome message should contain a seed');
    console.log('Seed received:', welcomeMsg.seed);

    await new Promise(r => setTimeout(r, 200));

    const clientB = await createClient();
    clientB.send(JSON.stringify({ type: MSG.JOIN, roomId: 'val', name: 'B' }));
    await waitForMessage(clientA, MSG.PLAYER_JOIN);

    // Test 1: Invalid Speed (Correction)
    console.log('Sending invalid speed...');
    clientB.send(JSON.stringify({ type: MSG.UPDATE, speed: GAME_CONFIG.maxSpeed * 2 }));

    // Check A receives Clamped UPDATE.
    let msg = await waitForMessage(clientA, MSG.UPDATE);
    assert.strictEqual(msg.speed, GAME_CONFIG.maxSpeed, 'Speed should be clamped to maxSpeed');
    console.log('Invalid speed corrected and broadcast.');

    // Test 2: Valid Speed
    console.log('Sending valid speed...');
    clientB.send(JSON.stringify({ type: MSG.UPDATE, speed: GAME_CONFIG.maxSpeed * 0.5 }));
    msg = await waitForMessage(clientA, MSG.UPDATE);
    assert.strictEqual(msg.speed, GAME_CONFIG.maxSpeed * 0.5);
    console.log('Valid speed accepted.');

    console.log('VALIDATION TEST PASSED');

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

runTest();
