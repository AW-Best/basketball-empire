const PLAYERS = [
  { name: 'Aaron Wang', initials: 'AW' },
  { name: 'Maya Chen', initials: 'MC' },
  { name: 'Leo Tan', initials: 'LT' },
  { name: '王小明', initials: '王小' },
];

const RECRUIT_COSTS = { cyan: 50, sky: 50, pink: 100, orange: 100, red: 150, yellow: 150, green: 200, navy: 200 };
const GROUP_BY_SERVER_NAME = { rookie: 'cyan', rising: 'sky', urban: 'pink', elite: 'orange', prime: 'red', allstar: 'yellow', legends: 'green', dynasty: 'navy' };
const SESSION_KEY = 'basketball-empire-session';
const SCOUTING_BOARD = [
  { name: 'Stephen Curry', role: 'Shooter', rating: 96, cost: 200, skill: 'Deep-range boost' },
  { name: 'LeBron James', role: 'Playmaker', rating: 97, cost: 200, skill: 'All-court leadership' },
  { name: 'Nikola Jokić', role: 'Center', rating: 98, cost: 200, skill: 'Elite passing' },
  { name: 'Giannis Antetokounmpo', role: 'Finisher', rating: 97, cost: 200, skill: 'Paint dominance' },
  { name: 'Luka Dončić', role: 'Creator', rating: 96, cost: 150, skill: 'Clutch shotmaking' },
  { name: 'Victor Wembanyama', role: 'Defender', rating: 94, cost: 150, skill: 'Rim protection' },
  { name: 'Kevin Durant', role: 'Scorer', rating: 96, cost: 175, skill: 'Unstoppable pull-up' },
  { name: 'Jayson Tatum', role: 'Wing', rating: 95, cost: 175, skill: 'Two-way versatility' },
];
const SPACE_GUIDES = {
  tipoff: { label: 'TIP-OFF', rule: '+300 PTS when you land exactly here; +200 PTS when you pass.' },
  operations: { label: 'TEAM OPERATIONS', rule: 'Draw one front-office event card and follow it immediately.' },
  fee: { label: 'LEAGUE PAYMENT', rule: 'Pay the printed amount to the league bank.' },
  route: { label: 'TRAVEL ROUTE', rule: 'Routes cost 200 PTS. A larger route network creates more travel revenue.' },
  moment: { label: 'GAME TIME', rule: 'Draw one basketball moment card and resolve its instant effect.' },
  bench: { label: 'THE BENCH', rule: 'Just visiting—there is no penalty when you land here normally.' },
  training: { label: 'TRAINING LAB', rule: 'Labs cost 150 PTS and represent offense or defense development.' },
  locker_room: { label: 'LOCKER ROOM', rule: 'A safe reset space. Nothing is paid or collected.' },
  ejected: { label: 'EJECTED', rule: 'Move directly to The Bench and do not collect the Tip-Off bonus.' },
};

const BOARD_SPACES = [
  { name: 'TIP-OFF', type: 'corner', icon: '▶', note: '+300 exact' },
  { name: 'Harbor Sharks', type: 'team', group: 'cyan', price: 60, logo: 'harbor-sharks' },
  { name: 'Team Ops', type: 'ops', icon: '☷' },
  { name: 'Metro Comets', type: 'team', group: 'cyan', price: 60, logo: 'metro-comets' },
  { name: 'League Fees', type: 'fee', icon: '−20' },
  { name: 'East Route', type: 'route', icon: '⟶', price: 200 },
  { name: 'Desert Scorpions', type: 'team', group: 'sky', price: 100, logo: 'desert-scorpions' },
  { name: 'Game Time', type: 'moment', icon: '!' },
  { name: 'Bay City Waves', type: 'team', group: 'sky', price: 100, logo: 'bay-city-waves' },
  { name: 'Capital Kings', type: 'team', group: 'sky', price: 120, logo: 'capital-kings' },
  { name: 'THE BENCH', type: 'corner', icon: '⌛', note: 'Just watching' },
  { name: 'Summit Hawks', type: 'team', group: 'pink', price: 140, logo: 'summit-hawks' },
  { name: 'Offense Lab', type: 'training', icon: '↗', price: 150 },
  { name: 'River City Foxes', type: 'team', group: 'pink', price: 140, logo: 'river-city-foxes' },
  { name: 'Orlando Orbit', type: 'team', group: 'pink', price: 160, logo: 'orlando-orbit' },
  { name: 'All-Star Route', type: 'route', icon: '★', price: 200 },
  { name: 'Brooklyn Beats', type: 'team', group: 'orange', price: 180, logo: 'brooklyn-beats' },
  { name: 'Team Ops', type: 'ops', icon: '☷' },
  { name: 'Austin Arrows', type: 'team', group: 'orange', price: 180, logo: 'austin-arrows' },
  { name: 'Seattle Stormers', type: 'team', group: 'orange', price: 200, logo: 'seattle-stormers' },
  { name: 'LOCKER ROOM', type: 'corner', icon: '◉', note: 'Reset & refocus' },
  { name: 'Chicago Charge', type: 'team', group: 'red', price: 220, logo: 'chicago-charge' },
  { name: 'Game Time', type: 'moment', icon: '!' },
  { name: 'Philly Phantoms', type: 'team', group: 'red', price: 220, logo: 'philly-phantoms' },
  { name: 'Miami Blaze', type: 'team', group: 'red', price: 240, logo: 'miami-blaze' },
  { name: 'West Route', type: 'route', icon: '⟶', price: 200 },
  { name: 'Denver Peaks', type: 'team', group: 'yellow', price: 260, logo: 'denver-peaks' },
  { name: 'Phoenix Flight', type: 'team', group: 'yellow', price: 260, logo: 'phoenix-flight' },
  { name: 'Defense Lab', type: 'training', icon: '⛨', price: 150 },
  { name: 'Dallas Dynamos', type: 'team', group: 'yellow', price: 280, logo: 'dallas-dynamos' },
  { name: 'EJECTED!', type: 'corner', icon: '✕', note: 'Go to the bench' },
  { name: 'Vegas Vipers', type: 'team', group: 'green', price: 300, logo: 'vegas-vipers' },
  { name: 'Toronto Towers', type: 'team', group: 'green', price: 300, logo: 'toronto-towers' },
  { name: 'Team Ops', type: 'ops', icon: '☷' },
  { name: 'Golden Guardians', type: 'team', group: 'green', price: 320, logo: 'golden-guardians' },
  { name: 'Finals Route', type: 'route', icon: '♛', price: 200 },
  { name: 'Game Time', type: 'moment', icon: '!' },
  { name: 'Hollywood Stars', type: 'team', group: 'navy', price: 350, logo: 'hollywood-stars' },
  { name: 'Luxury Tax', type: 'fee', icon: '−100' },
  { name: 'Empire Elite', type: 'team', group: 'navy', price: 400, logo: 'empire-elite' },
];

if (BOARD_SPACES.length !== 40) throw new Error('Basketball Empire board must contain 40 spaces.');

let room = null;
let session = readSession();
let eventSource = null;
let pollTimer = null;
let IS_LOCAL_PLAYERS_TURN = false;
let selectedTeamId = null;
let movementTimer = null;
let paymentTimer = null;
let shotClockTimer = null;
let lastAnimatedRollKey = '';
let lastPaymentKey = '';
let lastCardKey = '';
let cardDrawTimer = null;
let matchRefreshRequested = false;
let lastPurchaseKey = '';
let lastTradeNoticeKey = '';
let purchaseTimer = null;
let auctionClockTimer = null;
let diceFaceTimer = null;
let diceResultTimer = null;
let diceSettleTimer = null;
const selectedAvatars = new Map();

const board = document.querySelector('#board');
const playerRail = document.querySelector('#player-rail');
const rollButton = document.querySelector('#roll-button');
const teamCardDialog = document.querySelector('#team-card-dialog');
const frontOfficeDialog = document.querySelector('#front-office-dialog');
const tradeDialog = document.querySelector('#trade-dialog');
const spaceGuideDialog = document.querySelector('#space-guide-dialog');
const rulebookDialog = document.querySelector('#rulebook-dialog');
const quickGuideDialog = document.querySelector('#quick-guide-dialog');
const modeScreen = document.querySelector('#mode-screen');
const lobbyScreen = document.querySelector('#lobby-screen');
const gameStage = document.querySelector('#game-stage');
const QUICK_GUIDE_DISMISSED_KEY = 'basketballEmpireQuickGuideDismissed';
let quickGuideIndex = 0;

