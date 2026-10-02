const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Basketball Empire opens on a game-mode hub with Basketnopoly as a playable mode', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="mode-screen"/);
  assert.match(html, /data-game-mode="basketnopoly"/);
  assert.match(html, /BASKETNOPOLY/);
  assert.match(html, /PLAY NOW/);
  assert.match(html, /id="back-to-modes"/);
  assert.match(css, /\.mode-screen/);
  assert.match(css, /\.mode-card\.is-playable/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.mode-grid/s);
});

test('mode navigation opens Basketnopoly while room invites and saved sessions bypass the hub', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /function showModeSelection/);
  assert.match(script, /function openBasketnopoly/);
  assert.match(script, /\[data-game-mode="basketnopoly"\]/);
  assert.match(script, /invitedRoom && !session[\s\S]{0,180}openBasketnopoly/);
  assert.match(script, /function renderLobby\(\)[\s\S]{0,140}modeScreen\.classList\.add\('is-hidden'\)/);
  assert.match(script, /function leaveCurrentRoom\(\)[\s\S]{0,1300}showModeSelection\(\)/);
});

test('game screen contains the board, four-player scoreboard, court action area, and activity feed', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');

  assert.match(html, /Basketball Empire/);
  assert.match(html, /id="player-rail"/);
  assert.match(html, /id="board"/);
  assert.match(html, /id="court-center"/);
  assert.match(html, /id="activity-feed"/);
  assert.match(html, /aria-label="Roll the dice"/);
});

test('interface defines a complete 40-space board and four full-name players', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /const BOARD_SPACES = \[/);
  assert.match(script, /Aaron Wang/);
  assert.match(script, /Maya Chen/);
  assert.match(script, /Leo Tan/);
  assert.match(script, /王小明/);
  assert.match(script, /BOARD_SPACES\.length !== 40/);
});

test('visual system uses basketball court, broadcast, responsive, and reduced-motion styling', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(css, /--court-orange:/);
  assert.match(css, /\.court-lines/);
  assert.match(css, /\.player-card\.is-active/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test('all 22 teams have unique reusable SVG logo symbols', () => {
  const logos = fs.readFileSync(path.join(projectRoot, 'public/assets/team-logos.svg'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const symbolIds = [...logos.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]);
  const teamLogoReferences = [...script.matchAll(/logo: '([^']+)'/g)].map((match) => match[1]);

  assert.equal(symbolIds.length, 22);
  assert.equal(new Set(symbolIds).size, 22);
  assert.equal(teamLogoReferences.length, 22);
  assert.deepEqual(new Set(teamLogoReferences), new Set(symbolIds));
  assert.match(script, /assets\/team-logos\.svg#/);
});

test('current player can open team card details with buy, sell, and recruit costs', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="team-card-dialog"/);
  assert.match(html, /id="card-buy-cost"/);
  assert.match(html, /id="card-sell-value"/);
  assert.match(html, /id="card-recruit-cost"/);
  assert.match(script, /function openTeamCard/);
  assert.match(script, /IS_LOCAL_PLAYERS_TURN/);
  assert.match(script, /class="team-logo-button"/);
});

test('uses a restrained website background and keeps the game history on the court', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const courtStart = html.indexOf('id="court-center"');
  const feedStart = html.indexOf('id="activity-feed"');
  const courtEnd = html.indexOf('<aside class="coach-panel"', courtStart);

  assert.doesNotMatch(css, /basketball-arena-wallpaper-v2\.png/);
  assert.match(css, /--site-background:/);
  assert.ok(courtStart < feedStart && feedStart < courtEnd);
});

test('uses an elevated full-court arena wallpaper inside the central board box', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(css, /central-court-arena\.png/);
  assert.match(css, /\.court-center\s*\{[^}]*background:/s);
});

test('mobile layout keeps the game touch-friendly without shrinking the board into unreadable cells', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /class="board-scroll-hint"/);
  assert.match(html, /Swipe the court/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.player-rail\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.board-wrap\s*\{[^}]*scroll-snap-type:\s*x proximity/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.board\s*\{[^}]*min-width:\s*820px/s);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.team-card-dialog\s*\{[^}]*margin:\s*auto 0 0/s);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.quick-actions\s*\{[^}]*position:\s*sticky/s);
  assert.doesNotMatch(css, /\.mobile-rotate\s*\{[^}]*display:\s*block/s);
});

