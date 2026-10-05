(function exposeBuzzerBeaterEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BuzzerBeaterEngine = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  function createGameState() {
    return {
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
      maxLevel: 2,
    };
  }

  function registerShot(state, shot) {
    if (state.status !== 'playing') return state;
    const nextStreak = shot.made ? state.streak + 1 : 0;
    const streakMultiplier = nextStreak >= 5 ? 2 : 1;
    const clutchMultiplier = state.timeLeft <= 10 ? 2 : 1;
    const basePoints = shot.isThreePointer ? 3 : 2;
    return {
      ...state,
      score: state.score + (shot.made ? basePoints * streakMultiplier * clutchMultiplier : 0),
      shots: state.shots + 1,
      makes: state.makes + (shot.made ? 1 : 0),
      levelMakes: state.levelMakes + (shot.made ? 1 : 0),
      streak: nextStreak,
      bestStreak: Math.max(state.bestStreak, nextStreak),
    };
  }

  function isLevelComplete(state) {
    return state.levelMakes >= state.levelTarget;
  }

  function advanceLevel(state) {
    if (!isLevelComplete(state) || state.level >= state.maxLevel) return state;
    return {
      ...state,
      level: state.level + 1,
      levelMakes: 0,
      timeLeft: state.duration,
      streak: 0,
      status: 'playing',
    };
  }

  function tickClock(state, elapsedSeconds) {
    if (state.status !== 'playing') return state;
    const timeLeft = Math.max(0, state.timeLeft - Math.max(0, elapsedSeconds));
    return { ...state, timeLeft, status: timeLeft === 0 ? 'finished' : 'playing' };
  }

  function crossedHoop(previous, current, hoop) {
    const movingDown = current.y > previous.y;
    const crossedPlane = previous.y <= hoop.y && current.y >= hoop.y;
    const xAtCrossing = previous.x + ((current.x - previous.x) * ((hoop.y - previous.y) / Math.max(0.0001, current.y - previous.y)));
    return movingDown && crossedPlane && xAtCrossing >= hoop.left && xAtCrossing <= hoop.right;
  }

  function calculateLaunchVelocity(ball, pointer) {
    const scale = 7.4;
    let x = (ball.x - pointer.x) * scale;
    let y = (ball.y - pointer.y) * scale;
    const speed = Math.hypot(x, y);
    if (speed > 1100) {
      x *= 1100 / speed;
      y *= 1100 / speed;
    }
    return { x, y };
  }

  return { createGameState, registerShot, tickClock, crossedHoop, calculateLaunchVelocity, isLevelComplete, advanceLevel };
}));