function renderQuickGuide() {
  const slides = [...document.querySelectorAll('[data-guide-slide]')];
  const progress = [...document.querySelectorAll('[data-guide-step]')];
  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === quickGuideIndex);
    slide.hidden = index !== quickGuideIndex;
  });
  progress.forEach((button, index) => button.classList.toggle('is-active', index === quickGuideIndex));
  document.querySelector('#quick-guide-back').disabled = quickGuideIndex === 0;
  document.querySelector('#quick-guide-next').textContent = quickGuideIndex === slides.length - 1 ? 'READY FOR TIP-OFF' : 'NEXT PLAY →';
  document.querySelector('#quick-guide-seconds').textContent = String(Math.max(0, 60 - (quickGuideIndex * 12))).padStart(2, '0');
}

function openQuickGuide({ reset = true } = {}) {
  if (reset) quickGuideIndex = 0;
  document.querySelector('#quick-guide-dont-show').checked = localStorage.getItem(QUICK_GUIDE_DISMISSED_KEY) === '1';
  renderQuickGuide();
  quickGuideDialog.showModal();
}

function closeQuickGuide() {
  const dismissed = document.querySelector('#quick-guide-dont-show').checked;
  if (dismissed) localStorage.setItem(QUICK_GUIDE_DISMISSED_KEY, '1');
  else localStorage.removeItem(QUICK_GUIDE_DISMISSED_KEY);
  quickGuideDialog.close();
}

function openBasketnopoly({ join = false, guide = false } = {}) {
  modeScreen.classList.add('is-hidden');
  lobbyScreen.classList.remove('is-hidden');
  gameStage.classList.add('is-hidden');
  document.querySelector('#header-game-status').textContent = 'BASKETNOPOLY';
  if (join) document.querySelector('#join-tab').click();
  if (guide && localStorage.getItem(QUICK_GUIDE_DISMISSED_KEY) !== '1') setTimeout(() => openQuickGuide(), 120);
}

function showModeSelection() {
  modeScreen.classList.remove('is-hidden');
  lobbyScreen.classList.add('is-hidden');
  gameStage.classList.add('is-hidden');
  document.querySelector('#header-room-code').textContent = '—';
  document.querySelector('#header-game-status').textContent = 'CHOOSE A MODE';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function avatarMarkup(player, className = 'avatar') {
  const style = player?.color ? ` style="--player-color:${escapeHtml(player.color)}"` : '';
  const content = player?.avatarDataUrl
    ? `<img src="${escapeHtml(player.avatarDataUrl)}" alt="" />`
    : escapeHtml(player?.initials || 'BE');
  return `<span class="${className}"${style}>${content}</span>`;
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) { reject(new Error('Choose an image file for your avatar.')); return; }
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const context = canvas.getContext('2d');
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      let dataUrl = canvas.toDataURL('image/jpeg', .68);
      if (dataUrl.length > 50_000) dataUrl = canvas.toDataURL('image/jpeg', .5);
      URL.revokeObjectURL(objectUrl);
      if (dataUrl.length > 50_000) reject(new Error('That photo is too detailed. Please choose another one.'));
      else resolve(dataUrl);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('That photo could not be opened.')); };
    image.src = objectUrl;
  });
}

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

function saveSession(nextSession) {
  session = nextSession;
  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
}

function leaveCurrentRoom() {
  eventSource?.close();
  eventSource = null;
  [pollTimer, movementTimer, shotClockTimer, auctionClockTimer, diceFaceTimer].forEach((timer) => clearInterval(timer));
  [paymentTimer, cardDrawTimer, purchaseTimer, diceResultTimer, diceSettleTimer].forEach((timer) => clearTimeout(timer));
  pollTimer = null;
  movementTimer = null;
  shotClockTimer = null;
  auctionClockTimer = null;
  localStorage.removeItem(SESSION_KEY);
  session = null;
  room = null;
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('room');
  history.replaceState(null, '', cleanUrl);
  gameStage.classList.add('is-hidden');
  document.querySelector('#room-lobby').classList.add('is-hidden');
  document.querySelector('#entry-panel').classList.remove('is-hidden');
  document.querySelector('#header-room-code').textContent = '—';
  document.querySelector('#header-game-status').textContent = 'WAITING FOR TIP-OFF';
  document.querySelector('#form-status').textContent = '';
  showModeSelection();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  if (!contentType.includes('application/json')) {
    throw new Error('The public connection returned a webpage instead of game data. Please reload and try again.');
  }
  let payload;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error('The courtside server returned damaged game data. Please reload and try again.');
  }
  if (!response.ok) throw new Error(payload.error || 'The courtside server could not complete that play.');
  return payload;
}

function positionFor(index) {
  if (index <= 10) return { row: 11, column: 11 - index };
  if (index <= 20) return { row: 21 - index, column: 1 };
  if (index <= 30) return { row: 1, column: index - 19 };
  return { row: index - 29, column: 11 };
}

function currentPlayer() { return room?.players?.[room.currentPlayerIndex] || null; }
function localPlayer() { return room?.players?.find((player) => player.id === session?.playerId) || null; }

function updateShotClock() {
  const clock = document.querySelector('.shot-clock');
  const display = document.querySelector('#timer');
  if (room?.matchDurationSeconds == null && room?.status !== 'lobby') {
    display.textContent = '∞';
    clock.setAttribute('aria-label', 'Unlimited game with no time limit');
    clock.classList.remove('is-urgent', 'is-expired');
    return;
  }
  const duration = room?.matchDurationSeconds ?? 600;
  let remaining = duration;
  if (room?.status === 'playing' && room.matchStartedAt) {
    const elapsed = Math.floor((Date.now() - room.matchStartedAt) / 1000);
    remaining = Math.max(0, duration - elapsed);
  } else if (room?.status === 'finished') {
    remaining = 0;
  }
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');
  display.textContent = `${minutes}:${seconds}`;
  clock.setAttribute('aria-label', `${minutes} minutes ${seconds} seconds remaining`);
  clock.classList.toggle('is-urgent', remaining > 0 && remaining <= 60);
  clock.classList.toggle('is-expired', remaining === 0);
  if (remaining === 0 && room.status === 'playing' && !matchRefreshRequested) {
    matchRefreshRequested = true;
    refreshRoom().finally(() => { matchRefreshRequested = false; });
  }
}

function syncShotClock() {
  clearInterval(shotClockTimer);
  shotClockTimer = null;
  updateShotClock();
  if (room?.status === 'playing') shotClockTimer = setInterval(updateShotClock, 250);
}

function renderPlayers() {
  playerRail.innerHTML = room.players.map((player, index) => `
    <article class="player-card ${index === room.currentPlayerIndex ? 'is-active' : ''} ${player.active ? '' : 'is-eliminated'}" data-player-id="${escapeHtml(player.id)}" style="--player-color: ${escapeHtml(player.color)}">
      <span class="rank">${index + 1}</span>${avatarMarkup(player)}
      <span class="player-name">${escapeHtml(player.name)}${player.id === room.hostId ? '<b class="host-label">HOST</b>' : ''}<small>${player.active ? (index === room.currentPlayerIndex ? 'ON THE CLOCK' : 'READY') : 'ELIMINATED'}</small></span>
      <strong class="points">${player.points.toLocaleString()}<small>PTS</small></strong>
    </article>`).join('');
}

function showBalanceChanges(previousRoom, nextRoom) {
  if (!previousRoom || previousRoom.status === 'lobby') return;
  nextRoom.players.forEach((player) => {
    const previous = previousRoom.players.find((candidate) => candidate.id === player.id);
    const delta = previous ? player.points - previous.points : 0;
    if (!delta) return;
    const card = playerRail.querySelector(`[data-player-id="${CSS.escape(player.id)}"]`);
    if (!card) return;
    const badge = document.createElement('span');
    badge.className = `balance-change ${delta > 0 ? 'is-gain' : 'is-loss'}`;
    badge.textContent = `${delta > 0 ? '+' : '−'}${Math.abs(delta).toLocaleString()}`;
    badge.setAttribute('role', 'status');
    card.append(badge);
    setTimeout(() => badge.remove(), 2200);
  });
}

function playerPieces(index) {
  return room.players.filter((player) => player.position === index).map((player, pieceIndex) =>
    `<span class="piece" data-player-id="${escapeHtml(player.id)}" style="right:${3 + pieceIndex * 15}px;background:${escapeHtml(player.color)}" title="${escapeHtml(player.name)}">${player.avatarDataUrl ? `<img src="${escapeHtml(player.avatarDataUrl)}" alt="" />` : escapeHtml(player.initials)}</span>`,
  ).join('');
}