test('player interface supports creating, joining, readying, and sharing a live room', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="lobby-screen"/);
  assert.match(html, /id="create-room-form"/);
  assert.match(html, /id="join-room-form"/);
  assert.match(html, /id="player-name"/);
  assert.match(html, /id="room-code"/);
  assert.match(html, /id="ready-button"/);
  assert.match(html, /id="start-button"/);
  assert.match(html, /id="share-room-button"/);
  assert.match(script, /\/api\/rooms/);
  assert.match(script, /new EventSource/);
  assert.match(script, /localStorage/);
});

test('host can choose 3, 5, 10, 15, 20 minutes, or an unlimited match', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="match-duration"/);
  assert.match(html, /value="3"/);
  assert.match(html, /value="5"/);
  assert.match(html, /value="10"/);
  assert.match(html, /value="15"/);
  assert.match(html, /value="20"/);
  assert.match(html, /value="unlimited"/);
  assert.match(script, /durationMinutes/);
  assert.match(script, /matchDurationSeconds == null/);
  assert.match(script, /display\.textContent = '∞'/);
  assert.match(script, /durationSelect\.disabled = !session\?\.isHost/);
});

test('create and join screen includes an in-page player rulebook', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="open-rulebook-button"/);
  assert.match(html, /id="rulebook-dialog"/);
  assert.match(html, /PLAYER RULEBOOK/);
  assert.match(html, /HOST-SELECTED LENGTH/);
  assert.match(html, /5-SECOND AUCTION/);
  assert.match(html, /MOST PTS WINS/);
  assert.match(script, /#open-rulebook-button'[\s\S]{0,160}rulebookDialog\.showModal\(\)/);
  assert.match(script, /#rulebook-close'[\s\S]{0,120}rulebookDialog\.close\(\)/);
  assert.match(css, /\.rulebook-dialog/);
  assert.match(css, /\.rulebook-content/);
});

test('lobby offers a five-step quick start guide with complete rulebook access', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="open-quick-guide-button"/);
  assert.match(html, /id="quick-guide-dialog"/);
  assert.equal((html.match(/class="quick-guide-slide/g) || []).length, 5);
  assert.match(html, /WIN THE CLOCK/);
  assert.match(html, /ROLL &amp; MOVE/);
  assert.match(html, /BUILD YOUR EMPIRE/);
  assert.match(html, /RECRUIT &amp; TRADE/);
  assert.match(html, /PAY OR BID/);
  assert.match(html, /id="quick-guide-rulebook"/);
  assert.match(script, /openQuickGuide/);
  assert.match(script, /renderQuickGuide/);
});

test('quick start guide supports navigation, dismissal persistence, and room shortcuts', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="quick-guide-back"/);
  assert.match(html, /id="quick-guide-next"/);
  assert.match(html, /id="quick-guide-skip"/);
  assert.match(html, /id="quick-guide-dont-show"/);
  assert.match(html, /id="quick-guide-create"/);
  assert.match(html, /id="quick-guide-join"/);
  assert.match(html, /id="game-how-to-play"/);
  assert.match(script, /basketballEmpireQuickGuideDismissed/);
  assert.match(script, /localStorage\.setItem/);
  assert.match(script, /quickGuideIndex/);
  assert.match(css, /\.quick-guide-dialog/);
  assert.match(css, /\.quick-guide-progress/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.quick-guide-dialog/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.quick-guide/s);
});

test('entry forms support photo upload, camera capture, preview, compression, and initials fallback', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /data-avatar-picker="create-room-form"/);
  assert.match(html, /accept="image\/\*"/);
  assert.match(html, /capture="user"/);
  assert.match(html, /UPLOAD PHOTO/);
  assert.match(html, /TAKE PHOTO/);
  assert.match(script, /function resizeAvatar/);
  assert.match(script, /avatarDataUrl/);
  assert.match(script, /function avatarMarkup/);
  assert.match(css, /\.avatar-picker/);
  assert.match(css, /\.avatar img/);
});

