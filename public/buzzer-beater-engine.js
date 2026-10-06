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
      maxLevel: 1,
    };
  }

  function registerShot(state, shot) {
    if (state.status !== 'playing') return state;
    const nextStreak = shot.made ? state.streak + 1 : 0;
    const pointsByKind = { normal: 1, bank: 2, swish: 3 };
    const basePoints = pointsByKind[shot.kind] || 1;
    return {
      ...state,
      score: state.score + (shot.made ? basePoints : 0),
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

  function calculateTapVelocity(side) {
    return { x: side === 'left' ? -269 : 269, y: -1080 };
  }

  function classifyBasket(contact) {
    if (contact.hitBackboard) return 'bank';
    if (!contact.hitRim) return 'swish';
    return 'normal';
  }

  function oppositeSide(side) {
    return side === 'left' ? 'right' : 'left';
  }

  return { createGameState, registerShot, tickClock, crossedHoop, calculateTapVelocity, classifyBasket, oppositeSide, isLevelComplete, advanceLevel };
}));
