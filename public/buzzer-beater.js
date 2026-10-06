(function createBuzzerBeater() {
  'use strict';

  const engine = window.BuzzerBeaterEngine;
  const canvas = document.querySelector('#buzzer-court');
  if (!engine || !canvas) return;

  const context = canvas.getContext('2d');
  const WORLD = { width: 720, height: 960, floor: 900 };
  const BALL_RADIUS = 25;
  const RIM_RADIUS = 8;
  const RIM_WIDTH = 92;
  const HIGH_SCORE_KEY = 'hoopireBuzzerBeaterHighScore';
  let state = engine.createGameState();
  let hoopSide = 'right';
  let ball = makeBall();
  let lastFrame = performance.now();
  let gameStartedAt = 0;
  let previousElapsed = 0;
  let shotAge = 0;
  let resetTimer = null;
  let calloutTimer = null;
  let leaderboardEntries = [];
  let leaderboardPrompted = false;
  let firstShot = true;

  function hoopGeometry() {
    const right = hoopSide === 'right';
    const boardX = right ? 665 : 55;
    const innerEdge = right ? 650 : 70;
    const outerEdge = right ? innerEdge - RIM_WIDTH : innerEdge + RIM_WIDTH;
    return { boardX, boardTop: 250, boardBottom: 470, left: Math.min(innerEdge, outerEdge), right: Math.max(innerEdge, outerEdge), y: 360, centerX: (innerEdge + outerEdge) / 2 };
  }

  function makeBall() {
    const x = hoopSide === 'right' ? 150 : 570;
    return { x, y: 790, previousX: x, previousY: 790, vx: 0, vy: 0, rotation: 0, inFlight: false, scored: false, hitRim: false, hitBackboard: false, trail: [] };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
  }

  function showCallout(text, tone = '') {
    const callout = document.querySelector('#buzzer-callout');
    clearTimeout(calloutTimer);
    callout.textContent = text;
    callout.className = `buzzer-callout is-visible ${tone}`;
    calloutTimer = setTimeout(() => { callout.className = 'buzzer-callout'; }, 900);
  }

  function renderLeaderboard() {
    const list = document.querySelector('#buzzer-leaderboard-list');
    list.replaceChildren();
    if (!leaderboardEntries.length) {
      const item = document.createElement('li');
      item.innerHTML = '<span>Be the first</span><b>—</b>';
      list.append(item);
      return;
    }
    leaderboardEntries.forEach((entry) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const score = document.createElement('b');
      name.textContent = entry.nickname;
      score.textContent = entry.score;
      item.append(name, score);
      list.append(item);
    });
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch('/api/buzzer/leaderboard', { cache: 'no-store' });
      if (!response.ok) throw new Error('Leaderboard unavailable.');
      const payload = await response.json();
      leaderboardEntries = Array.isArray(payload.entries) ? payload.entries.slice(0, 5) : [];
      renderLeaderboard();
      return true;
    } catch {
      document.querySelector('#buzzer-leaderboard-list').innerHTML = '<li><span>Offline</span><b>—</b></li>';
      return false;
    }
  }

  function qualifiesForLeaderboard(score) {
    return score > 0 && (leaderboardEntries.length < 5 || score > leaderboardEntries[leaderboardEntries.length - 1].score);
  }

  async function considerLeaderboard() {
    if (leaderboardPrompted) return;
    const available = await loadLeaderboard();
    if (!available || !qualifiesForLeaderboard(state.score)) return;
    leaderboardPrompted = true;
    document.querySelector('#buzzer-record-dialog').classList.remove('is-hidden');
    document.querySelector('#buzzer-nickname').focus();
  }

  async function saveLeaderboardScore(nickname) {
    const status = document.querySelector('#buzzer-record-status');
    status.textContent = 'Saving…';
    try {
      const response = await fetch('/api/buzzer/leaderboard', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nickname, score: state.score }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not save the score.');
      leaderboardEntries = payload.entries;
      renderLeaderboard();
      document.querySelector('#buzzer-record-dialog').classList.add('is-hidden');
    } catch (error) {
      status.textContent = error.message;
    }
  }

  function updateHud() {
    document.querySelector('#buzzer-clock').textContent = state.timeLeft.toFixed(1);
    document.querySelector('#buzzer-clock').closest('.buzzer-clock-panel').classList.toggle('is-clutch', state.timeLeft <= 10 && state.status === 'playing');
    document.querySelector('#buzzer-score').textContent = state.score;
    document.querySelector('#buzzer-makes').textContent = state.makes;
    document.querySelector('#buzzer-shots').textContent = state.shots;
    document.querySelector('#buzzer-streak').textContent = state.streak;
    document.querySelector('#buzzer-best').textContent = state.bestStreak;
    document.querySelector('#buzzer-level').textContent = '1';
    document.querySelector('#buzzer-goal').textContent = `${state.levelMakes} / ${state.levelTarget} MADE`;
  }

  function finishGame(cleared = false) {
    if (!document.querySelector('#buzzer-result').classList.contains('is-hidden')) return;
    state = { ...state, status: 'finished' };
    const oldBest = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    const highScore = Math.max(oldBest, state.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    const accuracy = state.shots ? Math.round((state.makes / state.shots) * 100) : 0;
    document.querySelector('#buzzer-result-score').textContent = `${state.score} PTS`;
    document.querySelector('#buzzer-result-kicker').textContent = cleared ? 'LEVEL 1 CLEARED' : 'FINAL HORN';
    document.querySelector('#buzzer-result-summary').textContent = `${state.makes} makes from ${state.shots} shots${state.score > oldBest ? ' · NEW RECORD' : ''}`;
    document.querySelector('#buzzer-accuracy').textContent = `${accuracy}%`;
    document.querySelector('#buzzer-result-streak').textContent = state.bestStreak;
    document.querySelector('#buzzer-high-score').textContent = highScore;
    document.querySelector('#buzzer-result').classList.remove('is-hidden');
    showCallout(cleared ? 'LEVEL CLEARED!' : 'FINAL HORN', cleared ? 'is-make' : 'is-clutch');
    void considerLeaderboard();
  }

  function resetBall(switchSides = false) {
    if (switchSides) hoopSide = engine.oppositeSide(hoopSide);
    ball = makeBall();
    shotAge = 0;
  }

  function settleMiss() {
    if (!ball.inFlight || ball.scored) return;
    ball.inFlight = false;
    state = engine.registerShot(state, { made: false, kind: 'normal' });
    showCallout('TRY AGAIN', 'is-miss');
    updateHud();
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => resetBall(false), 520);
  }

  function scoreBasket() {
    if (ball.scored) return;
    ball.scored = true;
    const kind = engine.classifyBasket(ball);
    const points = kind === 'swish' ? 3 : kind === 'bank' ? 2 : 1;
    state = engine.registerShot(state, { made: true, kind });
    const label = kind === 'swish' ? 'SWISH' : kind === 'bank' ? 'BANK SHOT' : 'BUCKET';
    showCallout(`${label} +${points}`, kind === 'swish' ? 'is-clutch' : 'is-make');
    updateHud();
    clearTimeout(resetTimer);
    if (engine.isLevelComplete(state)) {
      resetTimer = setTimeout(() => finishGame(true), 750);
      return;
    }
    resetTimer = setTimeout(() => resetBall(true), 520);
  }

  function launchTapShot() {
    if (state.status !== 'playing' || ball.inFlight) return;
    const velocity = engine.calculateTapVelocity(hoopSide);
    Object.assign(ball, { vx: velocity.x, vy: velocity.y, inFlight: true, scored: false, hitRim: false, hitBackboard: false, trail: [] });
    shotAge = 0;
    if (firstShot) {
      firstShot = false;
      showCallout('TAP. FLY. SCORE.', 'is-make');
    }
  }

  function collideRim(cx, cy) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const distance = Math.hypot(dx, dy);
    const minimum = BALL_RADIUS + RIM_RADIUS;
    if (distance >= minimum || distance === 0) return;
    ball.hitRim = true;
    const nx = dx / distance;
    const ny = dy / distance;
    ball.x = cx + nx * minimum;
    ball.y = cy + ny * minimum;
    const approach = ball.vx * nx + ball.vy * ny;
    if (approach < 0) {
      ball.vx -= 1.7 * approach * nx;
      ball.vy -= 1.7 * approach * ny;
    }
  }

  function collideBackboard(hoop) {
    if (ball.y + BALL_RADIUS < hoop.boardTop || ball.y - BALL_RADIUS > hoop.boardBottom) return;
    if (hoopSide === 'right' && ball.previousX + BALL_RADIUS < hoop.boardX && ball.x + BALL_RADIUS >= hoop.boardX) {
      ball.x = hoop.boardX - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * 0.72;
      ball.hitBackboard = true;
    } else if (hoopSide === 'left' && ball.previousX - BALL_RADIUS > hoop.boardX && ball.x - BALL_RADIUS <= hoop.boardX) {
      ball.x = hoop.boardX + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * 0.72;
      ball.hitBackboard = true;
    }
  }

  function updatePhysics(delta) {
    if (!ball.inFlight) return;
    const hoop = hoopGeometry();
    ball.previousX = ball.x;
    ball.previousY = ball.y;
    ball.vy += 980 * delta;
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;
    ball.rotation += ball.vx * delta / BALL_RADIUS;
    shotAge += delta;
    if (!ball.trail.length || shotAge - ball.trail[ball.trail.length - 1].age > 0.04) {
      ball.trail.push({ x: ball.x, y: ball.y, age: shotAge });
      if (ball.trail.length > 10) ball.trail.shift();
    }
    collideBackboard(hoop);
    collideRim(hoop.left, hoop.y);
    collideRim(hoop.right, hoop.y);
    if (!ball.scored && engine.crossedHoop(
      { x: ball.previousX, y: ball.previousY }, { x: ball.x, y: ball.y },
      { left: hoop.left + BALL_RADIUS * 0.35, right: hoop.right - BALL_RADIUS * 0.35, y: hoop.y + 5 },
    )) scoreBasket();
    if (ball.y + BALL_RADIUS >= WORLD.floor) {
      ball.y = WORLD.floor - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * 0.42;
      ball.vx *= 0.7;
      if (Math.abs(ball.vy) < 85 || shotAge > 2.6) settleMiss();
    }
    if (ball.x < -100 || ball.x > WORLD.width + 100 || ball.y > WORLD.height + 80 || shotAge > 4.5) settleMiss();
  }

  function drawBackdrop() {
    const sky = context.createLinearGradient(0, 0, 0, WORLD.height);
    sky.addColorStop(0, '#05080d'); sky.addColorStop(0.48, '#1a232b'); sky.addColorStop(1, '#303237');
    context.fillStyle = sky; context.fillRect(0, 0, WORLD.width, WORLD.height);
    context.fillStyle = 'rgba(255,255,255,.035)';
    for (let row = 0; row < 7; row += 1) {
      for (let seat = 0; seat < 18; seat += 1) {
        const x = 12 + seat * 42 + (row % 2) * 17;
        const y = 100 + row * 35;
        context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill(); context.fillRect(x - 7, y + 7, 14, 18);
      }
    }
    const floor = context.createLinearGradient(0, 670, 0, WORLD.floor);
    floor.addColorStop(0, '#a95827'); floor.addColorStop(1, '#e7a95f');
    context.fillStyle = floor; context.fillRect(0, 670, WORLD.width, WORLD.floor - 670);
    context.strokeStyle = 'rgba(255,243,218,.68)'; context.lineWidth = 5;
    context.beginPath(); context.moveTo(0, WORLD.floor); context.lineTo(WORLD.width, WORLD.floor); context.stroke();
  }

  function drawBackboard(hoop) {
    context.save();
    context.strokeStyle = '#f4f7f8'; context.lineWidth = 10;
    context.beginPath(); context.moveTo(hoop.boardX, hoop.boardTop); context.lineTo(hoop.boardX, hoop.boardBottom); context.stroke();
    context.strokeStyle = 'rgba(80,211,227,.8)'; context.lineWidth = 3;
    context.beginPath(); context.moveTo(hoop.boardX, hoop.boardTop + 55); context.lineTo(hoop.boardX, hoop.boardTop + 135); context.stroke();
    context.restore();
  }

  function drawSideHoop() {
    const hoop = hoopGeometry();
    drawBackboard(hoop);
    context.save();
    context.strokeStyle = '#f56b25'; context.lineWidth = 10;
    context.beginPath(); context.moveTo(hoop.left, hoop.y); context.lineTo(hoop.right, hoop.y); context.stroke();
    context.strokeStyle = 'rgba(244,249,250,.88)'; context.lineWidth = 2;
    for (let index = 0; index <= 6; index += 1) {
      const x = hoop.left + index * (RIM_WIDTH / 6);
      const bottomX = hoop.centerX + (x - hoop.centerX) * 0.45;
      context.beginPath(); context.moveTo(x, hoop.y + 5); context.lineTo(bottomX, hoop.y + 100); context.stroke();
    }
    for (let row = 1; row <= 4; row += 1) {
      const y = hoop.y + row * 21;
      const width = RIM_WIDTH * (1 - row * 0.11);
      context.beginPath(); context.moveTo(hoop.centerX - width / 2, y); context.lineTo(hoop.centerX + width / 2, y); context.stroke();
    }
    context.restore();
  }

  function drawTapHint() {
    if (!firstShot || state.status !== 'playing') return;
    context.save();
    context.fillStyle = 'rgba(2,8,14,.76)'; context.fillRect(205, 520, 310, 64);
    context.strokeStyle = '#50d3e3'; context.strokeRect(205, 520, 310, 64);
    context.fillStyle = '#fff4dd'; context.font = '900 25px "Arial Narrow", sans-serif'; context.textAlign = 'center';
    context.fillText('TAP ANYWHERE TO SHOOT', 360, 561);
    context.restore();
  }

  function drawBall() {
    ball.trail.forEach((mark, index) => {
      context.globalAlpha = ((index + 1) / ball.trail.length) * 0.16;
      context.fillStyle = '#ff9a45'; context.beginPath(); context.arc(mark.x, mark.y, BALL_RADIUS * 0.45, 0, Math.PI * 2); context.fill();
    });
    context.globalAlpha = 1;
    context.save(); context.translate(ball.x, ball.y); context.rotate(ball.rotation);
    const glow = context.createRadialGradient(-8, -10, 2, 0, 0, BALL_RADIUS);
    glow.addColorStop(0, '#ffc066'); glow.addColorStop(0.52, '#ef7627'); glow.addColorStop(1, '#8f2609');
    context.fillStyle = glow; context.beginPath(); context.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#4a1b11'; context.lineWidth = 3;
    context.beginPath(); context.arc(0, 0, BALL_RADIUS - 2, -0.9, 0.9); context.stroke();
    context.beginPath(); context.arc(0, 0, BALL_RADIUS - 2, Math.PI - 0.9, Math.PI + 0.9); context.stroke();
    context.beginPath(); context.moveTo(-BALL_RADIUS, 0); context.lineTo(BALL_RADIUS, 0); context.moveTo(0, -BALL_RADIUS); context.lineTo(0, BALL_RADIUS); context.stroke();
    context.restore();
  }

  function draw() {
    context.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
    drawBackdrop(); drawSideHoop(); drawTapHint(); drawBall();
  }

  function frame(now) {
    const delta = Math.min(0.025, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    if (state.status === 'playing') {
      const elapsed = (now - gameStartedAt) / 1000;
      state = engine.tickClock(state, elapsed - previousElapsed);
      previousElapsed = elapsed;
      if (state.status === 'finished') finishGame(false);
      updatePhysics(delta); updateHud();
    }
    draw(); requestAnimationFrame(frame);
  }

  function startGame() {
    clearTimeout(resetTimer);
    state = { ...engine.createGameState(), status: 'playing' };
    hoopSide = 'right'; ball = makeBall(); firstShot = true; leaderboardPrompted = false;
    gameStartedAt = performance.now(); previousElapsed = 0;
    document.querySelector('#buzzer-start-overlay').classList.add('is-hidden');
    document.querySelector('#buzzer-result').classList.add('is-hidden');
    document.querySelector('#buzzer-record-dialog').classList.add('is-hidden');
    document.querySelector('#buzzer-record-status').textContent = '';
    showCallout('60 SECONDS. TAP!', 'is-make'); updateHud();
  }

  function reset() {
    clearTimeout(resetTimer);
    state = engine.createGameState(); hoopSide = 'right'; ball = makeBall(); firstShot = true; leaderboardPrompted = false;
    document.querySelector('#buzzer-result').classList.add('is-hidden');
    document.querySelector('#buzzer-record-dialog').classList.add('is-hidden');
    document.querySelector('#buzzer-start-overlay').classList.remove('is-hidden');
    updateHud(); requestAnimationFrame(resizeCanvas);
  }

  function replayTutorial() {
    const tutorial = document.querySelector('#buzzer-tutorial');
    const animatedParts = tutorial.querySelectorAll('.buzzer-demo-ball, .buzzer-demo-hand, .buzzer-tutorial-caption, .buzzer-tutorial-progress');
    animatedParts.forEach((part) => { part.style.animation = 'none'; });
    void tutorial.offsetWidth;
    animatedParts.forEach((part) => { part.style.animation = ''; });
  }

  canvas.addEventListener('pointerdown', () => { launchTapShot(); });
  document.querySelector('#buzzer-start').addEventListener('click', startGame);
  document.querySelector('#buzzer-tutorial-replay').addEventListener('click', replayTutorial);
  document.querySelector('#buzzer-how-to-play').addEventListener('click', () => { reset(); replayTutorial(); });
  document.querySelector('#buzzer-play-again').addEventListener('click', startGame);
  document.querySelector('#buzzer-save-nickname').addEventListener('click', () => {
    const nickname = document.querySelector('#buzzer-nickname').value.trim();
    if (!nickname) { document.querySelector('#buzzer-record-status').textContent = 'Enter a nickname, or choose Anonymous.'; return; }
    void saveLeaderboardScore(nickname);
  });
  document.querySelector('#buzzer-save-anonymous').addEventListener('click', () => { void saveLeaderboardScore('Anonymous'); });
  window.addEventListener('resize', resizeCanvas);

  window.BuzzerBeater = { reset, start: startGame };
  resizeCanvas(); reset(); void loadLeaderboard(); requestAnimationFrame(frame);
}());
