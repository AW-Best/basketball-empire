'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

class FakeStorage {
  constructor() {
    this.values = new Map();
    this.alarm = null;
  }

  async get(key) {
    return structuredClone(this.values.get(key));
  }

  async put(key, value) {
    this.values.set(key, structuredClone(value));
  }

  async setAlarm(timestamp) {
    this.alarm = timestamp;
  }

  async deleteAlarm() {
    this.alarm = null;
  }
}

class FakeContext {
  constructor() {
    this.storage = new FakeStorage();
  }

  blockConcurrencyWhile(callback) {
    return callback();
  }
}

async function createRuntime() {
  const workerModule = await import('../cloudflare/worker.mjs');
  const objects = new Map();
  const namespace = {
    idFromName(name) {
      return name;
    },
    get(id) {
      if (!objects.has(id)) {
        objects.set(id, new workerModule.BasketballRoom(new FakeContext(), {}));
      }
      return { fetch: (request) => objects.get(id).fetch(request) };
    },
  };
  const visitorContext = new FakeContext();
  const visitorCounter = new workerModule.VisitorCounter(visitorContext, {});
  const leaderboardContext = new FakeContext();
  const leaderboard = new workerModule.BuzzerLeaderboard(leaderboardContext, {});
  const env = {
    ROOMS: namespace,
    VISITOR_COUNTER: {
      idFromName(name) {
        assert.equal(name, 'global');
        return name;
      },
      get() {
        return { fetch: (request) => visitorCounter.fetch(request) };
      },
    },
    BUZZER_LEADERBOARD: {
      idFromName(name) {
        assert.equal(name, 'global');
        return name;
      },
      get() {
        return { fetch: (request) => leaderboard.fetch(request) };
      },
    },
    ASSETS: {
      fetch: async () => new Response('Basketball Empire page', {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    },
  };
  return { worker: workerModule.default, env, objects, visitorContext, leaderboardContext };
}

async function post(worker, env, path, body, token) {
  return worker.fetch(new Request(`https://example.test${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }), env);
}

test('Cloudflare worker serves health and delegates static assets', async () => {
  const { worker, env } = await createRuntime();

  const health = await worker.fetch(new Request('https://example.test/api/health'), env);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true, game: 'Basketball Empire', runtime: 'cloudflare' });

  const page = await worker.fetch(new Request('https://example.test/'), env);
  assert.equal(await page.text(), 'Basketball Empire page');
});

test('Cloudflare worker creates and persists a multiplayer room', async () => {
  const { worker, env, objects } = await createRuntime();

  const createdResponse = await post(worker, env, '/api/rooms', { name: 'Aaron Wang' });
  assert.equal(createdResponse.status, 201);
  const host = await createdResponse.json();
  assert.match(host.room.roomCode, /^[A-Z2-9]{6}$/);
  assert.equal(host.room.players[0].name, 'Aaron Wang');

  const joinedResponse = await post(
    worker,
    env,
    `/api/rooms/${host.room.roomCode}/join`,
    { name: 'Maya Chen' },
  );
  assert.equal(joinedResponse.status, 201);
  const guest = await joinedResponse.json();
  assert.deepEqual(guest.room.players.map((player) => player.name), ['Aaron Wang', 'Maya Chen']);

  const durableObject = objects.get(host.room.roomCode);
  assert.equal(durableObject.ctx.storage.values.get('record').game.players.length, 2);
});

test('Cloudflare room keeps the existing authenticated ready and start API', async () => {
  const { worker, env } = await createRuntime();
  const host = await (await post(worker, env, '/api/rooms', { name: 'Aaron Wang' })).json();
  const code = host.room.roomCode;
  const guest = await (await post(worker, env, `/api/rooms/${code}/join`, { name: 'Maya Chen' })).json();

  assert.equal((await post(worker, env, `/api/rooms/${code}/ready`, { ready: true }, host.token)).status, 200);
  assert.equal((await post(worker, env, `/api/rooms/${code}/ready`, { ready: true }, guest.token)).status, 200);
  const started = await post(worker, env, `/api/rooms/${code}/start`, { durationMinutes: 5 }, host.token);
  const payload = await started.json();

  assert.equal(started.status, 200);
  assert.equal(payload.room.status, 'playing');
  assert.equal(payload.room.matchDurationSeconds, 300);
});

test('Cloudflare events endpoint tells the browser to use polling', async () => {
  const { worker, env } = await createRuntime();
  const host = await (await post(worker, env, '/api/rooms', { name: 'Aaron Wang' })).json();

  const response = await worker.fetch(
    new Request(`https://example.test/api/rooms/${host.room.roomCode}/events`),
    env,
  );

  assert.equal(response.status, 501);
  assert.deepEqual(await response.json(), { error: 'Live events use polling on Cloudflare.' });
});

test('public visitor counter increments once for a browser each UTC day', async () => {
  const { worker, env } = await createRuntime();

  const first = await worker.fetch(new Request('https://example.test/api/visits', { method: 'POST' }), env);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.clone().json(), { visits: 1 });
  assert.match(first.headers.get('set-cookie'), /be_visitor_day=\d{4}-\d{2}-\d{2}/);

  const cookie = first.headers.get('set-cookie').split(';')[0];
  const repeat = await worker.fetch(new Request('https://example.test/api/visits', {
    method: 'POST',
    headers: { cookie },
  }), env);
  assert.deepEqual(await repeat.json(), { visits: 1 });
  assert.equal(repeat.headers.get('set-cookie'), null);

  const secondVisitor = await worker.fetch(new Request('https://example.test/api/visits', { method: 'POST' }), env);
  assert.deepEqual(await secondVisitor.json(), { visits: 2 });
});

test('Buzzer Beater leaderboard keeps only the five highest historical scores', async () => {
  const { worker, env } = await createRuntime();
  const entries = [12, 40, 18, 7, 30, 25];
  for (const [index, score] of entries.entries()) {
    const response = await post(worker, env, '/api/buzzer/leaderboard', {
      nickname: `Player ${index + 1}`,
      score,
    });
    assert.equal(response.status, 201);
  }

  const response = await worker.fetch(new Request('https://example.test/api/buzzer/leaderboard'), env);
  const payload = await response.json();
  assert.deepEqual(payload.entries.map((entry) => entry.score), [40, 30, 25, 18, 12]);
  assert.equal(payload.entries.length, 5);
});

test('Buzzer leaderboard sanitizes nicknames and rejects impossible submissions', async () => {
  const { worker, env } = await createRuntime();
  const saved = await post(worker, env, '/api/buzzer/leaderboard', { nickname: '  <Ace>  ', score: 22 });
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).entry.nickname, 'Ace');

  const invalid = await post(worker, env, '/api/buzzer/leaderboard', { nickname: 'Cheater', score: 100001 });
  assert.equal(invalid.status, 400);
});
