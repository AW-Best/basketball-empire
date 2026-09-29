'use strict';

const BOARD_SIZE = 40;
const STARTING_POINTS = 1500;
const TIP_OFF_BONUS = 200;
const TIP_OFF_EXACT_LANDING_BONUS = 300;
const MAX_PLAYERS = 4;
const TURN_DURATION_SECONDS = 18;
const MATCH_DURATION_SECONDS = 10 * 60;
const AUCTION_DURATION_MS = 5_000;
const AUCTION_INCREMENTS = [2, 50, 100];
const ROUTE_REVENUE = [25, 50, 100, 200];

const RECRUITABLE_PLAYERS = [
  { name: 'Stephen Curry', role: 'Shooter', rating: 96, cost: 200, skill: 'Deep-range boost' },
  { name: 'LeBron James', role: 'Playmaker', rating: 97, cost: 200, skill: 'All-court leadership' },
  { name: 'Nikola Jokić', role: 'Center', rating: 98, cost: 200, skill: 'Elite passing' },
  { name: 'Giannis Antetokounmpo', role: 'Finisher', rating: 97, cost: 200, skill: 'Paint dominance' },
  { name: 'Luka Dončić', role: 'Creator', rating: 96, cost: 150, skill: 'Clutch shotmaking' },
  { name: 'Victor Wembanyama', role: 'Defender', rating: 94, cost: 150, skill: 'Rim protection' },
  { name: 'Kevin Durant', role: 'Scorer', rating: 96, cost: 175, skill: 'Unstoppable pull-up' },
  { name: 'Jayson Tatum', role: 'Wing', rating: 95, cost: 175, skill: 'Two-way versatility' },
];

const TEAM_OPERATIONS_CARDS = [
  { title: 'Sponsorship Deal', description: 'A new sponsor backs your franchise.', amount: 100 },
  { title: 'Training Camp', description: 'Pay for an elite preseason camp.', amount: -50 },
  { title: 'Jersey Sellout', description: 'Your newest jersey flies off the shelves.', amount: 75 },
  { title: 'Community Clinic', description: 'Support young players in your city.', amount: -25 },
];

const GAME_TIME_CARDS = [
  { title: 'Buzzer Beater', description: 'The arena erupts after your game winner.', amount: 80 },
  { title: 'Technical Foul', description: 'A heated protest costs the franchise.', amount: -40 },
  { title: 'Hot Streak', description: 'Three straight wins boost your momentum.', amount: 60 },
  { title: 'Minor Injury', description: 'Treatment and recovery come first.', amount: -50 },
];

const TEAM_GROUPS = [
  { group: 'rookie', names: ['Harbor Sharks', 'Metro Comets'], prices: [60, 60], recruitCost: 50 },
  { group: 'rising', names: ['Desert Scorpions', 'Bay City Waves', 'Capital Kings'], prices: [100, 100, 120], recruitCost: 50 },
  { group: 'urban', names: ['Summit Hawks', 'River City Foxes', 'Orlando Orbit'], prices: [140, 140, 160], recruitCost: 100 },
  { group: 'elite', names: ['Brooklyn Beats', 'Austin Arrows', 'Seattle Stormers'], prices: [180, 180, 200], recruitCost: 100 },
  { group: 'prime', names: ['Chicago Charge', 'Philly Phantoms', 'Miami Blaze'], prices: [220, 220, 240], recruitCost: 150 },
  { group: 'allstar', names: ['Denver Peaks', 'Phoenix Flight', 'Dallas Dynamos'], prices: [260, 260, 280], recruitCost: 150 },
  { group: 'legends', names: ['Vegas Vipers', 'Toronto Towers', 'Golden Guardians'], prices: [300, 300, 320], recruitCost: 200 },
  { group: 'dynasty', names: ['Hollywood Stars', 'Empire Elite'], prices: [350, 400], recruitCost: 200 },
];

const TEAM_BY_NAME = new Map(
  TEAM_GROUPS.flatMap((division) => division.names.map((name, index) => [name, {
    group: division.group,
    price: division.prices[index],
    recruitCost: division.recruitCost,
  }])),
);

