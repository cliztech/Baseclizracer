import { WebSocket } from 'ws';
import assert from 'assert';
import { spawn } from 'child_process';
import { MSG, RACE_STATE } from '../constants.mjs';

const PORT = 8084; // Unique port for this test
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

function waitForState(ws, targetState) {
  return new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.type === MSG.STATE_UPDATE && msg.state === targetState) {
        ws.off('message', handler);
        resolve(msg);
      } else if (msg.type === MSG.WELCOME && msg.state === targetState) {
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
  await new Promise(r => setTimeout(r, 1000));

  try {
    console.log('Connecting Client A (Winner)...');
    const clientA = await createClient();

    console.log('Connecting Client B (Runner-up)...');
    const clientB = await createClient();

    // Join Room
    clientA.send(JSON.stringify({ type: MSG.JOIN, roomId: 'finish_test', name: 'Winner' }));
    clientB.send(JSON.stringify({ type: MSG.JOIN, roomId: 'finish_test', name: 'Loser' }));

    console.log('Waiting for Race Start (COUNTDOWN -> RACING)...');
    // Expect COUNTDOWN
    await waitForState(clientA, RACE_STATE.COUNTDOWN);
    console.log('State is COUNTDOWN. Waiting 3s for RACING...');

    // Expect RACING
    await waitForState(clientA, RACE_STATE.RACING);
    console.log('State is RACING. GO!');

    // Simulate Race
    await new Promise(r => setTimeout(r, 100));

    // Client A Finishes
    console.log('Client A sending FINISH (Time: 100.0)...');
    clientA.send(JSON.stringify({ type: MSG.FINISH, time: 100.0 }));

    // Verify Broadcast
    const finishA = await waitForMessage(clientB, MSG.PLAYER_FINISHED);
    console.log('Client B received Client A finish:', finishA);
    assert.strictEqual(finishA.rank, 1);
    assert.strictEqual(finishA.time, 100.0);

    // Client B Finishes
    console.log('Client B sending FINISH (Time: 105.0)...');
    clientB.send(JSON.stringify({ type: MSG.FINISH, time: 105.0 }));

    // Verify Broadcast
    const finishB = await waitForMessage(clientA, MSG.PLAYER_FINISHED);
    console.log('Client A received Client B finish:', finishB);
    assert.strictEqual(finishB.rank, 2);
    assert.strictEqual(finishB.time, 105.0);

    console.log('All finished. Waiting 10s for Reset...');

    // We expect STATE_UPDATE -> WAITING
    // We increase timeout of the promise since it takes 10s
    const resetMsg = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for reset')), 12000);
        const handler = (data) => {
            const msg = JSON.parse(data);
            if (msg.type === MSG.STATE_UPDATE && msg.state === RACE_STATE.WAITING) {
                clearTimeout(timeout);
                clientA.off('message', handler);
                resolve(msg);
            }
        };
        clientA.on('message', handler);
    });

    console.log('Received STATE_UPDATE: WAITING. Race Cycle Complete.');

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

runTest();
