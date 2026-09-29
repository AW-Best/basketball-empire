const test = require('node:test');
const assert = require('node:assert/strict');

const {
  BOARD_SIZE,
  RECRUITABLE_PLAYERS,
  addPlayer,
  createGame,
  createInitials,
  createTradeOffer,
  declareBankruptcy,
  endTurn,
  finalizeAuction,
  finishExpiredGame,
  getPublicGame,
  mortgageAsset,
  placeAuctionBid,
  recruitStar,
  resolvePendingDecision,
  rollDice,
  startGame,
  respondToTradeOffer,
} = require('../src/game.js');

function fourPlayerGame() {
  let game = createGame({ roomCode: 'COURT1', lapsToWin: 4 });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang', color: '#11b5e4' });
  game = addPlayer(game, { id: 'p2', name: 'Maya Chen', color: '#ff5a5f' });
  game = addPlayer(game, { id: 'p3', name: 'Leo Tan', color: '#49d17d' });
  game = addPlayer(game, { id: 'p4', name: '王小明', color: '#ffca3a' });
  return startGame(game, { firstPlayerIndex: 0 });
}

test('creates a 40-space basketball board with 22 teams', () => {
  const game = createGame({ roomCode: 'COURT1' });

  assert.equal(game.board.length, BOARD_SIZE);
  assert.equal(game.board.filter((space) => space.type === 'team').length, 22);
  assert.equal(game.board.filter((space) => space.type === 'route').length, 4);
  assert.equal(game.board.filter((space) => space.type === 'training').length, 2);
  assert.deepEqual(
    [game.board[0].type, game.board[10].type, game.board[20].type, game.board[30].type],
    ['tipoff', 'bench', 'locker_room', 'ejected'],
  );
});

test('creates initials from full player names', () => {
  assert.equal(createInitials('Aaron'), 'A');
  assert.equal(createInitials('Aaron James Wang'), 'AW');
  assert.equal(createInitials('Jean-Luc Picard'), 'JP');
  assert.equal(createInitials('王小明'), '王小');
  assert.equal(createInitials('Aaron 王'), 'A王');
});

test('stores a validated photo avatar and rejects unsafe avatar data', () => {
  const avatarDataUrl = `data:image/jpeg;base64,${Buffer.from('tiny-photo').toString('base64')}`;
  let game = createGame({ roomCode: 'COURT1' });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang', avatarDataUrl });

  assert.equal(game.players[0].avatarDataUrl, avatarDataUrl);
  assert.throws(
    () => addPlayer(game, { id: 'p2', name: 'Maya Chen', avatarDataUrl: 'javascript:alert(1)' }),
    /avatar/i,
  );
});

test('starts only when at least two players are present and gives each player 1500 points', () => {
  let game = createGame({ roomCode: 'COURT1' });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang' });
  assert.throws(() => startGame(game), /at least two players/i);

  game = addPlayer(game, { id: 'p2', name: 'Maya Chen' });
  game = startGame(game, { firstPlayerIndex: 1 });

  assert.equal(game.status, 'playing');
  assert.equal(game.currentPlayerIndex, 1);
  assert.deepEqual(game.players.map((player) => player.points), [1500, 1500]);
});

test('starting a match creates an authoritative 18-second turn clock', () => {
  let game = createGame({ roomCode: 'COURT1' });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang' });
  game = addPlayer(game, { id: 'p2', name: 'Maya Chen' });

  game = startGame(game, { firstPlayerIndex: 0, now: 10_000 });

  assert.equal(game.turnDurationSeconds, 18);
  assert.equal(game.turnStartedAt, 10_000);
});

test('host-selected timed and unlimited match lengths are authoritative', () => {
  for (const matchDurationSeconds of [600, 900, 1200, null]) {
    let game = createGame({ roomCode: 'COURT1' });
    game = addPlayer(game, { id: 'p1', name: 'Aaron Wang' });
    game = addPlayer(game, { id: 'p2', name: 'Maya Chen' });
    game = startGame(game, { firstPlayerIndex: 0, now: 10_000, matchDurationSeconds });
    assert.equal(game.matchDurationSeconds, matchDurationSeconds);
  }

  let invalid = createGame({ roomCode: 'COURT1' });
  invalid = addPlayer(invalid, { id: 'p1', name: 'Aaron Wang' });
  invalid = addPlayer(invalid, { id: 'p2', name: 'Maya Chen' });
  assert.throws(() => startGame(invalid, { matchDurationSeconds: 300 }), /game length/i);
});

