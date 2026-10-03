const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');

test('ads.txt authorizes the Basketball Empire Google AdSense publisher', () => {
  const ads = fs.readFileSync(path.join(projectRoot, 'public/ads.txt'), 'utf8');
  assert.equal(ads.trim(), 'google.com, pub-6603520082677971, DIRECT, f08c47fec0942fa0');
});

test('robots.txt explicitly allows Google AdSense verification crawlers', () => {
  const robots = fs.readFileSync(path.join(projectRoot, 'public/robots.txt'), 'utf8');
  assert.match(robots, /User-agent: Googlebot\s+Allow: \//);
  assert.match(robots, /User-agent: Mediapartners-Google\s+Allow: \//);
  assert.match(robots, /User-agent: Google-Display-Ads-Bot\s+Allow: \//);
});

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

test('Cloudflare configuration binds hoopire.com as the production custom domain', () => {
  const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'wrangler.jsonc'), 'utf8'));
  assert.deepEqual(config.routes, [{ pattern: 'hoopire.com', custom_domain: true }]);
  assert.equal(config.workers_dev, true, 'the existing workers.dev address should stay available');
});

test('Cloudflare deployment binds one global visitor counter', () => {
  const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'wrangler.jsonc'), 'utf8'));
  assert.ok(config.durable_objects.bindings.some((binding) => (
    binding.name === 'VISITOR_COUNTER' && binding.class_name === 'VisitorCounter'
  )));
  assert.equal(config.exports.VisitorCounter.type, 'durable-object');
});

test('package scripts support local Cloudflare verification and deployment', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

  assert.equal(packageJson.scripts['dev:cloudflare'], 'wrangler dev');
  assert.equal(packageJson.scripts['deploy:cloudflare'], 'wrangler deploy');
  assert.match(packageJson.devDependencies.wrangler, /^\^4\./);
});