function renderBoard() {
  board.querySelectorAll('.space').forEach((space) => space.remove());
  BOARD_SPACES.forEach((displaySpace, index) => {
    const serverSpace = room.board[index];
    const space = { ...displaySpace, ...serverSpace, group: GROUP_BY_SERVER_NAME[serverSpace.group] || displaySpace.group };
    const position = positionFor(index);
    const cell = document.createElement('article');
    cell.className = `space space-${displaySpace.type} ${space.group ? `group-${space.group}` : ''}`;
    cell.style.gridRow = position.row;
    cell.style.gridColumn = position.column;
    cell.dataset.index = index;
    const icon = displaySpace.logo
      ? `<button class="team-logo-button" type="button" data-team-index="${index}" aria-label="View ${escapeHtml(space.name)} card details"><span class="space-icon"><svg class="team-logo" aria-hidden="true"><use href="assets/team-logos.svg#${displaySpace.logo}"></use></svg></span></button>`
      : `<button class="space-info-button" type="button" data-space-index="${index}" aria-label="Explain ${escapeHtml(space.name)}"><span class="space-icon">${displaySpace.icon || '?'}</span></button>`;
    const asset = room.assets[serverSpace.id];
    const owner = asset?.ownerId ? room.players.find((player) => player.id === asset.ownerId) : null;
    const priceBadge = space.price ? `<span class="space-price-badge">${space.price} PTS</span>` : '';
    cell.innerHTML = `${space.group ? '<span class="team-stripe"></span>' : ''}${priceBadge}${icon}<strong>${escapeHtml(space.name)}</strong>
      <small>${owner ? `${asset.stars || 0} ★ · ${escapeHtml(owner.name)}` : displaySpace.note || displaySpace.type.replace('_', ' ')}</small>${playerPieces(index)}`;
    board.append(cell);
  });
  applyLandingHighlights();
}

function applyLandingHighlights() {
  board.querySelectorAll('.space.is-landed').forEach((cell) => cell.classList.remove('is-landed'));
  room.players.forEach((player) => {
    const cell = board.querySelector(`.space[data-index="${player.position}"]`);
    if (!cell) return;
    cell.classList.add('is-landed');
    cell.style.setProperty('--landing-color', player.color);
  });
}

function syncPlayerPieces(positionOverrides = new Map()) {
  board.querySelectorAll('.piece').forEach((piece) => piece.remove());
  room.players.forEach((player) => {
    const position = positionOverrides.get(player.id) ?? player.position;
    const cell = board.querySelector(`.space[data-index="${position}"]`);
    if (!cell) return;
    const piece = document.createElement('span');
    piece.className = 'piece';
    piece.dataset.playerId = player.id;
    piece.style.background = player.color;
    piece.title = player.name;
    piece.textContent = player.initials;
    cell.append(piece);
  });
}

function animateMovement(rollEntry) {
  if (!rollEntry?.path?.length) return;
  const player = room.players.find((candidate) => candidate.id === rollEntry.playerId);
  if (!player) return;
  clearInterval(movementTimer);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = -1;
  const positions = new Map([[player.id, rollEntry.fromPosition]]);
  syncPlayerPieces(positions);
  rollButton.disabled = true;
  const advance = () => {
    step += 1;
    const position = rollEntry.path[step];
    positions.set(player.id, position);
    syncPlayerPieces(positions);
    board.querySelectorAll('.space.is-moving').forEach((cell) => cell.classList.remove('is-moving'));
    const cell = board.querySelector(`.space[data-index="${position}"]`);
    cell?.classList.add('is-moving');
    cell?.style.setProperty('--landing-color', player.color);
    if (step >= rollEntry.path.length - 1) {
      clearInterval(movementTimer);
      movementTimer = null;
      cell?.classList.remove('is-moving');
      applyLandingHighlights();
      renderTurn();
    }
  };
  if (reduceMotion) {
    step = rollEntry.path.length - 2;
    advance();
  } else {
    advance();
    movementTimer = setInterval(advance, 240);
  }
}

function renderTurn() {
  const player = currentPlayer();
  const local = localPlayer();
  IS_LOCAL_PLAYERS_TURN = Boolean(player && player.id === session?.playerId);
  if (room.status === 'finished') {
    const winner = room.players.find((candidate) => candidate.id === room.winnerId);
    document.querySelector('#turn-player').innerHTML = winner
      ? `${avatarMarkup(winner, 'mini-avatar')} ${escapeHtml(winner.name)}`
      : '<span class="mini-avatar">BE</span> Match complete';
    document.querySelector('#decision-panel').classList.add('is-hidden');
    rollButton.classList.remove('is-hidden');
    rollButton.textContent = `CHAMPION: ${winner?.name || 'PLAYER'}`;
    rollButton.disabled = true;
    document.querySelector('#header-game-status').textContent = 'FINAL';
  }
  if (room.status !== 'finished') {
    document.querySelector('#turn-player').innerHTML = player
      ? `${avatarMarkup(player, 'mini-avatar')} ${escapeHtml(player.name)}`
      : '<span class="mini-avatar">BE</span> Waiting';
  }
  const dice = room.lastRoll || [1, 1];
  renderDie(document.querySelector('#die-one'), dice[0]);
  renderDie(document.querySelector('#die-two'), dice[1]);
  document.querySelector('#roll-total').textContent = dice[0] + dice[1];
  const ownDecision = IS_LOCAL_PLAYERS_TURN && room.phase === 'decision' && room.pendingDecision?.playerId === session.playerId;
  document.querySelector('#decision-panel').classList.toggle('is-hidden', !ownDecision);
  rollButton.classList.toggle('is-hidden', ownDecision || room.phase === 'auction');
  if (ownDecision) {
    const space = room.board.find((candidate) => candidate.id === room.pendingDecision.spaceId);
    const signButton = document.querySelector('#sign-team-button');
    document.querySelector('#decision-title').textContent = `Sign ${space.name}?`;
    document.querySelector('#decision-cost').textContent = `${space.price} PTS · PASS TO START AN AUCTION`;
    signButton.disabled = local.points < space.price;
    signButton.title = signButton.disabled ? `You need ${space.price - local.points} more PTS` : `Buy ${space.name}`;
  }
  if (room.status === 'finished') {
    // The champion banner above replaces all turn actions.
  } else if (!IS_LOCAL_PLAYERS_TURN) {
    rollButton.textContent = `WAITING FOR ${player?.name || 'PLAYER'}`;
    rollButton.disabled = true;
  } else if (room.phase === 'roll') {
    rollButton.textContent = 'ROLL DICE'; rollButton.disabled = false;
  } else if (room.phase === 'end_turn') {
    rollButton.textContent = room.extraRollPending ? 'ROLL AGAIN' : 'END TURN'; rollButton.disabled = false;
  } else { rollButton.disabled = true; }

  if (local) {
    const ownedAssets = Object.entries(room.assets).filter(([, asset]) => asset.ownerId === local.id);
    const teams = ownedAssets.filter(([assetId]) => room.board.find((space) => space.id === assetId)?.type === 'team');
    const stars = ownedAssets.reduce((total, [, asset]) => total + asset.stars + (asset.championship ? 5 : 0), 0);
    const assetValue = ownedAssets.reduce((total, [assetId]) => total + (room.board.find((space) => space.id === assetId)?.price || 0), 0);
    document.querySelector('#franchise-summary').textContent = `${teams.length} teams · ${stars} stars`;
    document.querySelector('#stat-cash').textContent = local.points.toLocaleString();
    document.querySelector('#stat-assets').textContent = assetValue.toLocaleString();
    document.querySelector('#stat-lap').textContent = `${local.laps}/${room.lapsToWin}`;
  }
}

