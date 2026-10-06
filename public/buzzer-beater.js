(function createBuzzerBeater() {
  'use strict';

  const engine = window.BuzzerBeaterEngine;
  const canvas = document.querySelector('#buzzer-court');
  if (!engine || !canvas) return;

  const context = canvas.getContext('2d');
  const WORLD = { width: 1000, height: 625, floor: 565 };
  const COURT_HORIZON = 315;
  const HOOP = { left: 445, right: 555, y: 210, rimRadius: 8 };
  const HOOP_CENTER_X = WORLD.width / 2;
  const HOOP_HALF_WIDTH = (HOOP.right - HOOP.left) / 2;
  const HOOP_RIM_DEPTH = 13;
  const BALL_RADIUS = 23;
  const HIGH_SCORE_KEY = 'hoopireBuzzerBeaterHighScore';
  const positions = [{ x: 350, y: 525, three: true }, { x: 500, y: 525, three: false }, { x: 650, y: 525, three: true }];
  let positionIndex = 0;
  let state = engine.createGameState();
  let ball = makeBall();
  let dragging = false;
  let pointer = { x: ball.x, y: ball.y };
  let lastFrame = performance.now();
  let shotAge = 0;
  let resetTimer = null;
  let calloutTimer = null;
  let gameStartedAt = 0;
  let previousElapsed = 0;
  let levelTransitioning = false;
  let leaderboardEntries = [];
  let leaderboardPrompted = false;

  function hoopCenterX() {
    return (HOOP.left + HOOP.right) / 2;
  }

  function centerHoop() {
    HOOP.left = HOOP_CENTER_X - HOOP_HALF_WIDTH;
    HOOP.right = HOOP_CENTER_X + HOOP_HALF_WIDTH;
  }

  function updateMovingHoop(now) {
    if (state.level !== 2 || state.status !== 'playing') {
      centerHoop();
      return;
    }
    const center = HOOP_CENTER_X + Math.sin((now - gameStartedAt) / 450) * 155;
    HOOP.left = center - HOOP_HALF_WIDTH;
    HOOP.right = center + HOOP_HALF_WIDTH;
  }

  function makeBall() {
    const start = positions[positionIndex % positions.length];
    return { x: start.x, y: start.y, previousX: start.x, previousY: start.y, vx: 0, vy: 0, rotation: 0, inFlight: false, scored: false, three: start.three };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    context.setTransform((canvas.width / WORLD.width), 0, 0, (canvas.height / WORLD.height), 0, 0);
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * WORLD.width, y: ((event.clientY - rect.top) / rect.height) * WORLD.height };
  }

  function showCallout(text, tone = '') {
    const callout = document.querySelector('#buzzer-callout');
    clearTimeout(calloutTimer);
    callout.textContent = text;
    callout.className = `buzzer-callout is-visible ${tone}`;
    calloutTimer = setTimeout(() => { callout.className = 'buzzer-callout'; }, 780);
  }

  function updatePowerMeter(speed = 0, charging = false) {
    const percent = Math.round(Math.min(100, Math.max(0, (speed / 1100) * 100)));
    const meter = document.querySelector('#buzzer-power');
    document.querySelector('#buzzer-power-fill').style.width = `${percent}%`;
    document.querySelector('#buzzer-power-value').textContent = `${percent}%`;
    meter.setAttribute('aria-valuenow', String(percent));
    meter.classList.toggle('is-charging', charging);
  }

  function renderLeaderboard() {
    const list = document.querySelector('#buzzer-leaderboard-list');
    list.replaceChildren();
    if (!leaderboardEntries.length) {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const score = document.createElement('b');
      name.textContent = 'Be the first';
      score.textContent = '—';
      item.append(name, score);
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
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nickname, score: state.score }),
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
    document.querySelector('#buzzer-streak').textContent = state.streak >= 5 ? `${state.streak} · 2×` : state.streak;
    document.querySelector('#buzzer-best').textContent = state.bestStreak;
    document.querySelector('#buzzer-level').textContent = state.level;
    document.querySelector('#buzzer-goal').textContent = `${state.levelMakes} / ${state.levelTarget} MADE${state.level === 2 ? ' · MOVING RIM' : ''}`;
  }

  function finishGame() {
    if (!document.querySelector('#buzzer-result').classList.contains('is-hidden')) return;
    const oldBest = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    const highScore = Math.max(oldBest, state.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    const accuracy = state.shots ? Math.round((state.makes / state.shots) * 100) : 0;
    document.querySelector('#buzzer-result-score').textContent = `${state.score} PTS`;
    const cleared = engine.isLevelComplete(state) && state.level === state.maxLevel;
    document.querySelector('#buzzer-result-kicker').textContent = cleared ? 'BOTH LEVELS CLEARED' : `LEVEL ${state.level} ENDED`;
    document.querySelector('#buzzer-result-summary').textContent = `${state.levelMakes}/${state.levelTarget} level makes · ${state.makes} total from ${state.shots} shots${state.score > oldBest ? ' · NEW RECORD' : ''}`;
    document.querySelector('#buzzer-accuracy').textContent = `${accuracy}%`;
    document.querySelector('#buzzer-result-streak').textContent = state.bestStreak;
    document.querySelector('#buzzer-high-score').textContent = highScore;
    document.querySelector('#buzzer-result').classList.remove('is-hidden');
    showCallout('FINAL HORN', 'is-clutch');
    void considerLeaderboard();
  }

  function startNextLevel() {
    state = engine.advanceLevel(state);
    levelTransitioning = false;
    leaderboardPrompted = false;
    centerHoop();
    gameStartedAt = performance.now();
    previousElapsed = 0;
    resetBall();
    showCallout('LEVEL 2 · MOVING RIM', 'is-make');
    updateHud();
  }

  function handleLevelClear() {
    if (!engine.isLevelComplete(state) || levelTransitioning) return;
    levelTransitioning = true;
    ball.inFlight = false;
    clearTimeout(resetTimer);
    if (state.level < state.maxLevel) {
      showCallout('LEVEL 1 CLEARED!', 'is-make');
      resetTimer = setTimeout(startNextLevel, 900);
      return;
    }
    state = { ...state, status: 'finished' };
    showCallout('LEVEL 2 CLEARED!', 'is-make');
    resetTimer = setTimeout(finishGame, 650);
  }

  function settleShot(made = false) {
    if (!ball.inFlight) return;
    ball.inFlight = false;
    if (!ball.scored) {
      state = engine.registerShot(state, { made, isThreePointer: ball.three });
      ball.scored = made;
      showCallout(made ? 'BUCKET!' : 'MISS', made ? 'is-make' : 'is-miss');
      updateHud();
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetBall, 560);
  }

  function resetBall() {
    positionIndex += 1;
    ball = makeBall();
    pointer = { x: ball.x, y: ball.y };
    shotAge = 0;
  }

  function collideCircle(cx, cy, radius) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const distance = Math.hypot(dx, dy);
    const minimum = BALL_RADIUS + radius;
    if (distance >= minimum || distance === 0) return;
    const nx = dx / distance;
    const ny = dy / distance;
    ball.x = cx + nx * minimum;
    ball.y = cy + ny * minimum;
    const approach = ball.vx * nx + ball.vy * ny;
    if (approach < 0) {
      ball.vx -= 1.72 * approach * nx;
      ball.vy -= 1.72 * approach * ny;
    }
  }

  function updatePhysics(delta) {
    if (!ball.inFlight) return;
    ball.previousX = ball.x;
    ball.previousY = ball.y;
    ball.vy += 980 * delta;
    ball.vx *= Math.pow(0.997, delta * 60);
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;
    ball.rotation += ball.vx * delta / BALL_RADIUS;
    shotAge += delta;

    collideCircle(HOOP.left, HOOP.y, HOOP.rimRadius);
    collideCircle(HOOP.right, HOOP.y, HOOP.rimRadius);

    if (!ball.scored && engine.crossedHoop(
      { x: ball.previousX, y: ball.previousY },
      { x: ball.x, y: ball.y },
      { left: HOOP.left + 8, right: HOOP.right - 8, y: HOOP.y + 5 },
    )) {
      ball.scored = true;
      state = engine.registerShot(state, { made: true, isThreePointer: ball.three });
      showCallout(state.timeLeft <= 10 ? 'BUZZER BUCKET! ×2' : (ball.three ? 'THREE!' : 'SWISH!'), 'is-make');
      updateHud();
      handleLevelClear();
    }

    if (ball.y + BALL_RADIUS > WORLD.floor) {
      ball.y = WORLD.floor - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * 0.58;
      ball.vx *= 0.78;
      if (Math.abs(ball.vy) < 65 && shotAge > 0.7) settleShot(ball.scored);
    }
    if (ball.x < -80 || ball.x > WORLD.width + 80 || ball.y > WORLD.height + 100 || shotAge > 5) settleShot(ball.scored);
  }

  function drawArenaLights() {
    const light = context.createRadialGradient(HOOP_CENTER_X, 55, 0, HOOP_CENTER_X, 55, 360);
    light.addColorStop(0, 'rgba(255,248,220,.38)');
    light.addColorStop(0.36, 'rgba(123,201,255,.1)');
    light.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = light;
    context.fillRect(150, 0, 700, 470);

  }

  function drawCrowdBowl() {
    const stand = context.createLinearGradient(0, 38, 0, COURT_HORIZON);
    stand.addColorStop(0, '#02070c');
    stand.addColorStop(1, '#142838');
    context.fillStyle = stand;
    context.fillRect(0, 36, WORLD.width, COURT_HORIZON - 36);
    for (let row = 0; row < 8; row += 1) {
      const y = 72 + row * 29;
      context.fillStyle = row % 2 ? 'rgba(137,160,173,.22)' : 'rgba(223,230,232,.16)';
      for (let seat = 0; seat < 38; seat += 1) {
        const x = 8 + seat * 27 + (row % 2) * 11;
        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI * 2);
        context.fill();
        context.fillRect(x - 5, y + 5, 10, 13);
      }
    }
    context.fillStyle = '#07131d';
    context.fillRect(0, COURT_HORIZON - 18, WORLD.width, 18);
  }

  function drawStraightOnCourt() {
    const floor = context.createLinearGradient(0, COURT_HORIZON, 0, WORLD.height);
    floor.addColorStop(0, '#b9602c');
    floor.addColorStop(0.45, '#d98542');
    floor.addColorStop(1, '#f2bc72');
    context.fillStyle = floor;
    context.beginPath();
    context.moveTo(0, COURT_HORIZON);
    context.lineTo(WORLD.width, COURT_HORIZON);
    context.lineTo(WORLD.width, WORLD.height);
    context.lineTo(0, WORLD.height);
    context.closePath();
    context.fill();

    context.save();
    context.beginPath();
    context.moveTo(0, COURT_HORIZON);
    context.lineTo(WORLD.width, COURT_HORIZON);
    context.lineTo(WORLD.width, WORLD.height);
    context.lineTo(0, WORLD.height);
    context.closePath();
    context.clip();
    context.strokeStyle = 'rgba(74,31,10,.28)';
    context.lineWidth = 2;
    for (let x = -120; x < WORLD.width + 120; x += 46) {
      context.beginPath();
      context.moveTo(HOOP_CENTER_X + (x - HOOP_CENTER_X) * 0.38, COURT_HORIZON);
      context.lineTo(x, WORLD.height);
      context.stroke();
    }
    context.fillStyle = 'rgba(22,91,112,.55)';
    context.beginPath();
    context.moveTo(397, COURT_HORIZON);
    context.lineTo(603, COURT_HORIZON);
    context.lineTo(700, WORLD.floor);
    context.lineTo(300, WORLD.floor);
    context.closePath();
    context.fill();
    context.strokeStyle = 'rgba(255,246,226,.72)';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(0, COURT_HORIZON);
    context.lineTo(WORLD.width, COURT_HORIZON);
    context.stroke();
    context.beginPath();
    context.ellipse(HOOP_CENTER_X, 474, 170, 50, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(HOOP_CENTER_X, 644, 240, 88, 0, Math.PI, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(300, WORLD.floor);
    context.lineTo(397, COURT_HORIZON);
    context.moveTo(700, WORLD.floor);
    context.lineTo(603, COURT_HORIZON);
    context.stroke();
    context.restore();
  }

  function drawShotTarget() {
    const pulse = 0.5 + Math.sin(performance.now() / 320) * 0.15;
    context.save();
    context.strokeStyle = `rgba(255,220,117,${pulse})`;
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(hoopCenterX(), HOOP.y + 2, 54, 17, 0, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = 'rgba(4,14,24,.74)';
    context.fillRect(HOOP_CENTER_X - 77, 44, 154, 34);
    context.fillStyle = '#ffe19a';
    context.font = '700 15px "Arial Narrow", sans-serif';
    context.textAlign = 'center';
    context.fillText('AIM FOR THE RIM', HOOP_CENTER_X, 67);
    context.restore();
  }

  function drawArena() {
    const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, '#020811');
    gradient.addColorStop(0.42, '#071d2d');
    gradient.addColorStop(0.43, '#102c3d');
    gradient.addColorStop(1, '#07131e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, WORLD.width, WORLD.height);
    drawArenaLights();
    drawCrowdBowl();
    drawStraightOnCourt();
  }

  function drawFloatingRim() {
    const centerX = hoopCenterX();
    context.save();
    context.strokeStyle = 'rgba(241,248,250,.85)';
    context.lineWidth = 2;
    for (let index = 0; index <= 8; index += 1) {
      const x = HOOP.left + index * ((HOOP.right - HOOP.left) / 8);
      context.beginPath();
      context.moveTo(x, HOOP.y + 5);
      context.lineTo(centerX + (x - centerX) * 0.55, HOOP.y + 74);
      context.stroke();
    }
    for (let row = 1; row <= 3; row += 1) {
      const y = HOOP.y + row * 18;
      const inset = row * 6;
      context.beginPath();
      context.ellipse(centerX, y, HOOP_HALF_WIDTH - inset, HOOP_RIM_DEPTH * 0.72, 0, 0, Math.PI * 2);
      context.stroke();
    }

    context.strokeStyle = '#f56b25';
    context.lineWidth = 9;
    context.beginPath();
    context.ellipse(hoopCenterX(), HOOP.y, HOOP_HALF_WIDTH, HOOP_RIM_DEPTH, 0, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = 'rgba(255,188,122,.9)';
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(centerX, HOOP.y - 2, HOOP_HALF_WIDTH - 3, HOOP_RIM_DEPTH - 3, 0, Math.PI, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawAimGuide() {
    if (!dragging) return;
    const velocity = engine.calculateLaunchVelocity(ball, pointer);
    const speed = Math.hypot(velocity.x, velocity.y);
    updatePowerMeter(speed, true);
    for (let step = 1; step <= 8; step += 1) {
      const time = step * 0.085;
      const x = ball.x + velocity.x * time;
      const y = ball.y + velocity.y * time + 490 * time * time;
      context.globalAlpha = 1 - step / 10;
      context.fillStyle = '#fff4dd';
      context.beginPath(); context.arc(x, y, 5 - step * 0.25, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
  }

  function drawBall() {
    context.save();
    context.translate(ball.x, ball.y);
    context.rotate(ball.rotation);
    const glow = context.createRadialGradient(-8, -10, 2, 0, 0, BALL_RADIUS);
    glow.addColorStop(0, '#ffb65b'); glow.addColorStop(0.5, '#ef7627'); glow.addColorStop(1, '#9f3512');
    context.fillStyle = glow;
    context.beginPath(); context.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#4a1b11'; context.lineWidth = 2.6;
    context.beginPath(); context.arc(0, 0, BALL_RADIUS - 2, -0.9, 0.9); context.stroke();
    context.beginPath(); context.arc(0, 0, BALL_RADIUS - 2, Math.PI - 0.9, Math.PI + 0.9); context.stroke();
    context.beginPath(); context.moveTo(-BALL_RADIUS, 0); context.lineTo(BALL_RADIUS, 0); context.moveTo(0, -BALL_RADIUS); context.lineTo(0, BALL_RADIUS); context.stroke();
    context.restore();
  }

  function draw() {
    context.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
    drawArena();
    drawFloatingRim();
    drawShotTarget();
    drawAimGuide();
    drawBall();
  }

  function frame(now) {
    const delta = Math.min(0.025, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    if (state.status === 'playing') {
      updateMovingHoop(now);
      const elapsed = (now - gameStartedAt) / 1000;
      state = engine.tickClock(state, elapsed - previousElapsed);
      previousElapsed = elapsed;
      if (state.status === 'finished') finishGame();
      updatePhysics(delta);
      updateHud();
    }
    draw();
    requestAnimationFrame(frame);
  }

  function startGame() {
    clearTimeout(resetTimer);
    state = { ...engine.createGameState(), status: 'playing' };
    positionIndex = 0;
    levelTransitioning = false;
    leaderboardPrompted = false;
    centerHoop();
    ball = makeBall();
    gameStartedAt = performance.now();
    previousElapsed = 0;
    document.querySelector('#buzzer-start-overlay').classList.add('is-hidden');
    document.querySelector('#buzzer-result').classList.add('is-hidden');
    document.querySelector('#buzzer-record-dialog').classList.add('is-hidden');
    document.querySelector('#buzzer-record-status').textContent = '';
    showCallout('60 SECONDS. GO!', 'is-make');
    updateHud();
  }

  function reset() {
    clearTimeout(resetTimer);
    state = engine.createGameState();
    positionIndex = 0;
    levelTransitioning = false;
    leaderboardPrompted = false;
    centerHoop();
    ball = makeBall();
    dragging = false;
    updatePowerMeter();
    document.querySelector('#buzzer-result').classList.add('is-hidden');
    document.querySelector('#buzzer-record-dialog').classList.add('is-hidden');
    document.querySelector('#buzzer-start-overlay').classList.remove('is-hidden');
    updateHud();
    requestAnimationFrame(resizeCanvas);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (state.status !== 'playing' || ball.inFlight) return;
    const point = canvasPoint(event);
    if (Math.hypot(point.x - ball.x, point.y - ball.y) > BALL_RADIUS * 2.2) return;
    dragging = true;
    pointer = point;
    updatePowerMeter(0, true);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    pointer = canvasPoint(event);
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    pointer = canvasPoint(event);
    const velocity = engine.calculateLaunchVelocity(ball, pointer);
    if (Math.hypot(velocity.x, velocity.y) < 130 || velocity.y >= -40) {
      updatePowerMeter();
      showCallout('PULL BACK & UP', 'is-miss');
      return;
    }
    ball.vx = velocity.x;
    ball.vy = velocity.y;
    ball.inFlight = true;
    ball.scored = false;
    shotAge = 0;
    updatePowerMeter();
  });
  canvas.addEventListener('pointercancel', () => { dragging = false; updatePowerMeter(); });
  document.querySelector('#buzzer-start').addEventListener('click', startGame);
  document.querySelector('#buzzer-play-again').addEventListener('click', startGame);
  document.querySelector('#buzzer-save-nickname').addEventListener('click', () => {
    const nickname = document.querySelector('#buzzer-nickname').value.trim();
    if (!nickname) {
      document.querySelector('#buzzer-record-status').textContent = 'Enter a nickname, or choose Anonymous.';
      return;
    }
    void saveLeaderboardScore(nickname);
  });
  document.querySelector('#buzzer-save-anonymous').addEventListener('click', () => { void saveLeaderboardScore('Anonymous'); });
  window.addEventListener('resize', resizeCanvas);

  window.BuzzerBeater = { reset, start: startGame };
  resizeCanvas();
  reset();
  void loadLeaderboard();
  requestAnimationFrame(frame);
}());