const BOARD_LAYOUT = [
  ['Tip-Off', 'tipoff'], ['Harbor Sharks', 'team'], ['Team Operations', 'operations'], ['Metro Comets', 'team'], ['League Fees', 'fee'],
  ['East Route', 'route'], ['Desert Scorpions', 'team'], ['Game Time', 'moment'], ['Bay City Waves', 'team'], ['Capital Kings', 'team'],
  ['The Bench', 'bench'], ['Summit Hawks', 'team'], ['Offense Lab', 'training'], ['River City Foxes', 'team'], ['Orlando Orbit', 'team'],
  ['All-Star Route', 'route'], ['Brooklyn Beats', 'team'], ['Team Operations', 'operations'], ['Austin Arrows', 'team'], ['Seattle Stormers', 'team'],
  ['Locker Room', 'locker_room'], ['Chicago Charge', 'team'], ['Game Time', 'moment'], ['Philly Phantoms', 'team'], ['Miami Blaze', 'team'],
  ['West Route', 'route'], ['Denver Peaks', 'team'], ['Phoenix Flight', 'team'], ['Defense Lab', 'training'], ['Dallas Dynamos', 'team'],
  ['Ejected', 'ejected'], ['Vegas Vipers', 'team'], ['Toronto Towers', 'team'], ['Team Operations', 'operations'], ['Golden Guardians', 'team'],
  ['Finals Route', 'route'], ['Game Time', 'moment'], ['Hollywood Stars', 'team'], ['Luxury Tax', 'fee'], ['Empire Elite', 'team'],
];

const SPACE_DESCRIPTIONS = {
  tipoff: 'Collect 200 points when you pass Tip-Off, or 300 points when your final move lands exactly here.',
  operations: 'Draw a Team Operations card for a front-office event such as sponsorship income, training costs, or a roster move.',
  fee: 'Pay the amount printed on the space to the league bank. League Fees cost 20 points and Luxury Tax costs 100 points.',
  route: 'A travel network asset. Routes connect your road schedule; owning more routes increases the revenue opponents owe when they land here.',
  moment: 'Draw a Game Time card for an instant basketball moment such as a hot streak, buzzer-beater, injury, or foul.',
  bench: 'Take a breather on The Bench. Landing here is only a visit, so your next turn continues normally.',
  training: 'A specialist development facility. Offense Lab and Defense Lab can strengthen a franchise and create training revenue.',
  locker_room: 'Reset and refocus in the Locker Room. This is a safe corner with no payment or penalty.',
  ejected: 'Move directly to The Bench without collecting a Tip-Off bonus. Your franchise assets still earn revenue.',
};

function makeBoard() {
  return BOARD_LAYOUT.map(([name, type], index) => {
    const base = { id: `space-${index}`, index, name, type };
    if (type === 'team') {
      const team = TEAM_BY_NAME.get(name);
      return {
        ...base,
        ...team,
        mortgage: Math.floor(team.price / 2),
        revenue: [Math.max(2, Math.round(team.price / 10)), team.recruitCost, team.recruitCost * 2, team.recruitCost * 3, team.recruitCost * 4, team.recruitCost * 6],
      };
    }
    if (type === 'route') return { ...base, price: 200, mortgage: 100, description: SPACE_DESCRIPTIONS.route };
    if (type === 'training') return { ...base, price: 150, mortgage: 75, description: SPACE_DESCRIPTIONS.training };
    return { ...base, description: SPACE_DESCRIPTIONS[type] };
  });
}

function clone(value) {
  return structuredClone(value);
}

function createInitials(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return '?';
  const words = cleanName.split(/[\s-]+/u).filter(Boolean);
  if (words.length > 1) return `${Array.from(words[0])[0]}${Array.from(words.at(-1))[0]}`.toUpperCase();
  const characters = Array.from(cleanName);
  if (characters.some((character) => character.codePointAt(0) > 127)) return characters.slice(0, 2).join('');
  return characters[0].toUpperCase();
}

