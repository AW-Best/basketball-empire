const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Basketball Empire opens on a game-mode hub with Dynasty Circuit as a playable mode', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="mode-screen"/);
  assert.match(html, /data-game-mode="dynasty-circuit"/);
  assert.match(html, /DYNASTY CIRCUIT/);
  assert.doesNotMatch(html, /Basketnopoly/i);
  assert.match(html, /PLAY NOW/);
  assert.match(html, /id="back-to-modes"/);
  assert.match(css, /\.mode-screen/);
  assert.match(css, /\.mode-card\.is-playable/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.mode-grid/s);
});

test('mode navigation opens Dynasty Circuit while room invites and saved sessions bypass the hub', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.match(script, /function showModeSelection/);
  assert.match(script, /function openDynastyCircuit/);
  assert.match(script, /\[data-game-mode="dynasty-circuit"\]/);
  assert.match(script, /invitedRoom && !session[\s\S]{0,180}openDynastyCircuit/);
  assert.doesNotMatch(script, /Basketnopoly/i);
  assert.match(script, /function renderLobby\(\)[\s\S]{0,140}modeScreen\.classList\.add\('is-hidden'\)/);
  assert.match(script, /function leaveCurrentRoom\(\)[\s\S]{0,1300}showModeSelection\(\)/);
});

test('Buzzer Beater is a playable mode with a complete solo challenge screen', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /data-game-mode="buzzer-beater"/);
  assert.match(html, /id="buzzer-beater-screen"/);
  assert.match(html, /id="buzzer-court"/);
  assert.match(html, /id="buzzer-start"/);
  assert.match(html, /id="buzzer-score"/);
  assert.match(html, /id="buzzer-clock"/);
  assert.match(html, /id="buzzer-result"/);
  assert.match(html, /buzzer-beater-engine\.js\?v=/);
  assert.match(html, /buzzer-beater\.js\?v=/);
  assert.match(css, /\.buzzer-screen/);
  assert.match(css, /\.buzzer-court/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.buzzer-arena/s);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.buzzer-ball-mark\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.buzzer-start-overlay button[^}]*padding:\s*10px/s);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.buzzer-court\s*\{[^}]*min-height:\s*0/s);
});

test('Buzzer Beater stays a simple swipe-to-shoot game with a focused arena presentation', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/buzzer-beater.js'), 'utf8');
  const buzzerSection = html.match(/<section class="buzzer-screen[\s\S]*?<\/section>\s*<main class="game-stage/)[0];

  assert.match(buzzerSection, /SIMPLE SHOOTING CHALLENGE/);
  assert.match(buzzerSection, /SWIPE TO SHOOT/);
  assert.doesNotMatch(buzzerSection, /choose (?:a )?player|customi[sz]e|pass to|dunk button/i);
  assert.match(script, /function drawPerspectiveCourt\(/);
  assert.match(script, /function drawArenaLights\(/);
  assert.match(script, /function drawShotTarget\(/);
});

test('Buzzer Beater renders a front-facing hoop and preserves a round basketball', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/buzzer-beater.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /function drawFrontFacingHoop\(/);
  assert.match(script, /context\.ellipse\(HOOP_CENTER_X, HOOP\.y, HOOP_HALF_WIDTH, HOOP_RIM_DEPTH/);
  assert.match(script, /context\.arc\(0, 0, BALL_RADIUS, 0, Math\.PI \* 2\)/);
  assert.match(css, /\.buzzer-court\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10[^}]*height:\s*auto/s);
});

test('Buzzer Beater shoots upward from the bottom toward a centered top hoop', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/buzzer-beater.js'), 'utf8');

  assert.match(script, /const HOOP_CENTER_X = WORLD\.width \/ 2/);
  assert.match(script, /const HOOP = \{ left: 454, right: 546, y: 176/);
  assert.match(script, /const positions = \[\{ x: 350, y: 525[\s\S]*\{ x: 500, y: 525[\s\S]*\{ x: 650, y: 525/);
  assert.doesNotMatch(script, /velocity\.x <= 0/);
  assert.match(script, /velocity\.y >= -40/);
});

test('Buzzer Beater mode navigation opens the challenge and can return to the arcade', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const buzzerScript = fs.readFileSync(path.join(projectRoot, 'public/buzzer-beater.js'), 'utf8');

  assert.match(script, /function openBuzzerBeater/);
  assert.match(script, /\[data-game-mode="buzzer-beater"\]/);
  assert.match(script, /#buzzer-back-to-modes/);
  assert.match(script, /window\.BuzzerBeater\?\.reset/);
  assert.match(buzzerScript, /function reset\(\)[\s\S]{0,400}requestAnimationFrame\(resizeCanvas\)/);
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

test('entry forms use player-name initials without avatar upload controls', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.doesNotMatch(html, /Player avatar/);
  assert.doesNotMatch(html, /data-avatar-picker/);
  assert.doesNotMatch(html, /accept="image\/\*"/);
  assert.doesNotMatch(script, /selectedAvatars/);
  assert.doesNotMatch(script, /function resizeAvatar/);
  assert.match(script, /body:\s*\{\s*name:\s*event\.currentTarget\.elements\.name\.value\s*\}/);
  assert.match(script, /function avatarMarkup/);
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
  assert.match(html, /type="module" src="dice-3d\.js\?v=20261002v"/);
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

test('WebGL dice scale down responsively on phones and tablets', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(dice3d, /function responsiveDiceScale\(\)/);
  assert.match(dice3d, /window\.innerWidth <= 720\) return 0\.287/);
  assert.match(dice3d, /window\.innerWidth <= 1024\) return 0\.35/);
  assert.match(dice3d, /return 0\.42/);
  assert.match(dice3d, /die\.scale\.setScalar\(responsiveDiceScale\(\)\)/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.dice-tray\s*\{[^}]*min-width:\s*200px/s);
});

test('WebGL dice use rigid-body gravity, floor restitution, and rolling friction', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /const GRAVITY = -5\.8/);
  assert.match(dice3d, /function createRigidBody/);
  assert.match(dice3d, /function integrateRigidBody\(body, delta, floorY\)/);
  assert.match(dice3d, /body\.velocity\.y \+= GRAVITY \* delta/);
  assert.match(dice3d, /body\.velocity\.y \*= -0\.34/);
  assert.match(dice3d, /body\.velocity\.x \*= Math\.pow\(0\.18, delta\)/);
  assert.match(dice3d, /function restingY\(\)/);
});

test('the two dice collide and settle onto their authoritative results', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function resolveDiceCollision\(bodies\)/);
  assert.match(dice3d, /const minimumDistance = firstRadius \+ secondRadius/);
  assert.match(dice3d, /resolveDiceCollision\(bodies\)/);
  assert.match(dice3d, /const settleBlend = smootherStep/);
  assert.match(dice3d, /slerp\(targets\[index\], orientationBlend\)/);
});

test('rigid dice use height-reactive contact shadows', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function createContactShadow\(\)/);
  assert.match(dice3d, /function updateContactShadow\(die, height\)/);
  assert.match(dice3d, /shadow\.material\.opacity =/);
  assert.match(dice3d, /shadow\.scale\.setScalar/);
  assert.match(dice3d, /updateContactShadow\(die, die\.position\.y\)/);
});