function renderAuction() {
  const panel = document.querySelector('#auction-panel');
  const auction = room?.auction;
  const isOpen = Boolean(room?.status === 'playing' && room.phase === 'auction' && auction);
  panel.classList.toggle('is-hidden', !isOpen);
  clearInterval(auctionClockTimer);
  auctionClockTimer = null;
  if (!isOpen) return;

  const space = room.board.find((candidate) => candidate.id === auction.spaceId);
  const leader = room.players.find((candidate) => candidate.id === auction.highBidderId);
  const local = localPlayer();
  const spaceIndex = room.board.indexOf(space);
  const displaySpace = BOARD_SPACES[spaceIndex];
  document.querySelector('#auction-space').textContent = space?.name || 'Available asset';
  document.querySelector('#auction-card-name').textContent = space?.name || 'Available asset';
  document.querySelector('#auction-asset-type').textContent = `${space?.type?.replace('_', ' ') || 'league'} asset`;
  document.querySelector('#auction-high-bid').textContent = `${auction.highBid.toLocaleString()} PTS`;
  document.querySelector('#auction-leader').textContent = leader ? `${leader.name} leads the auction` : 'No bids yet — be the first!';
  document.querySelector('#auction-leader-avatar').innerHTML = leader ? avatarMarkup(leader, 'mini-avatar') : '—';
  document.querySelector('#auction-asset-mark').innerHTML = displaySpace?.logo
    ? `<svg aria-hidden="true"><use href="assets/team-logos.svg#${displaySpace.logo}"></use></svg>`
    : escapeHtml(displaySpace?.icon || '★');
  document.querySelector('#auction-asset-price').textContent = `${space.price.toLocaleString()} PTS`;
  document.querySelector('#auction-asset-mortgage').textContent = `${space.mortgage.toLocaleString()} PTS`;
  const revenueRows = space.type === 'team'
    ? space.revenue.map((amount, index) => [index === 0 ? 'Base lineup' : index === 5 ? 'Championship' : `${index} recruit${index === 1 ? '' : 's'}`, `${amount} PTS`])
    : space.type === 'route'
      ? [[1, 25], [2, 50], [3, 100], [4, 200]].map(([count, amount]) => [`${count} route${count === 1 ? '' : 's'}`, `${amount} PTS`])
      : [['One lab', 'dice ×4'], ['Both labs', 'dice ×10']];
  document.querySelector('#auction-asset-revenue').innerHTML = revenueRows.map(([label, value]) => `<span><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></span>`).join('');
  const bidEntries = room.log.filter((entry) => entry.type === 'auction_bid' && entry.spaceId === auction.spaceId).slice(-5).reverse();
  document.querySelector('#auction-bid-history').innerHTML = bidEntries.length
    ? bidEntries.map((entry) => { const bidder = room.players.find((player) => player.id === entry.playerId); return `<li>${avatarMarkup(bidder, 'mini-avatar')}<span><strong>${escapeHtml(bidder?.name || 'Player')}</strong> bids ${entry.amount.toLocaleString()} PTS</span></li>`; }).join('')
    : '<li class="is-empty">Waiting for the opening bid…</li>';

  const refreshCountdown = () => {
    const remaining = Math.max(0, auction.endsAt - Date.now());
    document.querySelector('#auction-countdown').textContent = `${(remaining / 1000).toFixed(1)}s`;
    const auctionProgress = document.querySelector('#auction-progress');
    auctionProgress.style.width = `${Math.min(100, remaining / 50)}%`;
  };
  refreshCountdown();
  auctionClockTimer = setInterval(refreshCountdown, 100);

  document.querySelectorAll('[data-bid-increment]').forEach((button) => {
    const nextBid = auction.highBid + Number(button.dataset.bidIncrement);
    button.querySelector('.auction-next-bid').textContent = `${nextBid.toLocaleString()} PTS`;
    button.disabled = !local?.active || local.points < nextBid;
    button.title = button.disabled ? 'Not enough points for this bid.' : `Bid ${nextBid} PTS`;
  });
}

function renderDie(element, value) {
  const positions = { 1: ['c'], 2: ['tl', 'br'], 3: ['tl', 'c', 'br'], 4: ['tl', 'tr', 'bl', 'br'], 5: ['tl', 'tr', 'c', 'bl', 'br'], 6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'] };
  const opposite = 7 - value;
  const sideValues = [1, 2, 3, 4, 5, 6].filter((candidate) => candidate !== value && candidate !== opposite);
  const values = [value, opposite, sideValues[0], 7 - sideValues[0], sideValues[1], 7 - sideValues[1]];
  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  const pipMarkup = (faceValue) => `<span class="die-pips" aria-hidden="true">${positions[faceValue].map((position) => `<i class="pip pip-${position}"></i>`).join('')}</span>`;
  let cube = element.querySelector('.die-cube');
  if (!cube) {
    element.innerHTML = `<span class="die-cube"><span class="die-face die-face-front"></span><span class="die-face die-face-back"></span><span class="die-face die-face-right"></span><span class="die-face die-face-left"></span><span class="die-face die-face-top"></span><span class="die-face die-face-bottom"></span></span>`;
    cube = element.querySelector('.die-cube');
  }
  faceNames.forEach((faceName, index) => {
    cube.querySelector(`.die-face-${faceName}`).innerHTML = pipMarkup(values[index]);
  });
  element.setAttribute('aria-label', `Die rolled ${value}`);
}

function renderFeed() {
  if (!room.log.length) return;
  document.querySelector('#activity-feed').innerHTML = [...room.log].reverse().map((entry, index) => {
    const player = room.players.find((candidate) => candidate.id === entry.playerId);
    const space = room.board.find((candidate) => candidate.id === entry.spaceId);
    let message = `rolled ${entry.dice?.join(' + ') || ''}`;
    if (entry.type === 'signed') message = `signed ${space?.name}`;
    if (entry.type === 'declined') message = `passed on ${space?.name}; the auction is live`;
    if (entry.type === 'auction_bid') message = `bid ${entry.amount} PTS for ${space?.name}`;
    if (entry.type === 'auction_won') message = `won ${space?.name} for ${entry.amount} PTS`;
    if (entry.type === 'auction_unsold') message = `${space?.name} received no bids and remains available`;
    if (entry.type === 'points_awarded') message = `earned +${entry.amount} PTS at Tip-Off`;
    if (entry.type === 'recruited') message = `recruited ${entry.playerName} to ${space?.name} for ${entry.cost} PTS`;
    if (entry.type === 'champion') message = 'crossed Tip-Off and became the champion';
    if (entry.type === 'payment') {
      const recipient = room.players.find((candidate) => candidate.id === entry.recipientId);
      message = `paid ${entry.amount} PTS to ${recipient?.name || 'the owner'} at ${space?.name}`;
    }
    if (entry.type === 'card') message = `drew ${entry.title}: ${entry.amount >= 0 ? '+' : ''}${entry.amount} PTS`;
    if (entry.type === 'bankrupt') message = 'declared bankruptcy and left the court';
    if (entry.type === 'trade_offered') message = `sent a trade offer to ${room.players.find((candidate) => candidate.id === entry.recipientId)?.name || 'a rival'}`;
    if (entry.type === 'trade_accepted') message = 'accepted a trade offer';
    if (entry.type === 'trade_rejected') message = 'rejected a trade offer';
    if (entry.type === 'extra_roll') message = 'rolled doubles and earned another roll';
    return `<li class="${index === 0 ? 'is-new' : 'is-old'}">${avatarMarkup(player, 'feed-icon orange')}<span><strong>${escapeHtml(player?.name || 'Basketball Empire')}</strong> ${escapeHtml(message)}.</span></li>`;
  }).join('');
}

function showCardDraw(entry) {
  const overlay = document.querySelector('#card-draw-overlay');
  document.querySelector('#drawn-card-deck').textContent = entry.deck === 'operations' ? 'TEAM OPERATIONS' : 'GAME TIME';
  document.querySelector('#drawn-card-title').textContent = entry.title;
  document.querySelector('#drawn-card-description').textContent = entry.description;
  const effect = document.querySelector('#drawn-card-effect');
  effect.textContent = `${entry.amount >= 0 ? '+' : ''}${entry.amount} PTS`;
  effect.classList.toggle('is-loss', entry.amount < 0);
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => overlay.classList.add('is-visible'));
  clearTimeout(cardDrawTimer);
  cardDrawTimer = setTimeout(() => { overlay.classList.remove('is-visible'); overlay.setAttribute('aria-hidden', 'true'); }, 4200);
}

function closeCardDraw() {
  clearTimeout(cardDrawTimer);
  cardDrawTimer = null;
  const overlay = document.querySelector('#card-draw-overlay');
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
}

function showPaymentCallout(entry) {
  const payer = room.players.find((player) => player.id === entry.playerId);
  const recipient = room.players.find((player) => player.id === entry.recipientId);
  const space = room.board.find((candidate) => candidate.id === entry.spaceId);
  const callout = document.querySelector('#payment-callout');
  callout.innerHTML = `<span class="payment-arrow">${escapeHtml(payer?.initials || '?')} → ${escapeHtml(recipient?.initials || '?')}</span>
    <strong>−${Number(entry.amount).toLocaleString()} PTS</strong>
    <small>${escapeHtml(payer?.name)} paid ${escapeHtml(recipient?.name)} · ${escapeHtml(space?.name)}</small>`;
  callout.style.setProperty('--payer-color', payer?.color || '#f26a21');
  callout.style.setProperty('--recipient-color', recipient?.color || '#2ad2df');
  callout.classList.remove('is-visible');
  requestAnimationFrame(() => callout.classList.add('is-visible'));
  clearTimeout(paymentTimer);
  paymentTimer = setTimeout(() => callout.classList.remove('is-visible'), 3600);
}

