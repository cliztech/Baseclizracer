import { WebSocket } from 'ws';
import assert from 'assert';
import { spawn } from 'child_process';
import { test } from 'node:test';

const PORT = 8081; // Use a different port to avoid conflicts if previous test didn't clean up fast enough?
// Actually, I can pass the port to the server script?
// server/index.mjs probably defaults to 8080.
// Let's check server/index.mjs.

const SERVER_PATH = 'server/index.mjs';

function createClient(port) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('open', () => resolve(ws));
  });
}

function waitForMessage(ws, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
        ws.off('message', handler);
        reject(new Error(`Timeout waiting for ${type}`));
    }, 2000);

    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.type === type) {
        clearTimeout(timeout);
        ws.off('message', handler);
        resolve(msg);
      }
    };
    ws.on('message', handler);
  });
}

test('Lobby Room Listing', async (t) => {
  // Hack: server/index.mjs might hardcode 8080.
  // I will check server/index.mjs first.
  // If it hardcodes, I have to use 8080.
  // I'll assume 8080 for now and kill any existing on port 8080.

  const port = 8081;

  console.log('Starting server for Lobby Test...');
  const serverProcess = spawn('node', [SERVER_PATH], {
    stdio: 'pipe',
    env: { ...process.env, PORT: port }
  });

  // Wait for server to be ready (look for stdout)
  await new Promise(resolve => {
    serverProcess.stdout.on('data', data => {
      if (data.toString().includes('Nexus Lobby running')) {
        resolve();
      }
    });
  });

  try {
    // 1. Client A connects
    const clientA = await createClient(port);

    // Should receive initial ROOM_LIST
    const listA = await waitForMessage(clientA, 'ROOM_LIST');
    assert.ok(listA.rooms.find(r => r.id === 'default' && r.count === 0), 'Should see default room empty');

    // 2. Client A joins "Room1"
    clientA.send(JSON.stringify({ type: 'JOIN', roomId: 'Room1', name: 'A' }));

    // 3. Client B connects
    // Give a small delay for A's join to process
    await new Promise(r => setTimeout(r, 100));
    const clientB = await createClient(port);

    // B should see Room1 with 1 player
    const listB = await waitForMessage(clientB, 'ROOM_LIST');
    const room1 = listB.rooms.find(r => r.id === 'Room1');
    assert.ok(room1, 'Room1 should be listed');
    assert.strictEqual(room1.count, 1, 'Room1 should have 1 player');

    // 4. Client B joins "Room1"
    clientB.send(JSON.stringify({ type: 'JOIN', roomId: 'Room1', name: 'B' }));

    // 5. Client C connects
    await new Promise(r => setTimeout(r, 100));
    const clientC = await createClient(port);

    // C should see Room1 with 2 players
    const listC = await waitForMessage(clientC, 'ROOM_LIST');
    const room1_C = listC.rooms.find(r => r.id === 'Room1');
    assert.strictEqual(room1_C.count, 2, 'Room1 should have 2 players');

  } finally {
    serverProcess.kill();
  }
});