function normalizeAvatar(avatarDataUrl) {
  if (avatarDataUrl == null || avatarDataUrl === '') return null;
  const value = String(avatarDataUrl);
  if (value.length > 50_000 || !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/u.test(value)) {
    throw new Error('Avatar must be a small JPEG, PNG, or WebP image.');
  }
  return value;
}

function createGame({ roomCode, lapsToWin = 4 } = {}) {
  const board = makeBoard();
  const assets = Object.fromEntries(
    board
      .filter((space) => ['team', 'route', 'training'].includes(space.type))
      .map((space) => [space.id, { ownerId: null, mortgaged: false, stars: 0, championship: false, recruits: [] }]),
  );
  return {
    roomCode: String(roomCode || '').toUpperCase(),
    lapsToWin,
    status: 'lobby',
    phase: 'lobby',
    players: [],
    board,
    assets,
    currentPlayerIndex: 0,
    winnerId: null,
    lastRoll: null,
    pendingDecision: null,
    auction: null,
    turn: 0,
    turnDurationSeconds: TURN_DURATION_SECONDS,
    turnStartedAt: null,
    matchDurationSeconds: MATCH_DURATION_SECONDS,
    matchStartedAt: null,
    finishReason: null,
    log: [],
  };
}

function addPlayer(game, playerInput) {
  if (game.status !== 'lobby') throw new Error('Players can only join in the lobby.');
  if (game.players.length >= MAX_PLAYERS) throw new Error('This room is full.');
  const name = String(playerInput.name || '').trim();
  if (!playerInput.id || !name) throw new Error('Player id and name are required.');
  if (game.players.some((player) => player.id === playerInput.id)) throw new Error('Player already joined.');
  const next = clone(game);
  next.players.push({
    id: playerInput.id,
    name,
    initials: createInitials(name),
    avatarDataUrl: normalizeAvatar(playerInput.avatarDataUrl),
    color: playerInput.color || '#f26a21',
    token: playerInput.token,
    ready: false,
    active: true,
    points: STARTING_POINTS,
    position: 0,
    laps: 0,
  });
  return next;
}

function startGame(game, { firstPlayerIndex = 0, now = Date.now(), matchDurationSeconds = MATCH_DURATION_SECONDS } = {}) {
  if (game.players.length < 2) throw new Error('At least two players are required to start.');
  if (firstPlayerIndex < 0 || firstPlayerIndex >= game.players.length) throw new Error('Invalid first player.');
  if (![600, 900, 1200, null].includes(matchDurationSeconds)) throw new Error('Choose a valid game length.');
  const next = clone(game);
  next.status = 'playing';
  next.phase = 'roll';
  next.currentPlayerIndex = firstPlayerIndex;
  next.turnStartedAt = now;
  next.matchStartedAt = now;
  next.matchDurationSeconds = matchDurationSeconds;
  next.players.forEach((player) => {
    player.points = STARTING_POINTS;
    player.position = 0;
    player.laps = 0;
  });
  return next;
}

function finishWithWinner(next, winnerId, reason) {
  next.status = 'finished';
  next.phase = 'finished';
  next.winnerId = winnerId;
  next.finishReason = reason;
  next.pendingDecision = null;
  next.auction = null;
  next.log.push({ type: 'champion', playerId: winnerId, reason });
  return next;
}

function finishExpiredGame(game, now = Date.now()) {
  if (game.status !== 'playing' || !game.matchStartedAt || game.matchDurationSeconds == null || now < game.matchStartedAt + game.matchDurationSeconds * 1000) return game;
  const next = clone(game);
  const eligible = next.players.filter((player) => player.active);
  const winner = eligible.reduce((leader, player) => (!leader || player.points > leader.points ? player : leader), null);
  return finishWithWinner(next, winner?.id || null, 'time');
}

function finishGameByHost(game) {
  if (game.status !== 'playing') throw new Error('Only an active match can be ended.');
  const next = clone(game);
  const eligible = next.players.filter((player) => player.active);
  const winner = eligible.reduce((leader, player) => (!leader || player.points > leader.points ? player : leader), null);
  return finishWithWinner(next, winner?.id || null, 'host_ended');
}