test('an unlimited match never expires automatically', () => {
  let game = createGame({ roomCode: 'COURT1' });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang' });
  game = addPlayer(game, { id: 'p2', name: 'Maya Chen' });
  game = startGame(game, { now: 1_000, matchDurationSeconds: null });

  game = finishExpiredGame(game, 99_999_999);
  assert.equal(game.status, 'playing');
  assert.equal(game.winnerId, null);
});

test('players can trade points, teams, or both through an accepted offer', () => {
  let game = fourPlayerGame();
  game.assets['space-1'].ownerId = 'p1';
  game.assets['space-3'].ownerId = 'p2';
  game = createTradeOffer(game, 'p1', {
    recipientId: 'p2', offeredPoints: 120, requestedPoints: 40,
    offeredAssetIds: ['space-1'], requestedAssetIds: ['space-3'],
  });
  const offer = game.tradeOffers[0];
  assert.equal(offer.status, 'pending');

  game = respondToTradeOffer(game, 'p2', offer.id, true);
  assert.equal(game.players[0].points, 1420);
  assert.equal(game.players[1].points, 1580);
  assert.equal(game.assets['space-1'].ownerId, 'p2');
  assert.equal(game.assets['space-3'].ownerId, 'p1');
  assert.equal(game.tradeOffers[0].status, 'accepted');
});

test('trade offers reject invalid assets, overspending, and responses from strangers', () => {
  let game = fourPlayerGame();
  game.assets['space-1'].ownerId = 'p1';
  game.assets['space-1'].stars = 1;
  assert.throws(() => createTradeOffer(game, 'p1', { recipientId: 'p2', offeredAssetIds: ['space-1'] }), /developed/i);
  assert.throws(() => createTradeOffer(game, 'p1', { recipientId: 'p2', offeredPoints: 2000 }), /enough points/i);
  game.assets['space-1'].stars = 0;
  game = createTradeOffer(game, 'p1', { recipientId: 'p2', offeredPoints: 50 });
  assert.throws(() => respondToTradeOffer(game, 'p3', game.tradeOffers[0].id, true), /recipient/i);
});

test('an insolvent player can declare bankruptcy and return assets to the bank', () => {
  let game = fourPlayerGame();
  game.players[0].points = 0;
  game.assets['space-1'].ownerId = 'p1';
  game.assets['space-1'].mortgaged = true;
  game = declareBankruptcy(game, 'p1');
  assert.equal(game.players[0].active, false);
  assert.equal(game.assets['space-1'].ownerId, null);
  assert.equal(game.assets['space-1'].mortgaged, false);
  assert.throws(() => declareBankruptcy(game, 'p2'), /still has/i);
});

test('rolling moves the current player and creates a sign-team decision', () => {
  const game = fourPlayerGame();
  const next = rollDice(game, 'p1', [1, 2]);

  assert.equal(next.players[0].position, 3);
  assert.deepEqual(next.lastRoll, [1, 2]);
  assert.equal(next.pendingDecision.type, 'sign_team');
  assert.equal(next.pendingDecision.playerId, 'p1');
  assert.equal(next.phase, 'decision');
});

test('signing a team pays its fixed price and declining starts a five-second auction', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  const team = game.board[3];
  const signed = resolvePendingDecision(game, 'p1', { choice: 'sign' });

  assert.equal(signed.assets[team.id].ownerId, 'p1');
  assert.equal(signed.players[0].points, 1500 - team.price);
  assert.equal(signed.pendingDecision, null);

  let declinedGame = fourPlayerGame();
  declinedGame = rollDice(declinedGame, 'p1', [1, 2]);
  declinedGame = resolvePendingDecision(declinedGame, 'p1', { choice: 'decline', now: 1_000 });

  assert.equal(declinedGame.assets[team.id].ownerId, null);
  assert.equal(declinedGame.pendingDecision, null);
  assert.equal(declinedGame.phase, 'auction');
  assert.deepEqual(declinedGame.auction, {
    spaceId: team.id,
    declinedByPlayerId: 'p1',
    highBidderId: null,
    highBid: 0,
    endsAt: 6_000,
  });
});