function showPurchaseHighlight(entry) {
  const player = room.players.find((candidate) => candidate.id === entry.playerId);
  const spaceIndex = room.board.findIndex((candidate) => candidate.id === entry.spaceId);
  const cell = board.querySelector(`.space[data-index="${spaceIndex}"]`);
  if (!cell) return;
  cell.style.setProperty('--purchase-color', player?.color || '#ffd34e');
  cell.classList.remove('is-purchased');
  requestAnimationFrame(() => cell.classList.add('is-purchased'));
  clearTimeout(purchaseTimer);
  purchaseTimer = setTimeout(() => cell.classList.remove('is-purchased'), 2600);
}

function animateDice(finalValues, onSettled) {
  const dice = [document.querySelector('#die-one'), document.querySelector('#die-two')];
  const tray = document.querySelector('.dice-tray');
  clearInterval(diceFaceTimer);
  clearTimeout(diceResultTimer);
  clearTimeout(diceSettleTimer);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const diceRenderer = window.Dice3D;
  if (diceRenderer?.isReady()) {
    dice.forEach((die, index) => renderDie(die, finalValues[index]));
    diceRenderer.roll(finalValues).then(() => onSettled?.());
    return;
  }
  if (reduceMotion) {
    dice.forEach((die, index) => renderDie(die, finalValues[index]));
    onSettled?.();
    return;
  }
  dice.forEach((die) => die.classList.remove('is-rolling', 'is-impact', 'is-settling'));
  tray.classList.remove('is-rolling', 'is-launching', 'is-impacting');
  requestAnimationFrame(() => {
    tray.classList.add('is-rolling');
    tray.classList.add('is-launching');
    dice.forEach((die) => die.classList.add('is-rolling'));
  });
  diceFaceTimer = setInterval(() => {
    dice.forEach((die) => renderDie(die, 1 + Math.floor(Math.random() * 6)));
  }, 62);
  diceResultTimer = setTimeout(() => {
    clearInterval(diceFaceTimer);
    diceFaceTimer = null;
    tray.classList.remove('is-launching');
    tray.classList.add('is-impacting');
    dice.forEach((die, index) => {
      renderDie(dice[index], finalValues[index]);
      die.classList.add('is-impact', 'is-settling');
    });
  }, 890);
  diceSettleTimer = setTimeout(() => {
    dice.forEach((die) => die.classList.remove('is-rolling', 'is-impact', 'is-settling'));
    tray.classList.remove('is-rolling', 'is-launching', 'is-impacting');
    onSettled?.();
  }, 1360);
}

function showIncomingTradeAlert() {
  const alert = document.querySelector('#trade-offer-alert');
  const offer = [...(room.tradeOffers || [])].reverse().find((candidate) => (
    candidate.status === 'pending' && candidate.recipientId === session?.playerId
  ));
  const isIncomingOffer = offer && offer.recipientId === session?.playerId;
  if (!isIncomingOffer) {
    alert.classList.remove('is-visible');
    return;
  }
  const offerKey = `${room.roomCode}:${offer.id}`;
  if (offerKey === lastTradeNoticeKey) return;
  lastTradeNoticeKey = offerKey;
  const sender = room.players.find((player) => player.id === offer.senderId);
  const offered = tradeSideText(offer.offeredPoints, offer.offeredAssetIds);
  const requested = tradeSideText(offer.requestedPoints, offer.requestedAssetIds);
  document.querySelector('#trade-alert-title').textContent = `${sender?.name || 'A rival'} sent you a trade`;
  document.querySelector('#trade-alert-summary').textContent = `${offered} for ${requested}`;
  alert.classList.remove('is-visible');
  requestAnimationFrame(() => alert.classList.add('is-visible'));
}

function teamDisplaySpace(space) {
  const index = room.board.findIndex((candidate) => candidate.id === space.id);
  return { index, display: BOARD_SPACES[index] };
}

function renderFrontOffice(section = 'recruits') {
  const content = document.querySelector('#front-office-content');
  const local = localPlayer();
  frontOfficeDialog.querySelectorAll('[data-office-tab]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.officeTab === section);
    button.setAttribute('aria-selected', String(button.dataset.officeTab === section));
  });
  if (section === 'recruits') {
    const ownedTeams = room.board.filter((space) => space.type === 'team' && room.assets[space.id]?.ownerId === local?.id);
    const eligibleTeams = ownedTeams.filter((team) => {
      const division = room.board.filter((space) => space.type === 'team' && space.group === team.group);
      const asset = room.assets[team.id];
      const levels = division.map((space) => room.assets[space.id].championship ? 5 : room.assets[space.id].stars);
      return division.every((space) => room.assets[space.id].ownerId === local?.id)
        && !asset.mortgaged && !asset.championship
        && asset.stars === Math.min(...levels);
    });
    const teamOptions = eligibleTeams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join('');
    const recruited = new Set(Object.values(room.assets).flatMap((asset) => asset.recruits || []));
    content.innerHTML = `<div class="office-intro"><strong>SCOUTING BOARD</strong><span>Recruit stars only after completing a color division.</span></div>
      <div class="scout-grid">${SCOUTING_BOARD.map((prospect) => `<article class="scout-card">
        <span class="scout-rating">${prospect.rating}</span><div><strong>${escapeHtml(prospect.name)}</strong><small>${escapeHtml(prospect.role)} · ${escapeHtml(prospect.skill)}</small></div>
        <span class="scout-cost">${prospect.cost} PTS</span>
        <select aria-label="Team for ${escapeHtml(prospect.name)}" ${eligibleTeams.length ? '' : 'disabled'}>${teamOptions || '<option>Complete a division first</option>'}</select>
        <button data-recruit-player="${escapeHtml(prospect.name)}" type="button" ${!eligibleTeams.length || recruited.has(prospect.name) || !IS_LOCAL_PLAYERS_TURN || local.points < prospect.cost ? 'disabled' : ''}>${recruited.has(prospect.name) ? 'SIGNED' : 'RECRUIT'}</button>
      </article>`).join('')}</div>
      <p class="office-footnote">Fan-made game for private play. Complete a color division and develop its teams evenly.</p>`;
    return;
  }
  if (section === 'trade') {
    const offers = (room.tradeOffers || []).filter((offer) => [offer.senderId, offer.recipientId].includes(local?.id));
    const pending = offers.filter((offer) => offer.status === 'pending');
    content.innerHTML = `<div class="trade-desk-head"><div><strong>TRADES</strong><span>Swap PTS, teams, routes, or labs.</span></div><button id="create-trade-button" type="button"><b>＋</b> CREATE TRADE</button></div>
      <div class="trade-offer-list">${pending.length ? pending.map((offer) => tradeOfferMarkup(offer, local)).join('') : '<p class="empty-office">No live offers. Create a deal with another general manager.</p>'}</div>
      ${offers.some((offer) => offer.status !== 'pending') ? `<h3 class="trade-history-title">RECENT DEALS</h3>${offers.filter((offer) => offer.status !== 'pending').slice(-3).reverse().map((offer) => tradeOfferMarkup(offer, local)).join('')}` : ''}`;
    return;
  }
  const ownedTeams = room.board.filter((space) => space.type === 'team' && room.assets[space.id]?.ownerId === local?.id);
  content.innerHTML = `<div class="office-intro"><strong>MY TEAM SHEET</strong><span>Open a Team Card to inspect revenue, recruit, or mortgage.</span></div>
    <div class="owned-team-grid">${ownedTeams.length ? ownedTeams.map((team) => {
      const { display } = teamDisplaySpace(team);
      const asset = room.assets[team.id];
      return `<button class="office-team-button team-sheet-row" data-team-id="${team.id}"><svg aria-hidden="true"><use href="assets/team-logos.svg#${display.logo}"></use></svg><span><strong>${escapeHtml(team.name)}</strong><small>${asset.championship ? 'CHAMPIONSHIP LINEUP' : `${asset.stars} recruited star${asset.stars === 1 ? '' : 's'}`}${asset.mortgaged ? ' · MORTGAGED' : ''}</small></span><b>${team.price} PTS</b></button>`;
    }).join('') : '<p class="empty-office">Your team sheet is empty. Land on an unsigned team to build your franchise.</p>'}</div>`;
}

function assetNames(assetIds) {
  return assetIds.map((assetId) => room.board.find((space) => space.id === assetId)?.name).filter(Boolean);
}

function tradeSideText(points, assetIds) {
  const parts = [];
  if (points) parts.push(`${points.toLocaleString()} PTS`);
  parts.push(...assetNames(assetIds));
  return parts.join(' + ') || 'Nothing';
}

