import gameModule from '../src/game.js';

const {
  addPlayer,
  createGame,
  createTradeOffer,
  declareBankruptcy,
  endTurn,
  finalizeAuction,
  finishExpiredGame,
  finishGameByHost,
  getPublicGame,
  mortgageAsset,
  placeAuctionBid,
  recruitStar,
  respondToTradeOffer,
  resolvePendingDecision,
  rollDice: movePlayer,
  startGame,
} = gameModule;

const PLAYER_COLORS = ['#f26a21', '#3b9dff', '#32d583', '#ffc83d'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RECORD_KEY = 'record';
const VISITOR_COUNT_KEY = 'visits';
const LEADERBOARD_KEY = 'top-five';
const ADS_TXT = 'google.com, pub-6603520082677971, DIRECT, f08c47fec0942fa0\n';

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function randomDice() {
  const bytes = crypto.getRandomValues(new Uint8Array(2));
  return Array.from(bytes, (value) => (value % 6) + 1);
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

async function readJson(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 64 * 1024) throw new Error('Request body is too large.');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

function bearerToken(request) {
  const authorization = request.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function errorStatus(error) {
  if (/not found/i.test(error.message)) return 404;
  if (/authorized|only the host|not your turn/i.test(error.message)) return 403;
  if (/full|already started|already joined|already signed|already exists/i.test(error.message)) return 409;
  return 400;
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

export class VisitorCounter {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Not found.' }, 404);
    const today = new Date().toISOString().slice(0, 10);
    const alreadyCounted = (request.headers.get('cookie') || '')
      .split(';')
      .some((part) => part.trim() === `be_visitor_day=${today}`);
    let visits = Number(await this.ctx.storage.get(VISITOR_COUNT_KEY) || 0);
    if (!alreadyCounted) {
      visits += 1;
      await this.ctx.storage.put(VISITOR_COUNT_KEY, visits);
    }
    const headers = { 'cache-control': 'no-store' };
    if (!alreadyCounted) {
      headers['set-cookie'] = `be_visitor_day=${today}; Max-Age=86400; Path=/; Secure; SameSite=Lax`;
    }
    return Response.json({ visits }, { headers });
  }
}

function cleanNickname(value) {
  const cleaned = String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
  return cleaned || 'Anonymous';
}

export class BuzzerLeaderboard {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      return json({ entries: await this.ctx.storage.get(LEADERBOARD_KEY) || [] });
    }
    if (request.method !== 'POST') return json({ error: 'Not found.' }, 404);
    try {
      const body = await readJson(request);
      const score = Number(body.score);
      if (!Number.isInteger(score) || score < 0 || score > 100000) throw new Error('Submit a valid score.');
      const entry = {
        id: crypto.randomUUID(),
        nickname: cleanNickname(body.nickname),
        score,
        createdAt: Date.now(),
      };
      const current = await this.ctx.storage.get(LEADERBOARD_KEY) || [];
      const entries = [...current, entry]
        .sort((left, right) => right.score - left.score || left.createdAt - right.createdAt)
        .slice(0, 5);
      const qualified = entries.some((candidate) => candidate.id === entry.id);
      if (qualified) await this.ctx.storage.put(LEADERBOARD_KEY, entries);
      return json({ entry, entries, qualified }, 201);
    } catch (error) {
      return json({ error: error.message }, 400);
    }
  }
}

export class BasketballRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.record = null;
    this.ready = ctx.blockConcurrencyWhile(async () => {
      this.record = await ctx.storage.get(RECORD_KEY) || null;
    });
  }

  async persist() {
    await this.ctx.storage.put(RECORD_KEY, this.record);
    await this.scheduleAlarm();
  }

  async scheduleAlarm() {
    const times = [];
    if (this.record?.game.auction?.endsAt) times.push(this.record.game.auction.endsAt);
    const game = this.record?.game;
    if (game?.status === 'playing' && game.matchDurationSeconds != null && game.matchStartedAt) {
      times.push(game.matchStartedAt + game.matchDurationSeconds * 1000);
    }
    if (times.length) await this.ctx.storage.setAlarm(Math.min(...times));
    else await this.ctx.storage.deleteAlarm();
  }

  requireRecord() {
    if (!this.record) throw new Error('Room not found.');
    return this.record;
  }

  authenticate(token) {
    const record = this.requireRecord();
    const playerId = record.tokens[String(token || '')];
    if (!playerId) throw new Error('You are not authorized for this room.');
    return playerId;
  }

  async create(roomCode, body) {
    if (this.record) throw new Error('Room already exists.');
    const playerId = crypto.randomUUID();
    const token = randomToken();
    let game = createGame({ roomCode });
    game = addPlayer(game, {
      id: playerId,
      name: body.name,
      avatarDataUrl: body.avatarDataUrl,
      token,
      color: PLAYER_COLORS[0],
    });
    game.hostId = playerId;
    this.record = { game, hostId: playerId, tokens: { [token]: playerId } };
    await this.persist();
    return { room: getPublicGame(game), playerId, token };
  }

  async join(body) {
    const record = this.requireRecord();
    if (record.game.status !== 'lobby') throw new Error('This match has already started.');
    const playerId = crypto.randomUUID();
    const token = randomToken();
    record.game = addPlayer(record.game, {
      id: playerId,
      name: body.name,
      avatarDataUrl: body.avatarDataUrl,
      token,
      color: PLAYER_COLORS[record.game.players.length % PLAYER_COLORS.length],
    });
    record.tokens[token] = playerId;
    await this.persist();
    return { room: getPublicGame(record.game), playerId, token };
  }

  async setReady(token, body) {
    const record = this.requireRecord();
    const playerId = this.authenticate(token);
    if (record.game.status !== 'lobby') throw new Error('The match has already started.');
    const next = structuredClone(record.game);
    next.players.find((player) => player.id === playerId).ready = Boolean(body.ready);
    record.game = next;
    await this.persist();
    return getPublicGame(record.game);
  }

  async start(token, body) {
    const record = this.requireRecord();
    const playerId = this.authenticate(token);
    if (playerId !== record.hostId) throw new Error('Only the host can start the match.');
    if (!record.game.players.every((player) => player.ready)) throw new Error('Every player must be ready.');
    const durations = { 3: 180, 5: 300, 10: 600, 15: 900, 20: 1200, unlimited: null };
    const durationKey = String(body.durationMinutes ?? 10);
    if (!Object.hasOwn(durations, durationKey)) throw new Error('Choose a valid game length.');
    record.game = startGame(record.game, {
      now: Date.now(),
      matchDurationSeconds: durations[durationKey],
    });
    await this.persist();
    return getPublicGame(record.game);
  }

  async action(token, action) {
    const record = this.requireRecord();
    record.game = finishExpiredGame(record.game, Date.now());
    const playerId = this.authenticate(token);
    switch (action.type) {
      case 'roll': record.game = movePlayer(record.game, playerId, randomDice()); break;
      case 'decision': record.game = resolvePendingDecision(record.game, playerId, { choice: action.choice, now: Date.now() }); break;
      case 'bid': record.game = placeAuctionBid(record.game, playerId, Number(action.increment), { now: Date.now() }); break;
      case 'end_turn': record.game = endTurn(record.game, playerId); break;
      case 'end_game':
        if (playerId !== record.hostId) throw new Error('Only the host can end the match.');
        record.game = finishGameByHost(record.game);
        break;
      case 'recruit': record.game = recruitStar(record.game, playerId, action.assetId, action.playerName); break;
      case 'mortgage': record.game = mortgageAsset(record.game, playerId, action.assetId); break;
      case 'bankrupt': record.game = declareBankruptcy(record.game, playerId); break;
      case 'trade_create': record.game = createTradeOffer(record.game, playerId, action); break;
      case 'trade_respond': record.game = respondToTradeOffer(record.game, playerId, action.offerId, Boolean(action.accept)); break;
      default: throw new Error('Unknown game action.');
    }
    await this.persist();
    return getPublicGame(record.game);
  }

  async fetch(request) {
    await this.ready;
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]+)(?:\/(internal-create|join|ready|start|actions|events))?$/);
    if (!match) return json({ error: 'Not found.' }, 404);
    const [, roomCode, operation] = match;
    try {
      if (request.method === 'POST' && operation === 'internal-create') {
        return json(await this.create(normalizeCode(roomCode), await readJson(request)), 201);
      }
      if (request.method === 'GET' && !operation) {
        const record = this.requireRecord();
        const previousStatus = record.game.status;
        record.game = finishExpiredGame(record.game, Date.now());
        if (record.game.status !== previousStatus) await this.persist();
        return json({ room: getPublicGame(record.game) });
      }
      if (request.method === 'POST' && operation === 'join') return json(await this.join(await readJson(request)), 201);
      if (request.method === 'POST' && operation === 'ready') return json({ room: await this.setReady(bearerToken(request), await readJson(request)) });
      if (request.method === 'POST' && operation === 'start') return json({ room: await this.start(bearerToken(request), await readJson(request)) });
      if (request.method === 'POST' && operation === 'actions') return json({ room: await this.action(bearerToken(request), await readJson(request)) });
      if (request.method === 'GET' && operation === 'events') return json({ error: 'Live events use polling on Cloudflare.' }, 501);
      return json({ error: 'Not found.' }, 404);
    } catch (error) {
      return json({ error: error.message }, errorStatus(error));
    }
  }

  async alarm() {
    await this.ready;
    if (!this.record) return;
    const now = Date.now();
    this.record.game = finishExpiredGame(this.record.game, now);
    if (this.record.game.auction && now >= this.record.game.auction.endsAt) {
      this.record.game = finalizeAuction(this.record.game, { now });
    }
    await this.persist();
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/ads.txt') {
      return new Response(request.method === 'HEAD' ? null : ADS_TXT, {
        headers: {
          'cache-control': 'public, max-age=300',
          'content-type': 'text/plain; charset=utf-8',
          'x-content-type-options': 'nosniff',
        },
      });
    }
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true, game: 'Basketball Empire', runtime: 'cloudflare' });
    }
    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      const bodyText = await request.text();
      for (let attempts = 0; attempts < 10; attempts += 1) {
        const code = randomCode();
        const id = env.ROOMS.idFromName(code);
        const response = await env.ROOMS.get(id).fetch(new Request(`${url.origin}/api/rooms/${code}/internal-create`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: bodyText,
        }));
        if (response.status !== 409) return response;
      }
      return json({ error: 'Could not create a unique room code.' }, 503);
    }
    if (request.method === 'POST' && url.pathname === '/api/visits') {
      const id = env.VISITOR_COUNTER.idFromName('global');
      return env.VISITOR_COUNTER.get(id).fetch(request);
    }
    if (url.pathname === '/api/buzzer/leaderboard' && (request.method === 'GET' || request.method === 'POST')) {
      const id = env.BUZZER_LEADERBOARD.idFromName('global');
      return env.BUZZER_LEADERBOARD.get(id).fetch(request);
    }
    const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]+)(?:\/.*)?$/);
    if (roomMatch) {
      const code = normalizeCode(roomMatch[1]);
      return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(request);
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
};

export default worker;
