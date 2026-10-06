const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('school story page is a visual Year 8 presentation about building the game', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/my-game-story.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/story.css'), 'utf8');

  assert.match(html, /How I Made Basketball Empire/);
  assert.match(html, /MADE BY A YEAR 8 STUDENT/);
  assert.match(html, /HI, I'M<br><mark>AARON/);
  assert.match(html, /I LOVE PLAYING<br>BASKETBALL/);
  assert.match(html, /I LOVE PLAYING<br>MONOPOLY/);
  assert.match(html, /I'M LEARNING<br>AI/);
  assert.match(html, /COULD I USE AI TO BUILD MY OWN GAME\?/);
  assert.match(html, /Codex/);
  assert.match(html, /domain/);
  assert.match(html, /DAILY VIEWS/);
  assert.match(html, /class="sticker/);
  assert.match(html, /class="domain-receipt/);
  assert.match(html, /class="analytics-card/);
  assert.match(html, /SCAN\. PLAY\. TELL ME WHAT BROKE\./);
  assert.match(html, /id="story-progress"/);
  assert.match(html, /data-story-section/);
  assert.match(html, /ArrowDown|ArrowRight/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.ok((html.match(/<p[\s>]/g) || []).length <= 18, 'slides should use short speaking prompts instead of paragraphs');
  assert.match(css, /@media print/);
  assert.match(css, /scroll-snap-type:\s*y mandatory/);
  assert.match(css, /\.sticker/);
  assert.match(css, /@keyframes stickerPop/);
});
