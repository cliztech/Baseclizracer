import assert from 'assert';
import { Room } from '../server/Room.mjs';
import { MSG, RACE_STATE } from '../constants.mjs';

// Mock Client
class MockClient {
  constructor(id) {
    this.id = id;
    this.state = { name: id, spriteIndex: 0 };
    this.sentMessages = [];
  }
  send(type, payload) {
    this.sentMessages.push({ type, payload });
  }
}

async function test() {
  console.log('Testing Race Lifecycle...');

  const room = new Room('test-room');

  // 1. One player joins -> WAITING
  const c1 = new MockClient('c1');
  room.add(c1);
  assert.strictEqual(room.state, RACE_STATE.WAITING, 'Should be WAITING with 1 player');
  console.log('Passed: 1 Player -> WAITING');

  // 2. Second player joins -> COUNTDOWN
  const c2 = new MockClient('c2');
  room.add(c2);
  assert.strictEqual(room.state, RACE_STATE.COUNTDOWN, 'Should be COUNTDOWN with 2 players');

  // Verify broadcast
  const updateMsg = c1.sentMessages.find(m => m.type === MSG.STATE_UPDATE);
  assert.ok(updateMsg, 'Client 1 should receive STATE_UPDATE');
  assert.strictEqual(updateMsg.payload.state, RACE_STATE.COUNTDOWN);
  console.log('Passed: 2 Players -> COUNTDOWN');

  // 3. Wait for RACING transition
  console.log('Waiting 3.1s for transition to RACING...');
  await new Promise(r => setTimeout(r, 3100));

  assert.strictEqual(room.state, RACE_STATE.RACING, 'Should be RACING after timeout');

  // Verify broadcast
  // c1 should have received another STATE_UPDATE
  const updates = c1.sentMessages.filter(m => m.type === MSG.STATE_UPDATE);
  assert.strictEqual(updates.length, 2, 'Should receive 2 state updates (Countdown, Racing)');
  assert.strictEqual(updates[1].payload.state, RACE_STATE.RACING);
  console.log('Passed: Timeout -> RACING');

  // 4. Player leaves -> WAITING (if < 2)
  room.remove(c2);
  assert.strictEqual(room.state, RACE_STATE.WAITING, 'Should revert to WAITING when player leaves');
  console.log('Passed: Player Leave -> WAITING');

  console.log('ALL TESTS PASSED');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
