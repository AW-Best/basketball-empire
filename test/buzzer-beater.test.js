'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createGameState,
  registerShot,
  tickClock,
  crossedHoop,
  calculateTapVelocity,
  classifyBasket,
  oppositeSide,
  isLevelComplete,
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
    level: 1,
    levelMakes: 0,
    levelTarget: 4,
    maxLevel: 1,
  });
});

test('level one is cleared after four made shots', () => {
  let state = { ...createGameState(), status: 'playing' };
  for (let shot = 0; shot < 4; shot += 1) state = registerShot(state, { made: true, isThreePointer: false });
  assert.equal(state.levelMakes, 4);
  assert.equal(isLevelComplete(state), true);
});

test('scores one for normal, two for bank, and three for swish', () => {
  let state = { ...createGameState(), status: 'playing' };
  state = registerShot(state, { made: true, kind: 'normal' });
  assert.equal(state.score, 1);
  state = registerShot(state, { made: true, kind: 'bank' });
  assert.equal(state.score, 3);
  state = registerShot(state, { made: true, kind: 'swish' });
  assert.equal(state.score, 6);
  assert.equal(state.shots, 3);
  assert.equal(state.makes, 3);
});

test('streak is visual feedback only and a miss resets it', () => {
  let state = { ...createGameState(), status: 'playing' };
  for (let shot = 0; shot < 5; shot += 1) state = registerShot(state, { made: true, kind: 'normal' });
  assert.equal(state.score, 5);
  assert.equal(state.streak, 5);
  assert.equal(state.bestStreak, 5);
  state = registerShot(state, { made: false, kind: 'normal' });
  assert.equal(state.streak, 0);
  assert.equal(state.shots, 6);
});

test('clock reaches finished exactly once and finished games reject new scores', () => {
  const finished = tickClock({ ...createGameState(), status: 'playing', timeLeft: 0.2 }, 0.2);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.timeLeft, 0);
  assert.deepEqual(registerShot(finished, { made: true, kind: 'swish' }), finished);
});

test('a basket only counts when the ball crosses the hoop plane downward from above', () => {
  const hoop = { left: 500, right: 570, y: 220 };
  assert.equal(crossedHoop({ x: 535, y: 210 }, { x: 535, y: 230 }, hoop), true);
  assert.equal(crossedHoop({ x: 535, y: 230 }, { x: 535, y: 210 }, hoop), false);
  assert.equal(crossedHoop({ x: 480, y: 210 }, { x: 480, y: 230 }, hoop), false);
});

test('one tap launches with fixed mirrored velocity toward the active side', () => {
  assert.deepEqual(calculateTapVelocity('right'), { x: 269, y: -1080 });
  assert.deepEqual(calculateTapVelocity('left'), { x: -269, y: -1080 });
});

test('basket contact classifies normal, bank, and swish scores', () => {
  assert.equal(classifyBasket({ hitBackboard: false, hitRim: true }), 'normal');
  assert.equal(classifyBasket({ hitBackboard: true, hitRim: false }), 'bank');
  assert.equal(classifyBasket({ hitBackboard: false, hitRim: false }), 'swish');
});

test('a made basket sends the next hoop to the opposite side', () => {
  assert.equal(oppositeSide('left'), 'right');
  assert.equal(oppositeSide('right'), 'left');
});