test('live game controls cover sign, decline, roll, and end-turn decisions', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="decision-panel"/);
  assert.match(html, /id="sign-team-button"/);
  assert.match(html, /id="decline-team-button"/);
  assert.match(script, /type: 'decision'/);
  assert.match(script, /type: 'end_turn'/);
  assert.match(script, /type: 'roll'/);
  assert.match(script, /currentPlayerIndex/);
});

test('live auction shows the high bid, five-second clock, and three bid increments', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="auction-panel"/);
  assert.match(html, /id="auction-countdown"/);
  assert.match(html, /5-Second Auctions/);
  assert.match(html, />5\.0s</);
  assert.match(html, /data-bid-increment="2"/);
  assert.match(html, /data-bid-increment="50"/);
  assert.match(html, /data-bid-increment="100"/);
  assert.match(script, /function renderAuction/);
  assert.match(script, /type: 'bid'/);
  assert.match(css, /\.auction-panel/);
});

test('player rail labels the host and exposes an in-game host end button', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="end-game-button"/);
  assert.match(script, /room\.hostId/);
  assert.match(script, />HOST</);
  assert.match(script, /type: 'end_game'/);
});

test('every player can leave the saved game and return to create or join', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="leave-game-button"/);
  assert.match(html, />LEAVE GAME \/ NEW GAME</);
  assert.match(script, /function leaveCurrentRoom/);
  assert.match(script, /localStorage\.removeItem\(SESSION_KEY\)/);
  assert.match(script, /searchParams\.delete\('room'\)/);
  assert.match(script, /#entry-panel'[\s\S]{0,100}classList\.remove\('is-hidden'\)/);
  assert.match(script, /#leave-game-button'[\s\S]{0,180}leaveCurrentRoom\(\)/);
});

test('dice use a standard dice presentation without the basketball-shot treatment', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.doesNotMatch(html, /class="dice-hoop"/);
  assert.doesNotMatch(script, /is-shooting/);
  assert.doesNotMatch(css, /@keyframes basketball-shot/);
  assert.match(css, /\.die-face\s*\{[^}]*border-radius:/s);
});

test('team cards show recruited players and the current landing payment', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="card-recruited-players"/);
  assert.match(html, /id="card-landing-payment"/);
  assert.match(script, /asset\.recruits/);
  assert.match(script, /space\.revenue\[developmentLevel\]/);
});

test('unaffordable asset decisions disable and grey the buy button', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /signButton\.disabled = local\.points < space\.price/);
  assert.match(css, /#sign-team-button:disabled/);
});

test('asset prices stay visible in badges outside the block content', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /space-price-badge/);
  assert.match(css, /\.space-price-badge[^}]*position:\s*absolute/s);
});

test('owned team cards expose recruit and mortgage actions', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="recruit-star-button"/);
  assert.match(html, /id="mortgage-team-button"/);
  assert.match(script, /type: 'recruit'/);
  assert.match(script, /type: 'mortgage'/);
  assert.match(script, /selectedTeamId/);
});

test('team-card recruit opens scouting and preselects the clicked team', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /function openRecruitForSelectedTeam/);
  assert.match(script, /openFrontOffice\('recruits'\)/);
  assert.match(script, /select\.value = selectedTeamId/);
  assert.doesNotMatch(script, /#recruit-star-button'[\s\S]{0,180}performAction\(\{ type: 'recruit'/);
});

test('new rolls replay a standard dice tumble animation without basketball effects', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /function animateDice/);
  assert.match(script, /die\.classList\.add\('is-rolling'\)/);
  assert.match(script, /animateDice\(rollEntry\.dice, \(\) => animateMovement\(rollEntry\)\)/);
  assert.match(css, /\.die\.is-rolling\s*\{[^}]*animation:\s*dice-tumble/s);
  assert.match(css, /@keyframes dice-tumble/);
  assert.doesNotMatch(script, /dice-hoop|is-shooting/i);
});