test('auction accepts repeated +2, +50, and +100 bids and resets its five-second clock', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  game = resolvePendingDecision(game, 'p1', { choice: 'decline', now: 1_000 });

  game = placeAuctionBid(game, 'p2', 50, { now: 2_000 });
  assert.equal(game.auction.highBid, 50);
  assert.equal(game.auction.highBidderId, 'p2');
  assert.equal(game.auction.endsAt, 7_000);

  game = placeAuctionBid(game, 'p3', 2, { now: 3_000 });
  assert.equal(game.auction.highBid, 52);
  assert.equal(game.auction.highBidderId, 'p3');
  assert.equal(game.auction.endsAt, 8_000);
  game = placeAuctionBid(game, 'p1', 100, { now: 3_100 });
  assert.equal(game.auction.highBidderId, 'p1');
  assert.equal(game.auction.highBid, 152);
  game = placeAuctionBid(game, 'p2', 100, { now: 4_000 });
  assert.equal(game.auction.highBid, 252);
  assert.equal(game.auction.endsAt, 9_000);
  assert.throws(() => placeAuctionBid(game, 'p4', 10, { now: 3_100 }), /2, 50, or 100/i);
});

test('auction awards the asset to the high bidder and charges the winning amount', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  game = resolvePendingDecision(game, 'p1', { choice: 'decline', now: 1_000 });
  game = placeAuctionBid(game, 'p2', 100, { now: 2_000 });
  game = finalizeAuction(game, { now: 7_000 });

  assert.equal(game.assets['space-3'].ownerId, 'p2');
  assert.equal(game.players[1].points, 1_400);
  assert.equal(game.phase, 'end_turn');
  assert.equal(game.auction, null);
  assert.ok(game.log.some((entry) => entry.type === 'auction_won' && entry.amount === 100));
});

test('an auction with no bids ends with the asset still available', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  game = resolvePendingDecision(game, 'p1', { choice: 'decline', now: 1_000 });
  game = finalizeAuction(game, { now: 6_000 });

  assert.equal(game.assets['space-3'].ownerId, null);
  assert.equal(game.phase, 'end_turn');
  assert.ok(game.log.some((entry) => entry.type === 'auction_unsold'));
});

test('landing on an opponent team transfers revenue', () => {
  let game = fourPlayerGame();
  const team = game.board[3];
  game.assets[team.id].ownerId = 'p2';
  game = rollDice(game, 'p1', [1, 2]);

  assert.equal(game.players[0].points, 1500 - team.revenue[0]);
  assert.equal(game.players[1].points, 1500 + team.revenue[0]);
  assert.equal(game.pendingDecision, null);
});

test('a roll records every travelled block for step-by-step movement', () => {
  let game = fourPlayerGame();
  game.players[0].position = 38;

  game = rollDice(game, 'p1', [2, 2]);

  const roll = game.log.find((entry) => entry.type === 'roll');
  assert.equal(roll.fromPosition, 38);
  assert.deepEqual(roll.path, [39, 0, 1, 2]);
});

test('paying an opponent records a detailed courtside payment event', () => {
  let game = fourPlayerGame();
  const team = game.board[3];
  game.assets[team.id].ownerId = 'p2';

  game = rollDice(game, 'p1', [1, 2]);

  const payment = game.log.find((entry) => entry.type === 'payment');
  assert.deepEqual(payment, {
    type: 'payment',
    playerId: 'p1',
    recipientId: 'p2',
    amount: team.revenue[0],
    spaceId: team.id,
  });
});