function tradeOfferMarkup(offer, local) {
  const sender = room.players.find((player) => player.id === offer.senderId);
  const recipient = room.players.find((player) => player.id === offer.recipientId);
  const incoming = offer.recipientId === local?.id;
  return `<article class="trade-offer ${offer.status !== 'pending' ? `is-${offer.status}` : ''}">
    <header>${avatarMarkup(incoming ? sender : recipient, 'mini-avatar')}<div><strong>${incoming ? `FROM ${escapeHtml(sender?.name)}` : `TO ${escapeHtml(recipient?.name)}`}</strong><small>${escapeHtml(offer.status.toUpperCase())}</small></div></header>
    <div class="trade-swap"><span><small>${escapeHtml(sender?.name)} GIVES</small>${escapeHtml(tradeSideText(offer.offeredPoints, offer.offeredAssetIds))}</span><b>⇄</b><span><small>${escapeHtml(recipient?.name)} GIVES</small>${escapeHtml(tradeSideText(offer.requestedPoints, offer.requestedAssetIds))}</span></div>
    ${incoming && offer.status === 'pending' ? `<footer><button data-trade-response="reject" data-offer-id="${offer.id}">REJECT</button><button data-trade-response="accept" data-offer-id="${offer.id}">ACCEPT</button></footer>` : ''}
  </article>`;
}

function tradeableAssets(playerId) {
  return room.board.filter((space) => {
    const asset = room.assets[space.id];
    return asset?.ownerId === playerId && !asset.mortgaged && asset.stars === 0 && !asset.championship;
  });
}

function openTradeCreator() {
  const rivals = room.players.filter((player) => player.active && player.id !== session?.playerId);
  document.querySelector('#trade-dialog-title').textContent = 'CREATE A TRADE';
  document.querySelector('#trade-dialog-subtitle').textContent = 'Select a player to trade with:';
  document.querySelector('#trade-dialog-content').innerHTML = `<div class="trade-rival-picker">${rivals.map((player) => `<button type="button" data-trade-rival="${player.id}">${avatarMarkup(player, 'mini-avatar')}<span><strong>${escapeHtml(player.name)}</strong><small>${player.points.toLocaleString()} PTS · ${tradeableAssets(player.id).length} tradeable assets</small></span></button>`).join('') || '<p class="empty-office">No active rivals are available.</p>'}</div>`;
  frontOfficeDialog.close();
  tradeDialog.showModal();
}

function tradeAssetChoices(player, side) {
  const assets = tradeableAssets(player.id);
  return assets.length ? assets.map((space) => `<label><input type="checkbox" name="${side}AssetIds" value="${space.id}" /><span>${escapeHtml(space.name)}<small>${space.type.toUpperCase()} · ${space.price} PTS</small></span></label>`).join('') : '<p class="empty-trade-side">No tradeable assets</p>';
}

function renderTradeBuilder(recipientId) {
  const local = localPlayer();
  const rival = room.players.find((player) => player.id === recipientId);
  document.querySelector('#trade-dialog-title').textContent = `TRADE WITH ${rival.name}`;
  document.querySelector('#trade-dialog-subtitle').textContent = 'Build both sides of the deal. The other player must accept.';
  document.querySelector('#trade-dialog-content').innerHTML = `<input type="hidden" name="recipientId" value="${rival.id}" />
    <div class="trade-builder">
      <section><h3>${escapeHtml(local.name)} GIVES</h3><label class="trade-points-input">PTS <input name="offeredPoints" type="number" min="0" max="${local.points}" value="0" inputmode="numeric" /></label><div class="trade-asset-list">${tradeAssetChoices(local, 'offered')}</div></section>
      <b class="trade-builder-arrow">⇄</b>
      <section><h3>${escapeHtml(rival.name)} GIVES</h3><label class="trade-points-input">PTS <input name="requestedPoints" type="number" min="0" max="${rival.points}" value="0" inputmode="numeric" /></label><div class="trade-asset-list">${tradeAssetChoices(rival, 'requested')}</div></section>
    </div><button class="trade-submit" type="submit">SEND TRADE OFFER</button>`;
}

function openFrontOffice(section) {
  renderFrontOffice(section);
  if (!frontOfficeDialog.open) frontOfficeDialog.showModal();
}

function openSpaceGuide(space, index) {
  const guide = SPACE_GUIDES[space.type] || SPACE_GUIDES[BOARD_SPACES[index].type] || { label: 'COURT GUIDE', rule: 'Follow the instruction printed on this space.' };
  document.querySelector('#space-guide-icon').textContent = BOARD_SPACES[index].icon || '?';
  document.querySelector('#space-guide-type').textContent = guide.label;
  document.querySelector('#space-guide-name').textContent = space.name;
  document.querySelector('#space-guide-description').textContent = space.description || 'This special space changes the rhythm of the match.';
  document.querySelector('#space-guide-rule').textContent = guide.rule;
  const costs = document.querySelector('#space-guide-costs');
  if (space.type === 'route') costs.innerHTML = `<span>BUY <b>${space.price} PTS</b></span><span>MORTGAGE <b>${space.mortgage} PTS</b></span><span>REVENUE <b>25 / 50 / 100 / 200</b></span>`;
  else if (space.type === 'training') costs.innerHTML = `<span>BUY <b>${space.price} PTS</b></span><span>MORTGAGE <b>${space.mortgage} PTS</b></span><span>REVENUE <b>dice total ×4 · both labs ×10</b></span>`;
  else costs.innerHTML = '';
  spaceGuideDialog.showModal();
}

function renderLobby() {
  modeScreen.classList.add('is-hidden'); lobbyScreen.classList.remove('is-hidden'); gameStage.classList.add('is-hidden');
  document.querySelector('#entry-panel').classList.add('is-hidden');
  document.querySelector('#room-lobby').classList.remove('is-hidden');
  document.querySelector('#lobby-room-code').textContent = room.roomCode;
  document.querySelector('#header-room-code').textContent = room.roomCode;
  document.querySelector('#lobby-player-list').innerHTML = room.players.map((player) => `
    <div class="lobby-player ${player.ready ? 'is-ready' : ''}">${avatarMarkup(player)}
    <strong>${escapeHtml(player.name)}${player.id === room.hostId ? ' <b class="host-label">HOST</b>' : ''}</strong><small>${player.ready ? 'READY' : 'GETTING READY'}</small></div>`).join('');
  const local = localPlayer();
  document.querySelector('#ready-button').textContent = local?.ready ? 'NOT READY' : "I'M READY";
  const startButton = document.querySelector('#start-button');
  const durationSelect = document.querySelector('#match-duration');
  durationSelect.disabled = !session?.isHost;
  document.querySelector('#match-duration-note').textContent = session?.isHost
    ? 'Choose the game length before starting.'
    : 'Only the host can choose the game length.';
  startButton.disabled = !(session?.isHost && room.players.length >= 2 && room.players.every((player) => player.ready));
  startButton.textContent = session?.isHost ? 'START MATCH' : 'WAITING FOR HOST';
}

function renderRoom() {
  if (!room) return;
  document.querySelector('#header-room-code').textContent = room.roomCode;
  document.querySelector('#header-game-status').textContent = room.status === 'playing' ? `TURN ${room.turn + 1}` : 'WAITING FOR TIP-OFF';
  syncShotClock();
  if (room.status === 'lobby') { renderLobby(); return; }
  modeScreen.classList.add('is-hidden'); lobbyScreen.classList.add('is-hidden'); gameStage.classList.remove('is-hidden');
  const endGameButton = document.querySelector('#end-game-button');
  endGameButton.classList.toggle('is-hidden', session?.playerId !== room.hostId || room.status !== 'playing');
  const local = localPlayer();
  const canMortgage = room.board.some((space) => {
    const asset = room.assets[space.id];
    return asset?.ownerId === local?.id && !asset.mortgaged && !asset.championship && asset.stars === 0;
  });
  const bankruptButton = document.querySelector('#bankrupt-button');
  const canDeclareBankruptcy = Boolean(local?.active && local.points === 0 && !canMortgage && room.status === 'playing');
  bankruptButton.disabled = !canDeclareBankruptcy;
  bankruptButton.title = canDeclareBankruptcy
    ? 'Leave the match and return your assets to the bank.'
    : (canMortgage ? 'Mortgage available assets first.' : 'Bankruptcy is available only when you have 0 PTS.');
  renderPlayers(); renderBoard(); renderTurn(); renderAuction(); renderFeed(); showIncomingTradeAlert();
}