test('dice throw with changing faces, staggered 3D bounces, and settle before movement', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /function animateDice\(finalValues, onSettled\)/);
  assert.match(script, /diceFaceTimer = setInterval/);
  assert.match(script, /renderDie\(die, 1 \+ Math\.floor\(Math\.random\(\) \* 6\)\)/);
  assert.match(script, /renderDie\(dice\[index\], finalValues\[index\]\)/);
  assert.match(script, /animateDice\(rollEntry\.dice, \(\) => animateMovement\(rollEntry\)\)/);
  assert.match(css, /transform-style:\s*preserve-3d/);
  assert.match(css, /@keyframes dice-throw-left/);
  assert.match(css, /@keyframes dice-throw-right/);
  assert.match(css, /@keyframes dice-shadow-pulse/);
});

test('dice use a launch, court-impact, rebound, and final settle sequence', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /tray\.classList\.add\('is-launching'\)/);
  assert.match(script, /tray\.classList\.add\('is-impacting'\)/);
  assert.match(script, /classList\.remove\('is-rolling', 'is-impact', 'is-settling'\)/);
  assert.match(css, /\.dice-tray\.is-impacting::before/);
  assert.match(css, /@keyframes dice-court-impact/);
  assert.match(css, /@keyframes dice-impact-flash/);
  assert.match(css, /cubic-bezier\(\.16,\.84,\.2,1\)/);
});

test('dice are real six-sided CSS 3D cubes instead of flat cards', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /class="die-cube"/);
  assert.match(script, /class="die-face die-face-front"/);
  assert.match(script, /class="die-face die-face-back"/);
  assert.match(script, /class="die-face die-face-right"/);
  assert.match(script, /class="die-face die-face-left"/);
  assert.match(script, /class="die-face die-face-top"/);
  assert.match(script, /class="die-face die-face-bottom"/);
  assert.match(css, /\.die-cube\s*\{[^}]*transform-style:\s*preserve-3d/s);
  assert.match(css, /\.die-face\s*\{[^}]*backface-visibility:\s*hidden/s);
  assert.match(css, /\.die-face-front\s*\{[^}]*translateZ\(var\(--die-depth\)\)/s);
  assert.match(css, /\.die-face-right\s*\{[^}]*rotateY\(90deg\)[^}]*translateZ\(var\(--die-depth\)\)/s);
  assert.match(css, /\.die-face-top\s*\{[^}]*rotateX\(90deg\)[^}]*translateZ\(var\(--die-depth\)\)/s);
  assert.match(css, /@keyframes dice-cube-spin-left/);
  assert.match(css, /@keyframes dice-cube-spin-right/);
});