test('every special board space includes a player-facing explanation', () => {
  const game = createGame({ roomCode: 'COURT1' });
  const specialSpaces = game.board.filter((space) => space.type !== 'team');

  assert.ok(specialSpaces.length > 0);
  for (const space of specialSpaces) {
    assert.equal(typeof space.description, 'string', `${space.name} needs a description`);
    assert.ok(space.description.length > 20, `${space.name} description is too short`);
  }
});

test('passing Tip-Off awards 200 points and records a lap', () => {
  let game = fourPlayerGame();
  game.players[0].position = 38;
  game = rollDice(game, 'p1', [1, 2]);

  assert.equal(game.players[0].position, 1);
  assert.equal(game.players[0].points, 1700);
  assert.equal(game.players[0].laps, 1);
});

test('landing exactly on Tip-Off awards 300 points when movement ends', () => {
  let game = fourPlayerGame();
  game.players[0].position = 38;

  game = rollDice(game, 'p1', [1, 1]);

  assert.equal(game.players[0].position, 0);
  assert.equal(game.players[0].points, 1800);
  assert.equal(game.players[0].laps, 1);
  assert.ok(game.log.some((entry) => entry.type === 'points_awarded' && entry.amount === 300 && entry.playerId === 'p1'));
});

test('passing Tip-Off records the 200 point award in game history', () => {
  let game = fourPlayerGame();
  game.players[0].position = 38;

  game = rollDice(game, 'p1', [1, 2]);

  assert.ok(game.log.some((entry) => entry.type === 'points_awarded' && entry.amount === 200 && entry.reason === 'tipoff'));
});

test('crossing Tip-Off never ends the match before the timer', () => {
  let game = createGame({ roomCode: 'COURT1', lapsToWin: 1 });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang' });
  game = addPlayer(game, { id: 'p2', name: 'Maya Chen' });
  game = startGame(game, { firstPlayerIndex: 0 });
  game.players[0].position = 38;

  game = rollDice(game, 'p1', [1, 2]);

  assert.equal(game.status, 'playing');
  assert.equal(game.winnerId, null);
  assert.equal(game.players[0].laps, 1);
  assert.equal(game.log.some((entry) => entry.type === 'champion'), false);
});

test('a complete division can recruit evenly and form a championship lineup', () => {
  let game = fourPlayerGame();
  const divisionTeams = game.board.filter(
    (space) => space.type === 'team' && space.group === 'rookie',
  );
  for (const team of divisionTeams) game.assets[team.id].ownerId = 'p1';

  game = recruitStar(game, 'p1', divisionTeams[0].id);
  assert.equal(game.assets[divisionTeams[0].id].stars, 1);
  assert.throws(() => recruitStar(game, 'p1', divisionTeams[0].id), /develop evenly/i);

  game = recruitStar(game, 'p1', divisionTeams[1].id);
  for (let level = 2; level <= 5; level += 1) {
    game = recruitStar(game, 'p1', divisionTeams[0].id);
    game = recruitStar(game, 'p1', divisionTeams[1].id);
  }

  assert.equal(game.assets[divisionTeams[0].id].championship, true);
  assert.equal(game.assets[divisionTeams[0].id].stars, 0);
});

test('mortgaging an undeveloped team pays its mortgage value and disables revenue', () => {
  let game = fourPlayerGame();
  const team = game.board.find((space) => space.type === 'team');
  game.assets[team.id].ownerId = 'p1';

  game = mortgageAsset(game, 'p1', team.id);

  assert.equal(game.assets[team.id].mortgaged, true);
  assert.equal(game.players[0].points, 1500 + team.mortgage);
});

test('end turn advances to the next active player', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  game = resolvePendingDecision(game, 'p1', { choice: 'sign' });
  game = endTurn(game, 'p1');

  assert.equal(game.currentPlayerIndex, 1);
  assert.equal(game.phase, 'roll');
});

test('rolling doubles lets the same player roll again after resolving the space', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [2, 2]);
  assert.equal(game.extraRollPending, true);
  game = endTurn(game, 'p1', { now: 5_000 });
  assert.equal(game.currentPlayerIndex, 0);
  assert.equal(game.phase, 'roll');
  assert.equal(game.extraRollPending, false);
  assert.ok(game.log.some((entry) => entry.type === 'extra_roll' && entry.playerId === 'p1'));
});