test('rigid dice vary launch and spin deterministically for each result', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function seededVariation\(seed\)/);
  assert.match(dice3d, /finalValues\[0\] \* 17 \+ finalValues\[1\] \* 31/);
  assert.match(dice3d, /createRigidBody\(index, die\.quaternion, variation\)/);
  assert.match(dice3d, /angularVelocity\.multiplyScalar\(1 \+ \(variation \* 0\.12\)\)/);
});

test('WebGL dice use calmer spin and wider separation', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(dice3d, /const DICE_REST_X = 1\.45/);
  assert.match(dice3d, /const DICE_LAUNCH_X = 1\.65/);
  assert.match(dice3d, /const SPIN_STRENGTH = 0\.56/);
  assert.match(dice3d, /const COLLISION_SPIN = 0\.8/);
  assert.match(dice3d, /angularVelocity: new THREE\.Vector3\([\s\S]*?\)\.multiplyScalar\(SPIN_STRENGTH\)/);
  assert.match(dice3d, /index \? DICE_REST_X : -DICE_REST_X/);
  assert.match(dice3d, /index \? DICE_LAUNCH_X : -DICE_LAUNCH_X/);
  assert.match(dice3d, /impulse \* COLLISION_SPIN/);
  assert.match(css, /\.dice-tray\s*\{[^}]*min-width:\s*clamp\(230px, 24vw, 320px\)[^}]*gap:\s*62px/s);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.dice-tray\s*\{[^}]*min-width:\s*200px[^}]*gap:\s*52px/s);
});

test('CSS fallback left die uses one controlled Richup-style tumble', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');
  const leftSpin = css.match(/@keyframes dice-cube-spin-left\s*\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(leftSpin, /30%\s*\{ transform: rotateX\(118deg\) rotateY\(112deg\) rotateZ\(42deg\); \}/);
  assert.match(leftSpin, /100%\s*\{ transform: rotateX\(270deg\) rotateY\(288deg\) rotateZ\(108deg\); \}/);
  assert.doesNotMatch(leftSpin, /rotate[XYZ]\([+-]?(?:[4-9]\d\d|\d{4,})deg\)/);
});

test('rigid dice land on faces, edges, and corners using oriented cube support', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function cubeSupportHeight\(quaternion\)/);
  assert.match(dice3d, /Math\.abs\(axis\.y\)/);
  assert.match(dice3d, /const contactY = FLOOR_Y \+ cubeSupportHeight\(body\.quaternion\)/);
  assert.match(dice3d, /body\.position\.y <= contactY/);
});

test('dice collision uses each rotated cube footprint instead of a fixed sphere', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function orientedSupportRadius\(quaternion, direction\)/);
  assert.match(dice3d, /orientedSupportRadius\(bodies\[0\]\.quaternion, normal\)/);
  assert.match(dice3d, /orientedSupportRadius\(bodies\[1\]\.quaternion, normal\)/);
  assert.doesNotMatch(dice3d, /const bodyRadius = 0\.61 \* responsiveDiceScale\(\)/);
});