test('dice trajectory never flattens the cube with competing X or Y rotation', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const leftTrajectory = css.match(/@keyframes dice-throw-left\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  const rightTrajectory = css.match(/@keyframes dice-throw-right\s*\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.doesNotMatch(leftTrajectory, /rotate[XY]\(/);
  assert.doesNotMatch(rightTrajectory, /rotate[XY]\(/);
  assert.doesNotMatch(leftTrajectory, /blur\(/);
  assert.doesNotMatch(rightTrajectory, /blur\(/);
  assert.match(css, /\.dice-tray\s*\{[^}]*perspective-origin:/s);
  const cubeRule = css.match(/\.die-cube\s*\{([^}]*)\}/)?.[1] || '';
  const settlingRule = css.match(/\.die\.is-settling\s*\{([^}]*)\}/)?.[1] || '';
  assert.doesNotMatch(cubeRule, /filter:/);
  assert.doesNotMatch(settlingRule, /filter:/);
  assert.match(css, /\.die-face\s*\{[^}]*box-shadow:/s);
});

test('dice faces overlap into compact rounded edges and the throw stays restrained', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const faceRule = css.match(/\.die-face\s*\{([^}]*)\}/)?.[1] || '';
  const leftTrajectory = css.match(/@keyframes dice-throw-left\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  const rightTrajectory = css.match(/@keyframes dice-throw-right\s*\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(faceRule, /inset:\s*-1px/);
  assert.match(faceRule, /border-radius:\s*clamp\(7px,\.75vw,11px\)/);
  assert.match(faceRule, /inset 0 0 0 2px/);
  assert.doesNotMatch(leftTrajectory, /scale\(1\.[12]/);
  assert.doesNotMatch(rightTrajectory, /scale\(1\.[12]/);
  assert.doesNotMatch(leftTrajectory, /-9[0-9]px/);
  assert.doesNotMatch(rightTrajectory, /-9[0-9]px/);
});

test('dice use a WebGL canvas with rounded solid geometry and retain accessible fallbacks', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /<canvas[^>]+id="dice-webgl"/);
  assert.match(html, /type="module" src="dice-3d\.js\?v=20261002f"/);
  assert.match(dice3d, /RoundedBoxGeometry/);
  assert.match(dice3d, /new THREE\.WebGLRenderer\(\{ alpha: true, antialias: true \}\)/);
  assert.match(dice3d, /function createRoundedDie/);
  assert.match(dice3d, /requestAnimationFrame/);
  assert.match(dice3d, /window\.Dice3D/);
  assert.match(css, /\.dice-webgl/);
  assert.match(css, /\.dice-tray\.is-webgl-ready \.die/);
});

test('game movement waits for the WebGL dice roll to settle', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /window\.Dice3D/);
  assert.match(script, /diceRenderer\.roll\(finalValues\)\.then/);
  assert.match(script, /animateDice\(rollEntry\.dice, \(\) => animateMovement\(rollEntry\)\)/);
});

test('WebGL dice use a compact rigid tabletop roll with staggered settling', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /const settleTimes = \[1040, 1180\]/);
  assert.match(dice3d, /flight \* 0\.34/);
  assert.match(dice3d, /const slide =/);
  assert.match(dice3d, /camera\.position\.set\(0, 5\.1, 10\.8\)/);
  assert.match(dice3d, /new RoundedBoxGeometry\(1\.42, 1\.42, 1\.42, 8, 0\.26\)/);
  assert.doesNotMatch(dice3d, /squash|scale\.set\(1 \/ Math\.sqrt/);
});

test('WebGL pips include a recessed shadow well instead of one flat disc', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /pipWellGeometry/);
  assert.match(dice3d, /pipWellMaterial/);
  assert.match(dice3d, /pipWell\.renderOrder = 1/);
  assert.match(dice3d, /pip\.renderOrder = 2/);
});

test('live updates fall back to polling when server-sent events are unavailable', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /function startPolling/);
  assert.match(script, /setInterval\(refreshRoom, 2000\)/);
  assert.match(script, /eventSource\.onopen/);
  assert.match(script, /eventSource\.onerror/);
});

test('finished matches announce the champion and disable turn actions', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /room\.status === 'finished'/);
  assert.match(script, /CHAMPION/);
});

test('front office contains useful Recruit, Trade, and Teams sections', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="front-office-dialog"/);
  assert.match(html, /data-office-tab="recruits"/);
  assert.match(html, /data-office-tab="trade"/);
  assert.match(html, /data-office-tab="teams"/);
  assert.match(html, /id="front-office-content"/);
  assert.match(script, /Stephen Curry/);
  assert.match(script, /LeBron James/);
  assert.match(script, /function renderFrontOffice/);
});

test('rent payments have an animated courtside callout with payer and recipient', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="payment-callout"/);
  assert.match(script, /entry\.type === 'payment'/);
  assert.match(script, /recipientId/);
  assert.match(script, /function showPaymentCallout/);
  assert.match(css, /@keyframes payment-pop/);
});

test('player pieces animate block by block and land with their own color', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /function animateMovement/);
  assert.match(script, /rollEntry\.path/);
  assert.match(script, /--landing-color/);
  assert.match(css, /\.space\.is-landed/);
  assert.match(css, /@keyframes landing-pulse/);
});

test('all special spaces are clickable and open an explanation card', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(html, /id="space-guide-dialog"/);
  assert.match(html, /id="space-guide-description"/);
  assert.match(script, /class="space-info-button"/);
  assert.match(script, /function openSpaceGuide/);
  assert.match(script, /SPACE_GUIDES/);
});

