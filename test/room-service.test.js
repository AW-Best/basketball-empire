const test = require('node:test');
const assert = require('node:assert/strict');

const { RoomService } = require('../src/room-service.js');

function service() {
  let playerNumber = 0;
  return new RoomService({
    createCode: () => 'DUNK42',
    createId: () => `p${++playerNumber}`,
    createToken: () => `token-${playerNumber}`,
    rollDice: () => [1, 2],
  });
}

test('creates a room with a named host and returns private credentials separately', () => {
  const rooms = service();
  const result = rooms.createRoom({ name: 'Aaron Wang' });

  assert.equal(result.room.roomCode, 'DUNK42');
  assert.equal(result.room.players[0].name, 'Aaron Wang');
  assert.equal(result.room.players[0].initials, 'AW');
  assert.equal(result.room.hostId, result.playerId);
  assert.equal(result.playerId, 'p1');
  assert.equal(result.token, 'token-1');
  assert.equal('token' in result.room.players[0], false);
});

test('synchronizes uploaded avatars for hosts and joining players', () => {
  const rooms = service();
  const hostAvatar = `data:image/jpeg;base64,${Buffer.from('host-photo').toString('base64')}`;
  const guestAvatar = `data:image/png;base64,${Buffer.from('guest-photo').toString('base64')}`;
  const host = rooms.createRoom({ name: 'Aaron Wang', avatarDataUrl: hostAvatar });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen', avatarDataUrl: guestAvatar });

  assert.equal(host.room.players[0].avatarDataUrl, hostAvatar);
  assert.equal(guest.room.players[0].avatarDataUrl, hostAvatar);
  assert.equal(guest.room.players[1].avatarDataUrl, guestAvatar);
});

test('allows up to four players to join and rejects a fifth player', () => {
  const rooms = service();
  rooms.createRoom({ name: 'Aaron Wang' });
  rooms.joinRoom('dunk42', { name: 'Maya Chen' });
  rooms.joinRoom('DUNK42', { name: 'Leo Tan' });
  rooms.joinRoom('DUNK42', { name: '王小明' });

  assert.equal(rooms.getRoom('DUNK42').players.length, 4);
  assert.throws(() => rooms.joinRoom('DUNK42', { name: 'Fifth Player' }), /full/i);
});

test('only the host can start and every player must be ready', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });

  rooms.setReady('DUNK42', host.token, true);
  assert.throws(() => rooms.startRoom('DUNK42', host.token), /ready/i);
  rooms.setReady('DUNK42', guest.token, true);
  assert.throws(() => rooms.startRoom('DUNK42', guest.token), /host/i);

  const started = rooms.startRoom('DUNK42', host.token);
  assert.equal(started.status, 'playing');
  assert.equal(started.players.length, 2);
});

test('host chooses a 10, 15, 20 minute, or unlimited match', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  rooms.setReady('DUNK42', guest.token, true);

  assert.throws(() => rooms.startRoom('DUNK42', guest.token, { durationMinutes: 20 }), /host/i);
  const started = rooms.startRoom('DUNK42', host.token, { durationMinutes: 20 });
  assert.equal(started.matchDurationSeconds, 1200);
});

test('authorizes actions by player token and uses server-controlled dice', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  rooms.setReady('DUNK42', guest.token, true);
  rooms.startRoom('DUNK42', host.token);

  assert.throws(() => rooms.performAction('DUNK42', guest.token, { type: 'roll' }), /turn/i);
  assert.throws(() => rooms.performAction('DUNK42', 'wrong-token', { type: 'roll' }), /authorized/i);

  const rolled = rooms.performAction('DUNK42', host.token, { type: 'roll', dice: [6, 6] });
  assert.deepEqual(rolled.lastRoll, [1, 2]);
  assert.equal(rolled.players[0].position, 3);
});

test('notifies room subscribers after state changes', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const snapshots = [];
  const unsubscribe = rooms.subscribe('DUNK42', (snapshot) => snapshots.push(snapshot));

  rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  unsubscribe();
  rooms.joinRoom('DUNK42', { name: 'Leo Tan' });

  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].players.length, 2);
  assert.equal(snapshots[1].players[0].ready, true);
});

test('named recruit actions assign the selected player to an eligible team', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  rooms.setReady('DUNK42', guest.token, true);
  rooms.startRoom('DUNK42', host.token);
  const record = rooms.requireRecord('DUNK42');
  record.game.assets['space-1'].ownerId = host.playerId;
  record.game.assets['space-3'].ownerId = host.playerId;
  const result = rooms.performAction('DUNK42', host.token, { type: 'recruit', assetId: 'space-1', playerName: 'Stephen Curry' });
  assert.deepEqual(result.assets['space-1'].recruits, ['Stephen Curry']);
});

test('room auctions reschedule on bids and finish automatically after five quiet seconds', () => {
  let now = 1_000;
  const timers = [];
  const rooms = service();
  rooms.now = () => now;
  rooms.setTimer = (callback, delay) => { timers.push({ callback, delay }); return timers.length; };
  rooms.clearTimer = () => {};
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  rooms.setReady('DUNK42', guest.token, true);
  rooms.startRoom('DUNK42', host.token);
  rooms.performAction('DUNK42', host.token, { type: 'roll' });

  const auction = rooms.performAction('DUNK42', host.token, { type: 'decision', choice: 'decline' });
  assert.equal(auction.phase, 'auction');
  assert.equal(timers.at(-1).delay, 5_000);

  now = 2_000;
  const bid = rooms.performAction('DUNK42', guest.token, { type: 'bid', increment: 50 });
  assert.equal(bid.auction.highBid, 50);
  assert.equal(timers.at(-1).delay, 5_000);

  now = 7_000;
  timers.at(-1).callback();
  const finished = rooms.getRoom('DUNK42');
  assert.equal(finished.assets['space-3'].ownerId, guest.playerId);
  assert.equal(finished.phase, 'end_turn');
});

test('only the host can end an active match and the richest active player wins', () => {
  const rooms = service();
  const host = rooms.createRoom({ name: 'Aaron Wang' });
  const guest = rooms.joinRoom('DUNK42', { name: 'Maya Chen' });
  rooms.setReady('DUNK42', host.token, true);
  rooms.setReady('DUNK42', guest.token, true);
  rooms.startRoom('DUNK42', host.token);
  rooms.requireRecord('DUNK42').game.players[1].points = 1700;

  assert.throws(() => rooms.performAction('DUNK42', guest.token, { type: 'end_game' }), /host/i);
  const finished = rooms.performAction('DUNK42', host.token, { type: 'end_game' });

  assert.equal(finished.status, 'finished');
  assert.equal(finished.winnerId, guest.playerId);
  assert.equal(finished.finishReason, 'host_ended');
});
