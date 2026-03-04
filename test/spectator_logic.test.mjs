import { spawn } from 'child_process';
import WebSocket from 'ws';
import assert from 'assert';

const PORT = 8084;
const MSG = {
  JOIN: 'JOIN',
  WELCOME: 'WELCOME',
  UPDATE: 'UPDATE',
  STATE_UPDATE: 'STATE_UPDATE',
  PLAYER_JOIN: 'PLAYER_JOIN'
};
const RACE_STATE = {
  WAITING: 0,
  COUNTDOWN: 1,
  RACING: 2
};

let serverProcess;

function startServer() {
  return new Promise((resolve) => {
    serverProcess = spawn('node', ['server/index.mjs'], {
      env: { ...process.env, PORT }
    });
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes(`Nexus Lobby running on port ${PORT}`)) {
        resolve();
      }
    });
  });
}

function createClient() {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${PORT}`);
    ws.on('open', () => resolve(ws));
  });
}

function waitForMessage(ws, type) {
  return new Promise((resolve) => {
    const listener = (data) => {
      const msg = JSON.parse(data);
      if (msg.type === type) {
        ws.removeListener('message', listener);
        resolve(msg);
      }
    };
    ws.on('message', listener);
  });
}

async function runTest() {
  console.log('Starting server...');
  await startServer();

  try {
    const p1 = await createClient();
    const p2 = await createClient();
    const p3 = await createClient();

    // 1. P1 Joins
    p1.send(JSON.stringify({ type: MSG.JOIN, roomId: 'spec_test', name: 'P1' }));
    await waitForMessage(p1, MSG.WELCOME);

    // 2. P2 Joins
    p2.send(JSON.stringify({ type: MSG.JOIN, roomId: 'spec_test', name: 'P2' }));
    await waitForMessage(p2, MSG.WELCOME);

    // 3. Wait for Countdown (Server should trigger this automatically when 2 players are present)
    console.log('Waiting for race to start (COUNTDOWN)...');
    const stateMsg = await waitForMessage(p1, MSG.STATE_UPDATE);
    assert.strictEqual(stateMsg.state, RACE_STATE.COUNTDOWN, 'Should enter COUNTDOWN state');

    // 4. P3 Joins late (during COUNTDOWN)
    console.log('P3 joining late...');
    p3.send(JSON.stringify({ type: MSG.JOIN, roomId: 'spec_test', name: 'P3' }));

    const welcomeP3 = await waitForMessage(p3, MSG.WELCOME);
    console.log('P3 Welcome:', welcomeP3);

    assert.strictEqual(welcomeP3.isSpectator, true, 'P3 should be flagged as spectator');
    assert.strictEqual(welcomeP3.state, RACE_STATE.COUNTDOWN, 'State should be COUNTDOWN');

    // 5. Verify P3 UPDATEs are ignored
    // We need to listen on P1 to see if it receives P3's update
    console.log('P3 sending UPDATE...');
    p3.send(JSON.stringify({ type: MSG.UPDATE, x: 0.5, z: 100, speed: 1000 }));

    // We wait a bit to see if P1 gets it. If P1 gets an update from P3, fail.
    // To do this reliably, we can listen for *any* message on P1.
    // However, P1 might receive other updates (like P2?).
    // P2 isn't sending updates.

    let receivedUpdateFromP3 = false;
    const p1Listener = (data) => {
      const msg = JSON.parse(data);
      if (msg.type === MSG.UPDATE && msg.id === welcomeP3.id) {
        receivedUpdateFromP3 = true;
      }
    };
    p1.on('message', p1Listener);

    await new Promise(r => setTimeout(r, 500));
    p1.removeListener('message', p1Listener);

    assert.strictEqual(receivedUpdateFromP3, false, 'P1 should NOT receive updates from spectator P3');

    // 6. Reset Room (Simulate by P1 and P2 leaving)
    console.log('P1 & P2 leaving...');
    p1.close();
    p2.close();

    // Wait for state update on P3 (back to WAITING)
    // Note: When P1/P2 leave, count drops to 1 (P3).
    // Room logic: "if state == COUNTDOWN && clients < 2 -> WAITING".
    // So P3 should get STATE_UPDATE -> WAITING.

    const stateReset = await waitForMessage(p3, MSG.STATE_UPDATE);
    assert.strictEqual(stateReset.state, RACE_STATE.WAITING, 'Should return to WAITING');

    // Wait a moment for local logic to potentially clear flag (client side)
    // But here we are testing server side.
    // Does the server tell P3 "You are not a spectator"?
    // The server doesn't send a specific "You are racer" message.
    // But if P3 re-joins or if we inspect internal server state...
    // Actually, our previous code in Room.mjs cleared the flag in `setState`.
    // We can't easily verify internal server state without a debugger or backdoor.
    // But if P3 sends an update NOW, it should be broadcast.

    console.log('P3 sending UPDATE after reset...');
    // We need another client to hear it.
    const p4 = await createClient();
    p4.send(JSON.stringify({ type: MSG.JOIN, roomId: 'spec_test', name: 'P4' }));
    await waitForMessage(p4, MSG.WELCOME);

    // P3 sends update
    p3.send(JSON.stringify({ type: MSG.UPDATE, x: -0.5, z: 200, speed: 500 }));

    const p4UpdatePromise = waitForMessage(p4, MSG.UPDATE);
    const updateMsg = await Promise.race([
        p4UpdatePromise,
        new Promise(r => setTimeout(() => r(null), 1000))
    ]);

    assert.ok(updateMsg, 'P4 should receive update from P3 now');
    assert.strictEqual(updateMsg.id, welcomeP3.id, 'Update should be from P3');

    console.log('Test Passed!');

  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    if (serverProcess) serverProcess.kill();
    process.exit(0);
  }
}

runTest();