test('Tip-Off guide explains the exact-landing 300 point bonus', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /300 PTS when you land exactly/);
  assert.match(script, /200 PTS when you pass/);
});

test('deployed browsers receive the current interface assets instead of stale cached files', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');

  assert.match(html, /styles\.css\?v=20261002f/);
  assert.match(html, /app\.js\?v=20261002f/);
});

test('API requests report an understandable connection error when a tunnel returns HTML', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /content-type/);
  assert.match(script, /The public connection returned a webpage instead of game data/);
  assert.match(script, /await response\.text\(\)/);
});

test('opening the HTML file redirects to the live server before API requests run', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const redirectPosition = html.indexOf("window.location.protocol === 'file:'");
  const appPosition = html.indexOf('app.js?v=');

  assert.ok(redirectPosition > -1, 'file protocol redirect is missing');
  assert.ok(redirectPosition < appPosition, 'redirect must run before the application script');
  assert.match(html, /https:\/\/macpro\.tail86c614\.ts\.net\//);
  assert.match(html, /window\.location\.search/);
});

test('an invite link replaces a stale saved-room session', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(script, /invitedRoom\.toUpperCase\(\) !== session\.roomCode/);
  assert.match(script, /localStorage\.removeItem\(SESSION_KEY\)/);
  assert.match(script, /session = null/);
});

test('match clock counts down from the synchronized server start time', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /function updateShotClock/);
  assert.match(script, /room\.matchStartedAt/);
  assert.match(script, /room\?\.matchDurationSeconds/);
  assert.match(script, /setInterval\(updateShotClock, 250\)/);
  assert.match(css, /\.shot-clock\.is-urgent/);
});

test('interface reveals shared event cards with a broadcast animation', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.match(html, /id="card-draw-overlay"/);
  assert.match(script, /function showCardDraw/);
  assert.match(script, /entry\.type === 'card'/);
  assert.match(css, /@keyframes card-reveal/);
});

test('dice render accessible pips without a printed number', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(script, /function renderDie/);
  assert.match(script, /die-pips/);
  assert.doesNotMatch(script, /die-number/);
});

test('routes and labs expose price and revenue details', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(html, /id="space-guide-costs"/);
  assert.match(script, /25 \/ 50 \/ 100 \/ 200/);
  assert.match(script, /dice total ×4/);
});

test('front office offers eight named prospects with recruit actions', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(script, /Kevin Durant/);
  assert.match(script, /Jayson Tatum/);
  assert.match(script, /data-recruit-player/);
  assert.match(script, /playerName/);
});

test('interface shows a ten-minute match clock and asset owner names', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(html, /id="timer">10:00/);
  assert.match(script, /matchDurationSeconds/);
  assert.match(script, /owner\.name/);
  assert.match(script, /ELIMINATED/);
});

test('court history is an unboxed stream of downward fading lines', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const courtStart = html.indexOf('id="court-center"');
  const diceStart = html.indexOf('id="die-one"');
  const feedStart = html.indexOf('id="activity-feed"');
  assert.ok(courtStart < diceStart && diceStart < feedStart);
  assert.match(html, /court-history/);
  assert.doesNotMatch(script, /room\.log\.slice\(-5\)/);
  assert.doesNotMatch(css, /\.court-history[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.court-history[^}]*background:\s*transparent/s);
  assert.match(css, /\.activity-feed li:nth-last-child/);
  assert.match(css, /@keyframes history-line-drop/);
});

test('only the newest history event is bold while older events are grey', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /index === 0 \? 'is-new' : 'is-old'/);
  assert.match(script, /entry\.type === 'points_awarded'/);
  assert.match(css, /\.activity-feed li\.is-new[^}]*font-weight:\s*900/s);
  assert.match(css, /\.activity-feed li\.is-old[^}]*color:\s*var\(--muted\)/s);
});

test('purchased spaces flash in the buyer color', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.match(script, /function showPurchaseHighlight/);
  assert.match(script, /entry\.type === 'signed'/);
  assert.match(script, /--purchase-color/);
  assert.match(css, /\.space\.is-purchased/);
});

