(function createBuzzerBeater() {
  'use strict';

  const engine = window.BuzzerBeaterEngine;
  const canvas = document.querySelector('#buzzer-court');
  if (!engine || !canvas) return;

  const context = canvas.getContext('2d');
  const WORLD = { width: 1000, height: 625, floor: 565 };
  const HOOP = { left: 786, right: 858, y: 246, rimRadius: 8, boardX: 888, boardTop: 120, boardBottom: 290 };
  const BALL_RADIUS = 23;
  const HIGH_SCORE_KEY = 'hoopireBuzzerBeaterHighScore';
  const positions = [{ x: 185, y: 516, three: true }, { x: 300, y: 516, three: true }, { x: 405, y: 516, three: false }];
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

  function updateHud() {
    document.querySelector('#buzzer-clock').textContent = state.timeLeft.toFixed(1);
    document.querySelector('#buzzer-clock').closest('.buzzer-clock-panel').classList.toggle('is-clutch', state.timeLeft <= 10 && state.status === 'playing');
    document.querySelector('#buzzer-score').textContent = state.score;
    document.querySelector('#buzzer-makes').textContent = state.makes;
    document.querySelector('#buzzer-shots').textContent = state.shots;
    document.querySelector('#buzzer-streak').textContent = state.streak >= 5 ? `${state.streak} · 2×` : state.streak;
    document.querySelector('#buzzer-best').textContent = state.bestStreak;
  }

  function finishGame() {
    if (!document.querySelector('#buzzer-result').classList.contains('is-hidden')) return;
    const oldBest = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    const highScore = Math.max(oldBest, state.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    const accuracy = state.shots ? Math.round((state.makes / state.shots) * 100) : 0;
    document.querySelector('#buzzer-result-score').textContent = `${state.score} PTS`;
    document.querySelector('#buzzer-result-summary').textContent = `${state.makes} makes from ${state.shots} shots${state.score > oldBest ? ' · NEW RECORD' : ''}`;
    document.querySelector('#buzzer-accuracy').textContent = `${accuracy}%`;
    document.querySelector('#buzzer-result-streak').textContent = state.bestStreak;
    document.querySelector('#buzzer-high-score').textContent = highScore;
    document.querySelector('#buzzer-result').classList.remove('is-hidden');
    showCallout('FINAL HORN', 'is-clutch');
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

    if (ball.x + BALL_RADIUS >= HOOP.boardX && ball.previousX + BALL_RADIUS < HOOP.boardX && ball.y > HOOP.boardTop && ball.y < HOOP.boardBottom) {
      ball.x = HOOP.boardX - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * 0.72;
    }
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
    }

    if (ball.y + BALL_RADIUS > WORLD.floor) {
      ball.y = WORLD.floor - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * 0.58;
      ball.vx *= 0.78;
      if (Math.abs(ball.vy) < 65 && shotAge > 0.7) settleShot(ball.scored);
    }
    if (ball.x < -80 || ball.x > WORLD.width + 80 || ball.y > WORLD.height + 100 || shotAge > 5) settleShot(ball.scored);
  }

  function drawArena() {
    const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, '#020811');
    gradient.addColorStop(0.42, '#071d2d');
    gradient.addColorStop(0.43, '#b85522');
    gradient.addColorStop(1, '#d88a3f');
    context.fillStyle = gradient;
    context.fillRect(0, 0, WORLD.width, WORLD.height);

    context.fillStyle = 'rgba(255,255,255,.07)';
    for (let row = 0; row < 5; row += 1) {
      for (let seat = 0; seat < 44; seat += 1) {
        context.beginPath();
        context.arc(12 + seat * 23, 35 + row * 24, 3 + (row % 2), 0, Math.PI * 2);
        context.fill();
      }
    }
    const light = context.createRadialGradient(790, 70, 0, 790, 70, 320);
    light.addColorStop(0, 'rgba(255,244,210,.32)');
    light.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = light;
    context.fillRect(450, 0, 550, 450);

    context.strokeStyle = 'rgba(72,35,12,.35)';
    context.lineWidth = 2;
    for (let x = 0; x < WORLD.width; x += 56) { context.beginPath(); context.moveTo(x, 270); context.lineTo(x + 70, WORLD.height); context.stroke(); }
    context.strokeStyle = 'rgba(255,244,221,.65)';
    context.lineWidth = 4;
    context.beginPath(); context.moveTo(0, WORLD.floor); context.lineTo(WORLD.width, WORLD.floor); context.stroke();
    context.beginPath(); context.arc(820, WORLD.floor, 180, Math.PI, Math.PI * 2); context.stroke();
    context.setLineDash([10, 12]);
    context.beginPath(); context.arc(820, WORLD.floor, 360, Math.PI, Math.PI * 1.5); context.stroke();
    context.setLineDash([]);
  }

  function drawHoop() {
    context.fillStyle = 'rgba(235,245,255,.22)';
    context.fillRect(HOOP.boardX, HOOP.boardTop, 12, HOOP.boardBottom - HOOP.boardTop);
    context.strokeStyle = '#f7fbff'; context.lineWidth = 6; context.strokeRect(HOOP.boardX - 3, HOOP.boardTop, 92, 125);
    context.strokeStyle = '#ff6d24'; context.lineWidth = 9;
    context.beginPath(); context.moveTo(HOOP.left, HOOP.y); context.lineTo(HOOP.right, HOOP.y); context.stroke();
    context.strokeStyle = 'rgba(236,246,255,.72)'; context.lineWidth = 2;
    for (let x = HOOP.left + 5; x <= HOOP.right - 5; x += 12) { context.beginPath(); context.moveTo(x, HOOP.y + 4); context.lineTo(822, HOOP.y + 74); context.stroke(); }
    context.beginPath(); context.moveTo(HOOP.left + 5, HOOP.y + 27); context.lineTo(HOOP.right - 5, HOOP.y + 27); context.moveTo(HOOP.left + 15, HOOP.y + 52); context.lineTo(HOOP.right - 15, HOOP.y + 52); context.stroke();
    context.fillStyle = '#23394e'; context.fillRect(919, HOOP.boardBottom, 15, WORLD.floor - HOOP.boardBottom);
  }

  function drawAimGuide() {
    if (!dragging) return;
    const velocity = engine.calculateLaunchVelocity(ball, pointer);
    const speed = Math.hypot(velocity.x, velocity.y);
    document.querySelector('#buzzer-power-fill').style.width = `${Math.min(100, (speed / 1100) * 100)}%`;
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
    drawHoop();
    drawAimGuide();
    drawBall();
  }

  function frame(now) {
    const delta = Math.min(0.025, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    if (state.status === 'playing') {
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
    ball = makeBall();
    gameStartedAt = performance.now();
    previousElapsed = 0;
    document.querySelector('#buzzer-start-overlay').classList.add('is-hidden');
    document.querySelector('#buzzer-result').classList.add('is-hidden');
    showCallout('60 SECONDS. GO!', 'is-make');
    updateHud();
  }

  function reset() {
    clearTimeout(resetTimer);
    state = engine.createGameState();
    positionIndex = 0;
    ball = makeBall();
    dragging = false;
    document.querySelector('#buzzer-power-fill').style.width = '0%';
    document.querySelector('#buzzer-result').classList.add('is-hidden');
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
    if (Math.hypot(velocity.x, velocity.y) < 130 || velocity.x <= 0 || velocity.y >= -40) {
      document.querySelector('#buzzer-power-fill').style.width = '0%';
      showCallout('PULL BACK & UP', 'is-miss');
      return;
    }
    ball.vx = velocity.x;
    ball.vy = velocity.y;
    ball.inFlight = true;
    ball.scored = false;
    shotAge = 0;
    document.querySelector('#buzzer-power-fill').style.width = '0%';
  });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  document.querySelector('#buzzer-start').addEventListener('click', startGame);
  document.querySelector('#buzzer-play-again').addEventListener('click', startGame);
  window.addEventListener('resize', resizeCanvas);

  window.BuzzerBeater = { reset, start: startGame };
  resizeCanvas();
  reset();
  requestAnimationFrame(frame);
}());