function applyRoom(nextRoom) {
  const previousRoom = room;
  room = nextRoom;
  renderRoom();
  showBalanceChanges(previousRoom, nextRoom);
  if (!previousRoom || room.status === 'lobby') return;

  const rollIndex = room.log.findLastIndex((entry) => entry.type === 'roll');
  const rollEntry = room.log[rollIndex];
  const rollKey = rollEntry ? `${rollIndex}:${rollEntry.playerId}:${rollEntry.path?.join('-')}` : '';
  if (rollEntry?.path && rollKey !== lastAnimatedRollKey) {
    lastAnimatedRollKey = rollKey;
    animateDice(rollEntry.dice, () => animateMovement(rollEntry));
  }

  const paymentIndex = room.log.findLastIndex((entry) => entry.type === 'payment');
  const paymentEntry = room.log[paymentIndex];
  const paymentKey = paymentEntry ? `${paymentIndex}:${paymentEntry.playerId}:${paymentEntry.recipientId}:${paymentEntry.amount}` : '';
  if (paymentEntry && paymentKey !== lastPaymentKey) {
    lastPaymentKey = paymentKey;
    showPaymentCallout(paymentEntry);
  }
  const cardIndex = room.log.findLastIndex((entry) => entry.type === 'card');
  const cardEntry = room.log[cardIndex];
  const cardKey = cardEntry ? `${cardIndex}:${cardEntry.playerId}:${cardEntry.title}` : '';
  if (cardEntry && cardKey !== lastCardKey) {
    lastCardKey = cardKey;
    showCardDraw(cardEntry);
  }
  const purchaseIndex = room.log.findLastIndex((entry) => entry.type === 'signed' || entry.type === 'auction_won');
  const purchaseEntry = room.log[purchaseIndex];
  const purchaseKey = purchaseEntry ? `${purchaseIndex}:${purchaseEntry.playerId}:${purchaseEntry.spaceId}` : '';
  if (purchaseEntry && purchaseKey !== lastPurchaseKey) {
    lastPurchaseKey = purchaseKey;
    showPurchaseHighlight(purchaseEntry);
  }
}

function connectEvents() {
  eventSource?.close();
  clearInterval(pollTimer);
  pollTimer = null;
  eventSource = new EventSource(`/api/rooms/${encodeURIComponent(session.roomCode)}/events`);
  eventSource.addEventListener('state', (event) => applyRoom(JSON.parse(event.data)));
  eventSource.onopen = () => {
    clearInterval(pollTimer);
    pollTimer = null;
  };
  eventSource.onerror = () => {
    document.querySelector('#header-game-status').textContent = 'RECONNECTING…';
    startPolling();
  };
}

async function refreshRoom() {
  if (!session?.roomCode) return;
  try {
    const result = await api(`/api/rooms/${encodeURIComponent(session.roomCode)}`);
    applyRoom(result.room);
  } catch {
    document.querySelector('#header-game-status').textContent = 'RECONNECTING…';
  }
}

function startPolling() {
  if (pollTimer) return;
  refreshRoom();
  pollTimer = setInterval(refreshRoom, 2000);
}

async function enterRoom(result, isHost) {
  saveSession({ roomCode: result.room.roomCode, playerId: result.playerId, token: result.token, isHost });
  applyRoom(result.room);
  const inviteUrl = new URL(window.location.href);
  inviteUrl.searchParams.set('room', room.roomCode);
  history.replaceState(null, '', inviteUrl);
  connectEvents();
}

function showError(error) { document.querySelector('#form-status').textContent = error.message; }

async function performAction(action) {
  try {
    const result = await api(`/api/rooms/${encodeURIComponent(session.roomCode)}/actions`, { method: 'POST', body: action });
    applyRoom(result.room);
    return result.room;
  } catch (error) { showError(error); return null; }
}

function openTeamCard(space, index) {
  if (!space || space.type !== 'team') return;
  selectedTeamId = space.id;
  const displaySpace = BOARD_SPACES[index];
  const group = GROUP_BY_SERVER_NAME[space.group] || displaySpace.group;
  document.querySelector('#card-team-name').textContent = space.name;
  document.querySelector('#card-division').textContent = `${space.group.toUpperCase()} DIVISION`;
  document.querySelector('#card-buy-cost').textContent = space.price.toLocaleString();
  document.querySelector('#card-sell-value').textContent = Math.floor(space.price / 2).toLocaleString();
  document.querySelector('#card-recruit-cost').textContent = (space.recruitCost || RECRUIT_COSTS[group]).toLocaleString();
  document.querySelector('#card-logo use').setAttribute('href', `assets/team-logos.svg#${displaySpace.logo}`);
  document.querySelector('#card-logo-wrap').className = `card-logo group-${group}`;
  const asset = room.assets[space.id];
  const developmentLevel = asset.championship ? 5 : asset.stars;
  document.querySelector('#card-landing-payment').textContent = `${space.revenue[developmentLevel].toLocaleString()} PTS`;
  document.querySelector('#card-recruited-players').innerHTML = asset.recruits.length
    ? asset.recruits.map((name) => {
      const prospect = SCOUTING_BOARD.find((candidate) => candidate.name === name);
      return `<article class="recruited-player"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(prospect?.role || 'Star')} · ${prospect?.rating || '—'} OVR</span><small>${escapeHtml(prospect?.skill || 'Franchise boost')} · recruited for ${prospect?.cost || space.recruitCost} PTS</small></article>`;
    }).join('')
    : '<span class="empty-roster">No star players recruited.</span>';
  const isOwner = asset.ownerId === session.playerId;
  document.querySelector('#recruit-star-button').disabled = !isOwner || !IS_LOCAL_PLAYERS_TURN || asset.mortgaged || asset.championship;
  document.querySelector('#mortgage-team-button').disabled = !isOwner || !IS_LOCAL_PLAYERS_TURN || asset.mortgaged || asset.stars > 0 || asset.championship;
  teamCardDialog.showModal();
}