test('trade access and current-player banner are clear', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.ok(html.indexOf('class="turn-banner"') < html.indexOf('class="dice-tray"'));
  assert.match(script, /Swap PTS, teams, routes, or labs/);
});

test('balance changes animate green gains and red losses beside each player', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.match(html, /id="balance-change-layer"/);
  assert.match(script, /showBalanceChanges/);
  assert.match(script, /'is-gain'/);
  assert.match(script, /'is-loss'/);
  assert.match(css, /\.balance-change\.is-gain/);
  assert.match(css, /\.balance-change\.is-loss/);
});

test('trade desk creates real point and asset offers after selecting a rival', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(html, /id="trade-dialog"/);
  assert.match(script, /CREATE TRADE/);
  assert.match(script, /trade_create/);
  assert.match(script, /trade_respond/);
  assert.match(script, /offeredPoints/);
  assert.match(script, /requestedAssetIds/);
});

test('trade recipients receive a synchronized actionable offer alert', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="trade-offer-alert"/);
  assert.match(html, /id="trade-alert-open"/);
  assert.match(script, /function showIncomingTradeAlert/);
  assert.match(script, /offer\.recipientId === session\?\.playerId/);
  assert.match(script, /lastTradeNoticeKey/);
  assert.match(script, /openFrontOffice\('trade'\)/);
  assert.match(css, /\.trade-offer-alert\.is-visible/);
  assert.match(css, /@keyframes trade-alert-enter/);
});

test('franchise controls say My Teams and expose bankruptcy when insolvent', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(html, /> My Teams</);
  assert.match(html, /id="bankrupt-button"/);
  assert.match(script, /type: 'bankrupt'/);
  assert.match(script, /local\.points === 0/);
});

test('brand mark uses an accessible basketball svg with curved seams', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  assert.match(html, /class="brand-ball"/);
  assert.match(html, /<circle/);
  assert.match(html, /<path/);
});

test('doubles clearly tell the current player to roll again', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(script, /extraRollPending/);
  assert.match(script, /ROLL AGAIN/);
  assert.match(script, /entry\.type === 'extra_roll'/);
});

test('dice mimic tactile white 3D dice and contain pips only', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.doesNotMatch(script, /die-number/);
  assert.match(css, /\.die-face[^}]*background:\s*radial-gradient/s);
  assert.match(css, /\.die-face-right[^}]*background:\s*linear-gradient/s);
  assert.match(css, /\.die-face-top[^}]*background:\s*linear-gradient/s);
  assert.match(css, /\.pip[^}]*background:\s*#111/s);
});

test('bankruptcy remains visible but disabled until the player is insolvent', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  assert.match(html, /class="bankrupt-button" id="bankrupt-button"/);
  assert.match(script, /bankruptButton\.disabled = !canDeclareBankruptcy/);
  assert.match(script, /Mortgage available assets first/);
});

test('auction uses a full overlay with bid progress and an asset card', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.match(html, /id="auction-progress"/);
  assert.match(html, /id="auction-asset-card"/);
  assert.match(html, /id="auction-bid-history"/);
  assert.match(html, /class="auction-next-bid"/);
  assert.match(script, /auctionProgress/);
  assert.match(script, /auction-asset-revenue/);
  assert.match(script, /auction_bid/);
  assert.match(css, /\.auction-panel[^}]*position:\s*fixed/s);
  assert.match(css, /\.auction-layout[^}]*grid-template-columns/s);
});

test('auction modal lives outside the game stacking context so history cannot overlap it', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const gameEnd = html.indexOf('</main>');
  const auctionStart = html.indexOf('id="auction-panel"');

  assert.ok(gameEnd > 0 && auctionStart > gameEnd, 'auction overlay must be mounted after the game stage');
  assert.match(css, /\.auction-panel\s*\{[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.auction-panel\s*\{[^}]*z-index:\s*1000/s);
});

test('event card reveals include a local close button', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  assert.match(html, /id="card-draw-close"/);
  assert.match(html, /aria-label="Close event card"/);
  assert.match(script, /function closeCardDraw/);
  assert.match(script, /#card-draw-close/);
  assert.match(css, /\.drawn-card-close/);
});