function eliminateBankruptPlayers(next) {
  next.players.forEach((player) => {
    if (!player.active || player.points > 0) return;
    const canMortgage = next.board.some((space) => {
      const asset = next.assets[space.id];
      return asset?.ownerId === player.id && !asset.mortgaged && !asset.championship && asset.stars === 0;
    });
    if (!canMortgage) {
      player.active = false;
      next.log.push({ type: 'eliminated', playerId: player.id });
    }
  });
  const survivors = next.players.filter((player) => player.active);
  if (next.players.length > 1 && survivors.length === 1) finishWithWinner(next, survivors[0].id, 'last_player');
  return next;
}

function requireTurn(game, playerId, expectedPhase) {
  if (game.status !== 'playing') throw new Error('The game has not started.');
  const current = game.players[game.currentPlayerIndex];
  if (!current || current.id !== playerId) throw new Error('It is not your turn.');
  if (expectedPhase && game.phase !== expectedPhase) throw new Error(`Cannot act during the ${game.phase} phase.`);
}

function drawCard(next, player, space, options) {
  const deckName = space.type === 'operations' ? 'operations' : 'game_time';
  const deck = space.type === 'operations' ? TEAM_OPERATIONS_CARDS : GAME_TIME_CARDS;
  const requestedIndex = Number.isInteger(options.cardIndex) ? options.cardIndex : Math.floor(Math.random() * deck.length);
  const card = deck[((requestedIndex % deck.length) + deck.length) % deck.length];
  const before = player.points;
  player.points = Math.max(0, player.points + card.amount);
  next.log.push({
    type: 'card', playerId: player.id, spaceId: space.id, deck: deckName,
    title: card.title, description: card.description, amount: player.points - before,
  });
}

function assetRevenue(next, space, asset, dice) {
  if (space.type === 'team') return space.revenue[developmentLevel(asset)];
  if (space.type === 'route') {
    const routeCount = next.board.filter((candidate) => candidate.type === 'route' && next.assets[candidate.id].ownerId === asset.ownerId).length;
    return ROUTE_REVENUE[Math.max(0, routeCount - 1)];
  }
  const labCount = next.board.filter((candidate) => candidate.type === 'training' && next.assets[candidate.id].ownerId === asset.ownerId).length;
  return (dice[0] + dice[1]) * (labCount === 2 ? 10 : 4);
}

