const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');

test('Render blueprint deploys the Node server with a health check', () => {
  const blueprintPath = path.join(projectRoot, 'render.yaml');
  assert.equal(fs.existsSync(blueprintPath), true, 'render.yaml must exist');
  const blueprint = fs.readFileSync(blueprintPath, 'utf8');

  assert.match(blueprint, /type:\s*web/);
  assert.match(blueprint, /runtime:\s*node/);
  assert.match(blueprint, /plan:\s*free/);
  assert.match(blueprint, /startCommand:\s*npm start/);
  assert.match(blueprint, /healthCheckPath:\s*\/api\/health/);
});