test('a non-double roll still passes play to the next active player', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [3, 4]);
  game = endTurn(game, 'p1');
  assert.equal(game.currentPlayerIndex, 1);
});

test('ending a turn resets the authoritative shot clock for the next player', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 2]);
  game = resolvePendingDecision(game, 'p1', { choice: 'sign' });

  game = endTurn(game, 'p1', { now: 42_000 });

  assert.equal(game.turnStartedAt, 42_000);
  assert.equal(game.turnDurationSeconds, 18);
});

test('public game snapshots never expose private player data', () => {
  let game = createGame({ roomCode: 'COURT1' });
  game = addPlayer(game, { id: 'p1', name: 'Aaron Wang', token: 'top-secret' });

  const snapshot = getPublicGame(game);

  assert.equal(snapshot.players[0].name, 'Aaron Wang');
  assert.equal('token' in snapshot.players[0], false);
});

test('routes can be signed and charge network revenue', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [2, 3]);
  assert.equal(game.pendingDecision.type, 'sign_asset');
  game = resolvePendingDecision(game, 'p1', { choice: 'sign' });
  assert.equal(game.assets['space-5'].ownerId, 'p1');

  game = endTurn(game, 'p1');
  game.players[1].position = 2;
  game = rollDice(game, 'p2', [1, 2]);
  assert.equal(game.players[1].points, 1475);
  assert.equal(game.log.at(-1).amount, 25);
});

test('training labs can be signed and charge dice-based revenue', () => {
  let game = fourPlayerGame();
  game.assets['space-12'].ownerId = 'p2';
  game = rollDice(game, 'p1', [6, 6]);
  assert.equal(game.players[0].points, 1500 - 48);
  assert.equal(game.players[1].points, 1500 + 48);
});

test('special spaces draw a deterministic shared card and apply its points', () => {
  let game = fourPlayerGame();
  game = rollDice(game, 'p1', [1, 1], { cardIndex: 0 });
  const card = game.log.find((entry) => entry.type === 'card');
  assert.equal(card.deck, 'operations');
  assert.equal(card.title, 'Sponsorship Deal');
  assert.equal(game.players[0].points, 1600);
});

test('named prospects are recruitable once across the league', () => {
  assert.equal(RECRUITABLE_PLAYERS.length, 8);
  let game = fourPlayerGame();
  const teams = game.board.filter((space) => space.group === 'rookie');
  teams.forEach((team) => { game.assets[team.id].ownerId = 'p1'; });

  game = recruitStar(game, 'p1', teams[0].id, 'Stephen Curry');
  assert.deepEqual(game.assets[teams[0].id].recruits, ['Stephen Curry']);
  assert.ok(game.log.some((entry) => entry.type === 'recruited' && entry.playerName === 'Stephen Curry' && entry.cost === 200));
  assert.throws(() => recruitStar(game, 'p1', teams[1].id, 'Stephen Curry'), /already recruited/i);
});

test('a match lasts ten minutes and the highest points player wins at expiry', () => {
  let game = fourPlayerGame();
  game.matchStartedAt = 1_000;
  game.players[1].points = 1800;
  game = finishExpiredGame(game, 601_000);
  assert.equal(game.status, 'finished');
  assert.equal(game.winnerId, 'p2');
  assert.equal(game.finishReason, 'time');
});

test('a broke player stays active until they declare bankruptcy', () => {
  let game = fourPlayerGame();
  game.players[0].points = 20;
  game = rollDice(game, 'p1', [2, 2]);
  assert.equal(game.players[0].points, 0);
  assert.equal(game.players[0].active, true);
  game = declareBankruptcy(game, 'p1');
  assert.equal(game.players[0].active, false);
  assert.ok(game.log.some((entry) => entry.type === 'bankrupt' && entry.playerId === 'p1'));
});

test('a broke player stays active while an asset can still be mortgaged', () => {
  let game = fourPlayerGame();
  game.players[0].points = 20;
  game.assets['space-1'].ownerId = 'p1';
  game = rollDice(game, 'p1', [2, 2]);
  assert.equal(game.players[0].active, true);
});
