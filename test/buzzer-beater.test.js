'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createGameState,
  registerShot,
  tickClock,
  crossedHoop,
  calculateLaunchVelocity,
} = require('../public/buzzer-beater-engine.js');

test('creates a ready 60-second solo challenge', () => {
  assert.deepEqual(createGameState(), {
    status: 'ready',
    duration: 60,
    timeLeft: 60,
    score: 0,
    shots: 0,
    makes: 0,
    streak: 0,
    bestStreak: 0,
  });
});

test('scores two or three points and doubles makes in the final ten seconds', () => {
  let state = { ...createGameState(), status: 'playing' };
  state = registerShot(state, { made: true, isThreePointer: false });
  assert.equal(state.score, 2);
  state = registerShot({ ...state, timeLeft: 10 }, { made: true, isThreePointer: true });
  assert.equal(state.score, 8);
  assert.equal(state.shots, 2);
  assert.equal(state.makes, 2);
});

test('five straight makes earn a two-times streak multiplier and a miss resets it', () => {
  let state = { ...createGameState(), status: 'playing' };
  for (let shot = 0; shot < 5; shot += 1) state = registerShot(state, { made: true, isThreePointer: false });
  assert.equal(state.score, 12);
  assert.equal(state.streak, 5);
  assert.equal(state.bestStreak, 5);
  state = registerShot(state, { made: false, isThreePointer: false });
  assert.equal(state.streak, 0);
  assert.equal(state.shots, 6);
});

test('clock reaches finished exactly once and finished games reject new scores', () => {
  const finished = tickClock({ ...createGameState(), status: 'playing', timeLeft: 0.2 }, 0.2);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.timeLeft, 0);
  assert.deepEqual(registerShot(finished, { made: true, isThreePointer: true }), finished);
});

test('a basket only counts when the ball crosses the hoop plane downward from above', () => {
  const hoop = { left: 500, right: 570, y: 220 };
  assert.equal(crossedHoop({ x: 535, y: 210 }, { x: 535, y: 230 }, hoop), true);
  assert.equal(crossedHoop({ x: 535, y: 230 }, { x: 535, y: 210 }, hoop), false);
  assert.equal(crossedHoop({ x: 480, y: 210 }, { x: 480, y: 230 }, hoop), false);
});

test('dragging opposite the hoop creates a capped launch vector toward the hoop', () => {
  const velocity = calculateLaunchVelocity({ x: 180, y: 500 }, { x: 100, y: 580 });
  assert.ok(velocity.x > 0);
  assert.ok(velocity.y < 0);
  assert.ok(Math.hypot(velocity.x, velocity.y) <= 1100);
});
