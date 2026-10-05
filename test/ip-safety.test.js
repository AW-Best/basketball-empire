'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const activeFiles = [
  'public/index.html',
  'public/app.js',
  'public/assets/team-logos.svg',
  'src/game.js',
];
const activeProduct = activeFiles.map((file) => fs.readFileSync(path.join(projectRoot, file), 'utf8')).join('\n');

test('active product copy does not use the retired mode name or real NBA player names', () => {
  assert.doesNotMatch(activeProduct, /Basketnopoly/i);
  assert.doesNotMatch(activeProduct, /Stephen Curry|LeBron James|Nikola Joki[cć]|Giannis Antetokounmpo|Luka Don[cč]i[cć]|Victor Wembanyama|Kevin Durant|Jayson Tatum/i);
});

test('active team roster avoids official NBA team names and locally drawn logos use no external images', () => {
  assert.doesNotMatch(activeProduct, /Capital Kings|capital-kings/i);
  const logos = fs.readFileSync(path.join(projectRoot, 'public/assets/team-logos.svg'), 'utf8');
  assert.doesNotMatch(logos, /<image\b/i);
  assert.doesNotMatch(logos, /(?:href|src)=["']https?:\/\//i);
  assert.match(logos, /<symbol id="capital-crowns"/);
});