function rollDice(game, playerId, dice, options = {}) {
  requireTurn(game, playerId, 'roll');
  const roll = dice || [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
  if (!Array.isArray(roll) || roll.length !== 2 || roll.some((value) => !Number.isInteger(value) || value < 1 || value > 6)) {
    throw new Error('Dice must contain two values from 1 to 6.');
  }
  const next = clone(game);
  const player = next.players[next.currentPlayerIndex];
  const move = roll[0] + roll[1];
  const fromPosition = player.position;
  const rawPosition = fromPosition + move;
  const path = Array.from({ length: move }, (_, index) => (fromPosition + index + 1) % BOARD_SIZE);
  let pointsAward = null;
  if (rawPosition >= BOARD_SIZE) {
    pointsAward = rawPosition % BOARD_SIZE === 0 ? TIP_OFF_EXACT_LANDING_BONUS : TIP_OFF_BONUS;
    player.points += pointsAward;
    player.laps += 1;
  }
  player.position = rawPosition % BOARD_SIZE;
  next.lastRoll = [...roll];
  next.pendingDecision = null;
  next.phase = 'end_turn';

  const space = next.board[player.position];
  let payment = null;
  if (['team', 'route', 'training'].includes(space.type)) {
    const asset = next.assets[space.id];
    if (!asset.ownerId) {
      next.pendingDecision = { type: space.type === 'team' ? 'sign_team' : 'sign_asset', playerId, spaceId: space.id };
      next.phase = 'decision';
    } else if (asset.ownerId !== playerId && !asset.mortgaged) {
      const owner = next.players.find((candidate) => candidate.id === asset.ownerId);
      const revenue = Math.min(player.points, assetRevenue(next, space, asset, roll));
      player.points -= revenue;
      if (owner) owner.points += revenue;
      payment = { type: 'payment', playerId, recipientId: asset.ownerId, amount: revenue, spaceId: space.id };
    }
  } else if (['operations', 'moment'].includes(space.type)) {
    drawCard(next, player, space, options);
  } else if (space.type === 'ejected') {
    player.position = 10;
  } else if (space.type === 'fee') {
    const fee = space.index === 38 ? 100 : 20;
    player.points = Math.max(0, player.points - fee);
  }
  next.log.push({ type: 'roll', playerId, dice: [...roll], fromPosition, path, position: player.position });
  if (pointsAward) next.log.push({ type: 'points_awarded', playerId, amount: pointsAward, reason: 'tipoff' });
  if (payment) next.log.push(payment);
  return eliminateBankruptPlayers(next);
}

function resolvePendingDecision(game, playerId, { choice, now = Date.now() } = {}) {
  requireTurn(game, playerId, 'decision');
  if (!game.pendingDecision || game.pendingDecision.playerId !== playerId) throw new Error('No decision is waiting for this player.');
  if (!['sign', 'decline'].includes(choice)) throw new Error('Choose sign or decline.');
  const next = clone(game);
  const decision = next.pendingDecision;
  const space = next.board.find((candidate) => candidate.id === decision.spaceId);
  const player = next.players[next.currentPlayerIndex];
  if (choice === 'sign') {
    if (player.points < space.price) throw new Error('Not enough points to sign this asset.');
    const asset = next.assets[space.id];
    if (asset.ownerId) throw new Error('This asset is already signed.');
    player.points -= space.price;
    asset.ownerId = playerId;
  }
  next.pendingDecision = null;
  if (choice === 'decline') {
    next.auction = {
      spaceId: space.id,
      declinedByPlayerId: playerId,
      highBidderId: null,
      highBid: 0,
      endsAt: now + AUCTION_DURATION_MS,
    };
    next.phase = 'auction';
  } else {
    next.phase = 'end_turn';
  }
  next.log.push({ type: choice === 'sign' ? 'signed' : 'declined', playerId, spaceId: space.id });
  return eliminateBankruptPlayers(next);
}

function placeAuctionBid(game, playerId, increment, { now = Date.now() } = {}) {
  if (game.status !== 'playing' || game.phase !== 'auction' || !game.auction) throw new Error('There is no active auction.');
  if (now >= game.auction.endsAt) throw new Error('This auction has ended.');
  if (!AUCTION_INCREMENTS.includes(increment)) throw new Error('Bid increments must be 2, 50, or 100 points.');
  const bidder = game.players.find((player) => player.id === playerId);
  if (!bidder || !bidder.active) throw new Error('Only active players may bid.');
  const nextBid = game.auction.highBid + increment;
  if (bidder.points < nextBid) throw new Error('Not enough points for that bid.');

  const next = clone(game);
  next.auction.highBid = nextBid;
  next.auction.highBidderId = playerId;
  next.auction.endsAt = now + AUCTION_DURATION_MS;
  next.log.push({ type: 'auction_bid', playerId, spaceId: next.auction.spaceId, amount: nextBid, increment });
  return next;
}

function finalizeAuction(game, { now = Date.now() } = {}) {
  if (game.status !== 'playing' || game.phase !== 'auction' || !game.auction) throw new Error('There is no active auction.');
  if (now < game.auction.endsAt) throw new Error('Auction is still open.');
  const next = clone(game);
  const auction = next.auction;
  if (auction.highBidderId) {
    const winner = next.players.find((player) => player.id === auction.highBidderId);
    if (!winner || winner.points < auction.highBid) throw new Error('Winning bidder cannot pay the bid.');
    winner.points -= auction.highBid;
    next.assets[auction.spaceId].ownerId = winner.id;
    next.log.push({ type: 'auction_won', playerId: winner.id, spaceId: auction.spaceId, amount: auction.highBid });
  } else {
    next.log.push({ type: 'auction_unsold', playerId: auction.declinedByPlayerId, spaceId: auction.spaceId });
  }
  next.auction = null;
  next.phase = 'end_turn';
  return eliminateBankruptPlayers(next);
}

function developmentLevel(asset) {
  return asset.championship ? 5 : asset.stars;
}

function recruitStar(game, playerId, assetId, playerName) {
  requireTurn(game, playerId);
  const next = clone(game);
  const space = next.board.find((candidate) => candidate.id === assetId && candidate.type === 'team');
  const asset = next.assets[assetId];
  if (!space || !asset || asset.ownerId !== playerId) throw new Error('You do not own this team.');
  const division = next.board.filter((candidate) => candidate.type === 'team' && candidate.group === space.group);
  if (!division.every((team) => next.assets[team.id].ownerId === playerId)) throw new Error('Complete the division before recruiting.');
  if (asset.mortgaged || asset.championship) throw new Error('This team cannot recruit another star.');
  const currentLevel = developmentLevel(asset);
  const lowestLevel = Math.min(...division.map((team) => developmentLevel(next.assets[team.id])));
  if (currentLevel > lowestLevel) throw new Error('Teams in a division must develop evenly.');
  const player = next.players.find((candidate) => candidate.id === playerId);
  const prospect = playerName ? RECRUITABLE_PLAYERS.find((candidate) => candidate.name === playerName) : null;
  if (playerName && !prospect) throw new Error('This player is not on the scouting board.');
  if (playerName && Object.values(next.assets).some((candidate) => candidate.recruits.includes(playerName))) {
    throw new Error('This player is already recruited.');
  }
  const cost = prospect?.cost || space.recruitCost;
  if (player.points < cost) throw new Error('Not enough points to recruit.');
  player.points -= cost;
  if (playerName) asset.recruits.push(playerName);
  if (asset.stars === 4) {
    asset.stars = 0;
    asset.championship = true;
  } else {
    asset.stars += 1;
  }
  next.log.push({
    type: 'recruited', playerId, spaceId: assetId, playerName: playerName || 'Star Player', cost,
    landingRevenue: space.revenue[developmentLevel(asset)],
  });
  return eliminateBankruptPlayers(next);
}

function mortgageAsset(game, playerId, assetId) {
  const next = clone(game);
  const space = next.board.find((candidate) => candidate.id === assetId);
  const asset = next.assets[assetId];
  if (!space || !asset || asset.ownerId !== playerId) throw new Error('You do not own this asset.');
  if (asset.mortgaged) throw new Error('This asset is already mortgaged.');
  if (asset.stars > 0 || asset.championship) throw new Error('Developed teams cannot be mortgaged.');
  asset.mortgaged = true;
  next.players.find((player) => player.id === playerId).points += space.mortgage;
  return next;
}

function endTurn(game, playerId, { now = Date.now() } = {}) {
  requireTurn(game, playerId, 'end_turn');
  const next = clone(game);
  let nextIndex = next.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % next.players.length;
  } while (!next.players[nextIndex].active && nextIndex !== next.currentPlayerIndex);
  next.currentPlayerIndex = nextIndex;
  next.phase = 'roll';
  next.lastRoll = null;
  next.turn += 1;
  next.turnStartedAt = now;
  return next;
}

function getPublicGame(game) {
  const snapshot = clone(game);
  snapshot.players = snapshot.players.map(({ token, ...player }) => player);
  return snapshot;
}

module.exports = {
  BOARD_SIZE,
  GAME_TIME_CARDS,
  RECRUITABLE_PLAYERS,
  TEAM_OPERATIONS_CARDS,
  addPlayer,
  createGame,
  createInitials,
  endTurn,
  finalizeAuction,
  finishExpiredGame,
  finishGameByHost,
  getPublicGame,
  mortgageAsset,
  placeAuctionBid,
  recruitStar,
  resolvePendingDecision,
  rollDice,
  startGame,
};
