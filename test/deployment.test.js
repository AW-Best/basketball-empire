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

test('Cloudflare configuration binds static assets and a SQLite Durable Object', () => {
  const configPath = path.join(projectRoot, 'wrangler.jsonc');
  assert.equal(fs.existsSync(configPath), true, 'wrangler.jsonc must exist');
  const config = fs.readFileSync(configPath, 'utf8');

  assert.match(config, /"name"\s*:\s*"play"/);
  assert.match(config, /"main"\s*:\s*"cloudflare\/worker\.mjs"/);
  assert.match(config, /"directory"\s*:\s*"\.\/public"/);
  assert.match(config, /"run_worker_first"\s*:\s*\[\s*"\/api\/\*"\s*\]/);
  assert.match(config, /"name"\s*:\s*"ROOMS"/);
  assert.match(config, /"class_name"\s*:\s*"BasketballRoom"/);
  assert.match(config, /"storage"\s*:\s*"sqlite"/);
});

test('package scripts support local Cloudflare verification and deployment', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

  assert.equal(packageJson.scripts['dev:cloudflare'], 'wrangler dev');
  assert.equal(packageJson.scripts['deploy:cloudflare'], 'wrangler deploy');
  assert.match(packageJson.devDependencies.wrangler, /^\^4\./);
});
