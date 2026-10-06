const test = require('node:test');
const assert = require('node:assert/strict');

const { createServer } = require('../src/server.js');
const { RoomService } = require('../src/room-service.js');

async function withServer(run) {
  let playerNumber = 0;
  const roomService = new RoomService({
    createCode: () => 'DUNK42',
    createId: () => `p${++playerNumber}`,
    createToken: () => `token-${playerNumber}`,
    rollDice: () => [1, 2],
  });
  const server = createServer({ roomService });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function post(baseUrl, path, body, token) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

test('serves health status and the game interface', async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/api/health`);
    assert.deepEqual(await health.json(), { ok: true, game: 'Basketball Empire' });

    const page = await fetch(`${baseUrl}/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /Basketball Empire/);
  });
});

test('serves a local top-five Buzzer Beater leaderboard', async () => {
  await withServer(async (baseUrl) => {
    for (const [nickname, score] of [['Ace', 10], ['Sky', 22], ['Anonymous', 15]]) {
      const response = await fetch(`${baseUrl}/api/buzzer/leaderboard`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nickname, score }),
      });
      assert.equal(response.status, 201);
    }
    const payload = await (await fetch(`${baseUrl}/api/buzzer/leaderboard`)).json();
    assert.deepEqual(payload.entries.map((entry) => entry.score), [22, 15, 10]);
  });
});

test('creates, joins, readies, and starts a two-player room over HTTP', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await post(baseUrl, '/api/rooms', { name: 'Aaron Wang' });
    assert.equal(createResponse.status, 201);
    const host = await createResponse.json();

    const joinResponse = await post(baseUrl, '/api/rooms/DUNK42/join', { name: 'Maya Chen' });
    assert.equal(joinResponse.status, 201);
    const guest = await joinResponse.json();

    await post(baseUrl, '/api/rooms/DUNK42/ready', { ready: true }, host.token);
    await post(baseUrl, '/api/rooms/DUNK42/ready', { ready: true }, guest.token);
    const startResponse = await post(baseUrl, '/api/rooms/DUNK42/start', { durationMinutes: 15 }, host.token);
    const started = await startResponse.json();

    assert.equal(startResponse.status, 200);
    assert.equal(started.room.status, 'playing');
    assert.equal(started.room.matchDurationSeconds, 900);
    assert.deepEqual(started.room.players.map((player) => player.name), ['Aaron Wang', 'Maya Chen']);
  });
});

test('accepts authenticated game actions and ignores client-supplied dice', async () => {
  await withServer(async (baseUrl) => {
    const host = await (await post(baseUrl, '/api/rooms', { name: 'Aaron Wang' })).json();
    const guest = await (await post(baseUrl, '/api/rooms/DUNK42/join', { name: 'Maya Chen' })).json();
    await post(baseUrl, '/api/rooms/DUNK42/ready', { ready: true }, host.token);
    await post(baseUrl, '/api/rooms/DUNK42/ready', { ready: true }, guest.token);
    await post(baseUrl, '/api/rooms/DUNK42/start', {}, host.token);

    const actionResponse = await post(baseUrl, '/api/rooms/DUNK42/actions', { type: 'roll', dice: [6, 6] }, host.token);
    const result = await actionResponse.json();

    assert.equal(actionResponse.status, 200);
    assert.deepEqual(result.room.lastRoll, [1, 2]);
    assert.equal(result.room.players[0].position, 3);
  });
});

test('streams an initial room snapshot using server-sent events', async () => {
  await withServer(async (baseUrl) => {
    await post(baseUrl, '/api/rooms', { name: 'Aaron Wang' });
    const controller = new AbortController();
    const response = await fetch(`${baseUrl}/api/rooms/DUNK42/events`, { signal: controller.signal });
    assert.match(response.headers.get('content-type'), /text\/event-stream/);

    const reader = response.body.getReader();
    const { value } = await reader.read();
    const event = new TextDecoder().decode(value);
    controller.abort();

    assert.match(event, /event: state/);
    assert.match(event, /"roomCode":"DUNK42"/);
  });
});

test('runs a complete synchronized round with four authenticated players', async () => {
  await withServer(async (baseUrl) => {
    const players = [];
    players.push(await (await post(baseUrl, '/api/rooms', { name: 'Aaron Wang' })).json());
    for (const name of ['Maya Chen', 'Leo Tan', '王小明']) {
      players.push(await (await post(baseUrl, '/api/rooms/DUNK42/join', { name })).json());
    }
    for (const player of players) {
      const readyResponse = await post(baseUrl, '/api/rooms/DUNK42/ready', { ready: true }, player.token);
      assert.equal(readyResponse.status, 200);
    }
    const startResponse = await post(baseUrl, '/api/rooms/DUNK42/start', {}, players[0].token);
    assert.equal(startResponse.status, 200);

    for (let index = 0; index < players.length; index += 1) {
      const rollResponse = await post(baseUrl, '/api/rooms/DUNK42/actions', { type: 'roll' }, players[index].token);
      const rolled = await rollResponse.json();
      assert.equal(rollResponse.status, 200);
      if (rolled.room.phase === 'decision') {
        await post(baseUrl, '/api/rooms/DUNK42/actions', { type: 'decision', choice: 'sign' }, players[index].token);
      }
      const endResponse = await post(baseUrl, '/api/rooms/DUNK42/actions', { type: 'end_turn' }, players[index].token);
      assert.equal(endResponse.status, 200);
    }

    const finalRoom = await (await fetch(`${baseUrl}/api/rooms/DUNK42`)).json();
    assert.equal(finalRoom.room.players.length, 4);
    assert.equal(finalRoom.room.currentPlayerIndex, 0);
    assert.equal(finalRoom.room.turn, 4);
  });
});
