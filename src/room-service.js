'use strict';

const crypto = require('node:crypto');
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
  rollDice,
  startGame,
} = require('./game.js');

const PLAYER_COLORS = ['#f26a21', '#3b9dff', '#32d583', '#ffc83d'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function defaultCode() {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
}

function defaultDice() {
  return [crypto.randomInt(1, 7), crypto.randomInt(1, 7)];
}

class RoomService {
  constructor(options = {}) {
    this.rooms = new Map();
    this.createCode = options.createCode || defaultCode;
    this.createId = options.createId || (() => crypto.randomUUID());
    this.createToken = options.createToken || (() => crypto.randomBytes(24).toString('base64url'));
    this.rollDice = options.rollDice || defaultDice;
    this.now = options.now || Date.now;
    this.setTimer = options.setTimer || setTimeout;
    this.clearTimer = options.clearTimer || clearTimeout;
  }

  normalizeCode(roomCode) {
    return String(roomCode || '').trim().toUpperCase();
  }

  requireRecord(roomCode) {
    const code = this.normalizeCode(roomCode);
    const record = this.rooms.get(code);
    if (!record) throw new Error('Room not found.');
    return record;
  }

  createRoom({ name, avatarDataUrl }) {
    let roomCode = this.normalizeCode(this.createCode());
    for (let attempts = 0; this.rooms.has(roomCode) && attempts < 10; attempts += 1) {
      roomCode = this.normalizeCode(this.createCode());
    }
    if (!roomCode || this.rooms.has(roomCode)) throw new Error('Could not create a unique room code.');

    const playerId = this.createId();
    const token = this.createToken();
    let game = createGame({ roomCode });
    game = addPlayer(game, { id: playerId, name, avatarDataUrl, token, color: PLAYER_COLORS[0] });
    game.hostId = playerId;
    this.rooms.set(roomCode, {
      game,
      hostId: playerId,
      tokens: new Map([[token, playerId]]),
      listeners: new Set(),
      auctionTimer: null,
    });
    return { room: getPublicGame(game), playerId, token };
  }

  joinRoom(roomCode, { name, avatarDataUrl }) {
    const record = this.requireRecord(roomCode);
    if (record.game.status !== 'lobby') throw new Error('This match has already started.');
    const playerId = this.createId();
    const token = this.createToken();
    record.game = addPlayer(record.game, {
      id: playerId,
      name,
      avatarDataUrl,
      token,
      color: PLAYER_COLORS[record.game.players.length % PLAYER_COLORS.length],
    });
    record.tokens.set(token, playerId);
    this.notify(record);
    return { room: getPublicGame(record.game), playerId, token };
  }

  getRoom(roomCode) {
    const record = this.requireRecord(roomCode);
    const wasPlaying = record.game.status === 'playing';
    record.game = finishExpiredGame(record.game, this.now());
    if (wasPlaying && record.game.status === 'finished') this.notify(record);
    return getPublicGame(record.game);
  }

  authenticate(record, token) {
    const playerId = record.tokens.get(String(token || ''));
    if (!playerId) throw new Error('You are not authorized for this room.');
    return playerId;
  }

  setReady(roomCode, token, ready) {
    const record = this.requireRecord(roomCode);
    const playerId = this.authenticate(record, token);
    if (record.game.status !== 'lobby') throw new Error('The match has already started.');
    const next = structuredClone(record.game);
    next.players.find((player) => player.id === playerId).ready = Boolean(ready);
    record.game = next;
    this.notify(record);
    return getPublicGame(record.game);
  }

  startRoom(roomCode, token, { durationMinutes = 10 } = {}) {
    const record = this.requireRecord(roomCode);
    const playerId = this.authenticate(record, token);
    if (playerId !== record.hostId) throw new Error('Only the host can start the match.');
    if (!record.game.players.every((player) => player.ready)) throw new Error('Every player must be ready.');
    const durations = { 10: 600, 15: 900, 20: 1200, unlimited: null };
    const durationKey = String(durationMinutes);
    if (!Object.hasOwn(durations, durationKey)) throw new Error('Choose a valid game length.');
    record.game = startGame(record.game, { now: this.now(), matchDurationSeconds: durations[durationKey] });
    this.notify(record);
    return getPublicGame(record.game);
  }

  performAction(roomCode, token, action = {}) {
    const record = this.requireRecord(roomCode);
    record.game = finishExpiredGame(record.game, this.now());
    const playerId = this.authenticate(record, token);
    switch (action.type) {
      case 'roll':
        record.game = rollDice(record.game, playerId, this.rollDice());
        break;
      case 'decision':
        record.game = resolvePendingDecision(record.game, playerId, { choice: action.choice, now: this.now() });
        this.scheduleAuction(record);
        break;
      case 'bid':
        record.game = placeAuctionBid(record.game, playerId, Number(action.increment), { now: this.now() });
        this.scheduleAuction(record);
        break;
      case 'end_turn':
        record.game = endTurn(record.game, playerId);
        break;
      case 'end_game':
        if (playerId !== record.hostId) throw new Error('Only the host can end the match.');
        if (record.auctionTimer) this.clearTimer(record.auctionTimer);
        record.auctionTimer = null;
        record.game = finishGameByHost(record.game);
        break;
      case 'recruit':
        record.game = recruitStar(record.game, playerId, action.assetId, action.playerName);
        break;
      case 'mortgage':
        record.game = mortgageAsset(record.game, playerId, action.assetId);
        break;
      case 'bankrupt':
        record.game = declareBankruptcy(record.game, playerId);
        break;
      case 'trade_create':
        record.game = createTradeOffer(record.game, playerId, action);
        break;
      case 'trade_respond':
        record.game = respondToTradeOffer(record.game, playerId, action.offerId, Boolean(action.accept));
        break;
      default:
        throw new Error('Unknown game action.');
    }
    this.notify(record);
    return getPublicGame(record.game);
  }

  scheduleAuction(record) {
    if (record.auctionTimer) this.clearTimer(record.auctionTimer);
    record.auctionTimer = null;
    if (!record.game.auction) return;
    const expectedEndsAt = record.game.auction.endsAt;
    const delay = Math.max(0, expectedEndsAt - this.now());
    record.auctionTimer = this.setTimer(() => {
      if (!record.game.auction || record.game.auction.endsAt !== expectedEndsAt) return;
      const now = this.now();
      if (now < expectedEndsAt) {
        this.scheduleAuction(record);
        return;
      }
      record.game = finalizeAuction(record.game, { now });
      record.auctionTimer = null;
      this.notify(record);
    }, delay);
    record.auctionTimer?.unref?.();
  }

  subscribe(roomCode, listener) {
    const record = this.requireRecord(roomCode);
    record.listeners.add(listener);
    return () => record.listeners.delete(listener);
  }

  notify(record) {
    const snapshot = getPublicGame(record.game);
    for (const listener of record.listeners) listener(snapshot);
  }
}

module.exports = { RoomService };