document.querySelector('#create-tab').addEventListener('click', () => {
  document.querySelector('#create-tab').classList.add('is-active'); document.querySelector('#join-tab').classList.remove('is-active');
  document.querySelector('#create-room-form').classList.remove('is-hidden'); document.querySelector('#join-room-form').classList.add('is-hidden');
});
document.querySelector('#join-tab').addEventListener('click', () => {
  document.querySelector('#join-tab').classList.add('is-active'); document.querySelector('#create-tab').classList.remove('is-active');
  document.querySelector('#join-room-form').classList.remove('is-hidden'); document.querySelector('#create-room-form').classList.add('is-hidden');
});
document.querySelector('#open-rulebook-button').addEventListener('click', () => rulebookDialog.showModal());
document.querySelector('#rulebook-close').addEventListener('click', () => rulebookDialog.close());
document.querySelector('#rulebook-done').addEventListener('click', () => rulebookDialog.close());
rulebookDialog.addEventListener('click', (event) => { if (event.target === rulebookDialog) rulebookDialog.close(); });
document.querySelector('#open-quick-guide-button').addEventListener('click', () => openQuickGuide());
document.querySelector('#game-how-to-play').addEventListener('click', () => openQuickGuide());
document.querySelector('#quick-guide-close').addEventListener('click', closeQuickGuide);
document.querySelector('#quick-guide-skip').addEventListener('click', closeQuickGuide);
document.querySelector('#quick-guide-back').addEventListener('click', () => { quickGuideIndex = Math.max(0, quickGuideIndex - 1); renderQuickGuide(); });
document.querySelector('#quick-guide-next').addEventListener('click', () => {
  if (quickGuideIndex === 4) closeQuickGuide();
  else { quickGuideIndex += 1; renderQuickGuide(); }
});
document.querySelectorAll('[data-guide-step]').forEach((button) => button.addEventListener('click', () => { quickGuideIndex = Number(button.dataset.guideStep); renderQuickGuide(); }));
document.querySelector('#quick-guide-rulebook').addEventListener('click', () => { quickGuideDialog.close(); rulebookDialog.showModal(); });
document.querySelector('#quick-guide-create').addEventListener('click', () => { closeQuickGuide(); document.querySelector('#create-tab').click(); document.querySelector('#player-name').focus(); });
document.querySelector('#quick-guide-join').addEventListener('click', () => { closeQuickGuide(); document.querySelector('#join-tab').click(); document.querySelector('#join-player-name').focus(); });
quickGuideDialog.addEventListener('click', (event) => { if (event.target === quickGuideDialog) closeQuickGuide(); });
document.querySelector('#create-room-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await enterRoom(await api('/api/rooms', { method: 'POST', body: { name: event.currentTarget.elements.name.value, avatarDataUrl: selectedAvatars.get(event.currentTarget.id) || null } }), true); } catch (error) { showError(error); }
});
document.querySelector('#join-room-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const code = event.currentTarget.elements.roomCode.value.trim().toUpperCase();
    await enterRoom(await api(`/api/rooms/${encodeURIComponent(code)}/join`, { method: 'POST', body: { name: event.currentTarget.elements.name.value, avatarDataUrl: selectedAvatars.get(event.currentTarget.id) || null } }), false);
  } catch (error) { showError(error); }
});
document.querySelector('#ready-button').addEventListener('click', async () => {
  const result = await api(`/api/rooms/${encodeURIComponent(session.roomCode)}/ready`, { method: 'POST', body: { ready: !localPlayer()?.ready } });
  applyRoom(result.room);
});
document.querySelector('#start-button').addEventListener('click', async () => {
  const selectedDuration = document.querySelector('#match-duration').value;
  const durationMinutes = selectedDuration === 'unlimited' ? 'unlimited' : Number(selectedDuration);
  const result = await api(`/api/rooms/${encodeURIComponent(session.roomCode)}/start`, { method: 'POST', body: { durationMinutes } });
  applyRoom(result.room);
});
document.querySelector('#share-room-button').addEventListener('click', async (event) => {
  const inviteUrl = new URL(window.location.href); inviteUrl.searchParams.set('room', room.roomCode);
  await navigator.clipboard.writeText(inviteUrl.toString()); event.currentTarget.textContent = 'LINK COPIED!';
});
rollButton.addEventListener('click', () => {
  if (room.phase === 'roll') performAction({ type: 'roll' });
  if (room.phase === 'end_turn') performAction({ type: 'end_turn' });
});
document.querySelector('#end-game-button').addEventListener('click', () => {
  if (window.confirm('End the game now? The player with the most points will win.')) performAction({ type: 'end_game' });
});
document.querySelector('#bankrupt-button').addEventListener('click', () => {
  if (window.confirm('Declare bankruptcy? Your assets will return to the bank and you will leave this match.')) performAction({ type: 'bankrupt' });
});
document.querySelector('#leave-game-button').addEventListener('click', () => {
  if (window.confirm('Leave this game and return to Create / Join?')) leaveCurrentRoom();
});
document.querySelector('[data-game-mode="basketnopoly"]').addEventListener('click', () => openBasketnopoly({ guide: true }));
document.querySelector('#back-to-modes').addEventListener('click', showModeSelection);
document.querySelector('#brand-home').addEventListener('click', (event) => {
  event.preventDefault();
  if (!session) showModeSelection();
});
document.querySelectorAll('[data-avatar-picker]').forEach((picker) => {
  const formId = picker.dataset.avatarPicker;
  const preview = picker.querySelector('.avatar-preview');
  const removeButton = picker.querySelector('[data-avatar-remove]');
  picker.querySelectorAll('input[type="file"]').forEach((input) => input.addEventListener('change', async () => {
    try {
      const avatarDataUrl = await resizeAvatar(input.files[0]);
      selectedAvatars.set(formId, avatarDataUrl);
      preview.innerHTML = `<img src="${escapeHtml(avatarDataUrl)}" alt="Selected player avatar" />`;
      removeButton.classList.remove('is-hidden');
    } catch (error) { showError(error); }
    input.value = '';
  }));
  removeButton.addEventListener('click', () => {
    selectedAvatars.delete(formId);
    preview.textContent = '📷';
    removeButton.classList.add('is-hidden');
  });
});
document.querySelector('#sign-team-button').addEventListener('click', () => performAction({ type: 'decision', choice: 'sign' }));
document.querySelector('#decline-team-button').addEventListener('click', () => performAction({ type: 'decision', choice: 'decline' }));
document.querySelector('#auction-panel').addEventListener('click', (event) => {
  const bidButton = event.target.closest('[data-bid-increment]');
  if (bidButton) performAction({ type: 'bid', increment: Number(bidButton.dataset.bidIncrement) });
});
function openRecruitForSelectedTeam() {
  teamCardDialog.close();
  openFrontOffice('recruits');
  document.querySelectorAll('#front-office-content .scout-card select').forEach((select) => {
    if ([...select.options].some((option) => option.value === selectedTeamId)) select.value = selectedTeamId;
  });
}
document.querySelector('#recruit-star-button').addEventListener('click', openRecruitForSelectedTeam);
document.querySelector('#mortgage-team-button').addEventListener('click', async () => {
  teamCardDialog.close();
  await performAction({ type: 'mortgage', assetId: selectedTeamId });
});
document.querySelector('#mute-feed').addEventListener('click', (event) => { event.currentTarget.textContent = event.currentTarget.textContent === 'Sound on' ? 'Sound off' : 'Sound on'; });
document.querySelector('#card-draw-close').addEventListener('click', closeCardDraw);
board.addEventListener('click', (event) => {
  const teamButton = event.target.closest('.team-logo-button');
  if (teamButton) openTeamCard(room.board[Number(teamButton.dataset.teamIndex)], Number(teamButton.dataset.teamIndex));
  const spaceButton = event.target.closest('.space-info-button');
  if (spaceButton) openSpaceGuide(room.board[Number(spaceButton.dataset.spaceIndex)], Number(spaceButton.dataset.spaceIndex));
});
document.querySelectorAll('[data-office-tab]').forEach((button) => {
  button.addEventListener('click', () => openFrontOffice(button.dataset.officeTab));
});
document.querySelector('#front-office-content').addEventListener('click', (event) => {
  if (event.target.closest('#create-trade-button')) { openTradeCreator(); return; }
  const responseButton = event.target.closest('[data-trade-response]');
  if (responseButton) {
    performAction({ type: 'trade_respond', offerId: responseButton.dataset.offerId, accept: responseButton.dataset.tradeResponse === 'accept' })
      .then(() => renderFrontOffice('trade'));
    return;
  }
  const recruitButton = event.target.closest('[data-recruit-player]');
  if (recruitButton) {
    const assetId = recruitButton.closest('.scout-card').querySelector('select').value;
    frontOfficeDialog.close();
    performAction({ type: 'recruit', assetId, playerName: recruitButton.dataset.recruitPlayer });
    return;
  }
  const button = event.target.closest('.office-team-button');
  if (!button) return;
  const space = room.board.find((candidate) => candidate.id === button.dataset.teamId);
  const index = room.board.indexOf(space);
  frontOfficeDialog.close();
  openTeamCard(space, index);
});
document.querySelector('#trade-dialog-content').addEventListener('click', (event) => {
  const rival = event.target.closest('[data-trade-rival]');
  if (rival) renderTradeBuilder(rival.dataset.tradeRival);
});
document.querySelector('#trade-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const updatedRoom = await performAction({
    type: 'trade_create', recipientId: data.get('recipientId'),
    offeredPoints: Number(data.get('offeredPoints') || 0), requestedPoints: Number(data.get('requestedPoints') || 0),
    offeredAssetIds: data.getAll('offeredAssetIds'), requestedAssetIds: data.getAll('requestedAssetIds'),
  });
  if (!updatedRoom) return;
  tradeDialog.close();
  openFrontOffice('trade');
});
document.querySelector('#trade-close').addEventListener('click', () => tradeDialog.close());
tradeDialog.addEventListener('click', (event) => { if (event.target === tradeDialog) tradeDialog.close(); });
document.querySelector('#trade-alert-open').addEventListener('click', () => {
  document.querySelector('#trade-offer-alert').classList.remove('is-visible');
  openFrontOffice('trade');
});
document.querySelector('#trade-alert-close').addEventListener('click', () => document.querySelector('#trade-offer-alert').classList.remove('is-visible'));
document.querySelector('#front-office-close').addEventListener('click', () => frontOfficeDialog.close());
frontOfficeDialog.addEventListener('click', (event) => { if (event.target === frontOfficeDialog) frontOfficeDialog.close(); });
document.querySelector('#space-guide-close').addEventListener('click', () => spaceGuideDialog.close());
document.querySelector('#space-guide-done').addEventListener('click', () => spaceGuideDialog.close());
spaceGuideDialog.addEventListener('click', (event) => { if (event.target === spaceGuideDialog) spaceGuideDialog.close(); });
document.querySelector('#card-close').addEventListener('click', () => teamCardDialog.close());
document.querySelector('#card-primary').addEventListener('click', () => teamCardDialog.close());
teamCardDialog.addEventListener('click', (event) => { if (event.target === teamCardDialog) teamCardDialog.close(); });

const invitedRoom = new URLSearchParams(window.location.search).get('room');
if (invitedRoom && session && invitedRoom.toUpperCase() !== session.roomCode) {
  localStorage.removeItem(SESSION_KEY);
  session = null;
}
if (invitedRoom && !session) { openBasketnopoly({ join: true }); document.querySelector('#room-code').value = invitedRoom.toUpperCase(); }
if (session) {
  modeScreen.classList.add('is-hidden');
  api(`/api/rooms/${encodeURIComponent(session.roomCode)}`).then((result) => { applyRoom(result.room); connectEvents(); }).catch(() => {
    localStorage.removeItem(SESSION_KEY); session = null; showModeSelection();
  });
} else if (!invitedRoom) showModeSelection();
