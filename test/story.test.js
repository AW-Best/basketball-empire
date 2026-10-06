const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('school story page is a text-only Year 8 presentation about building the game', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'public/my-game-story.html'), 'utf8');
  const css = fs.readFileSync(path.join(projectRoot, 'public/story.css'), 'utf8');

  assert.match(html, /How I Made Basketball Empire/);
  assert.match(html, /I am 14 and I am in Year 8/);
  assert.match(html, /Codex/);
  assert.match(html, /domain/);
  assert.match(html, /daily visits/);
  assert.match(html, /id="story-progress"/);
  assert.match(html, /data-story-section/);
  assert.match(html, /ArrowDown|ArrowRight/);
  assert.doesNotMatch(html, /<(?:img|picture|svg)\b/i);
  assert.match(css, /@media print/);
  assert.match(css, /scroll-snap-type:\s*y mandatory/);
});