test('authoritative face correction starts late and settles at a stable frame rate', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /function smootherStep\(value, start, end\)/);
  assert.match(dice3d, /const orientationBlend = smootherStep\(dieProgress, 0\.58, 1\)/);
  assert.match(dice3d, /die\.quaternion\.copy\(bodies\[index\]\.quaternion\)\.slerp\(targets\[index\], orientationBlend\)/);
  assert.doesNotMatch(dice3d, /correctionRate/);
});

test('WebGL dice initialize and refresh from the real room result instead of hard-coded ones', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');

  assert.doesNotMatch(dice3d, /setValues\(\[1, 1\]\)/);
  assert.match(dice3d, /const initialValues = fallbackDice\.map/);
  assert.match(script, /element\.dataset\.value = String\(value\)/);
  assert.match(script, /window\.Dice3D\?\.setValues\(dice\)/);
});

test('compact WebGL dice use larger high-contrast pip discs', () => {
  const dice3d = fs.readFileSync(path.join(projectRoot, 'public/dice-3d.js'), 'utf8');

  assert.match(dice3d, /new THREE\.CircleGeometry\(0\.108, 28\)/);
  assert.match(dice3d, /color: 0x030303/);
  assert.match(dice3d, /opacity: 0\.9/);
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
  assert.match(script, /Jalen Mercer/);
  assert.match(script, /Marcus Vale/);
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

test('token movement follows the recorded Richup-style hop, trail, and corner rhythm', () => {
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(script, /const TOKEN_MOTION_PROFILE = Object\.freeze/);
  assert.match(script, /stepDuration:\s*260/);
  assert.match(script, /cornerPause:\s*90/);
  assert.match(script, /landingHold:\s*360/);
  assert.match(script, /CORNER_SPACE_INDEXES\.has\(position\)/);
  assert.match(script, /piece\.classList\.add\(isFinalStep \? 'is-landing' : 'is-stepping'\)/);
  assert.match(script, /cell\?\.classList\.add\('is-movement-trail'\)/);
  assert.match(css, /\.piece\.is-stepping[^{]*\{[^}]*animation:\s*piece-step-hop/s);
  assert.match(css, /\.piece\.is-landing[^{]*\{[^}]*animation:\s*piece-final-landing/s);
  assert.match(css, /\.space\.is-movement-trail::before/);
  assert.match(css, /@keyframes piece-step-hop/);
  assert.match(css, /@keyframes piece-final-landing/);
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

  assert.match(html, /styles\.css\?v=20261005c/);
  assert.match(html, /app\.js\?v=20261005c/);
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
  assert.match(script, /Devon Cross/);
  assert.match(script, /Zane Holloway/);
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

test('site footer states that the basketball universe is independent and fictional', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /class="site-legal"/);
  assert.match(html, /© 2026 Basketball Empire/);
  assert.match(html, /independent fictional basketball game/i);
  assert.match(html, /not affiliated with, endorsed by, or licensed by the NBA, NBPA, or any NBA team/i);
  assert.match(html, /in-game teams, players, events, and results are fictional/i);
  assert.match(css, /\.site-legal\s*\{/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.site-legal/);
});

test('site loads the owner AdSense account and links a complete privacy notice', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'public/privacy.html'), 'utf8');

  assert.match(html, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-6603520082677971/);
  assert.match(html, /crossorigin="anonymous"/);
  assert.match(html, /href="privacy\.html"[^>]*>Privacy</);
  assert.match(privacy, /Privacy Policy/);
  assert.match(privacy, /Google AdSense/);
  assert.match(privacy, /cookies/i);
  assert.match(privacy, /localStorage/);
  assert.match(privacy, /Buzzer Beater high score/i);
  assert.match(privacy, /uploaded avatar/i);
});

test('homepage exposes the AdSense account meta verification tag', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  assert.match(html, /<meta name="google-adsense-account" content="ca-pub-6603520082677971"\s*\/>/);
});

test('homepage shows a resilient public arena attendance counter', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/index.html'), 'utf8');
  const script = fs.readFileSync(path.join(projectRoot, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/styles.css'), 'utf8');

  assert.match(html, /id="visitor-count"[^>]*>—</);
  assert.match(html, /ARENA VISITS/);
  assert.match(script, /fetch\(['"]\/api\/visits['"],\s*\{\s*method:\s*['"]POST['"]/s);
  assert.match(script, /visitor-count/);
  assert.match(css, /\.visitor-scoreboard/);
});

test('privacy notice explains the daily visitor counter cookie and Cloudflare analytics', () => {
  const privacy = fs.readFileSync(path.join(projectRoot, 'public/privacy.html'), 'utf8');
  assert.match(privacy, /be_visitor_day/);
  assert.match(privacy, /Cloudflare Web Analytics/);
  assert.match(privacy, /once per UTC day/i);
});
