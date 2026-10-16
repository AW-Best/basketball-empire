const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const method of ['GET', 'HEAD']) {
  test(`ads.txt ${method} records bounded diagnostics without request secrets`, async (t) => {
    const { default: worker } = await import('../cloudflare/worker.mjs');
    const entries = [];
    t.mock.method(console, 'info', (entry) => entries.push(entry));
    const before = Date.now();
    const response = await worker.fetch(new Request('https://hoopire.com/ads.txt?token=secret-query', {
      method,
      headers: {
        'user-agent': 'Mediapartners-Google' + 'x'.repeat(500),
        'cf-ray': 'ray-test',
        cookie: 'secret-cookie',
        authorization: 'Bearer secret-auth',
        'cf-connecting-ip': '192.0.2.1',
      },
    }), {});
    assert.equal(response.status, 200);
    assert.equal(await response.text(), method === 'HEAD' ? '' : 'google.com, pub-6603520082677971, DIRECT, f08c47fec0942fa0\n');
    assert.equal(entries.length, 1);
    const entry = entries[0];
    assert.deepEqual(Object.keys(entry).sort(), ['event', 'timestamp', 'method', 'hostname', 'path', 'userAgent', 'rayId', 'status'].sort());
    assert.equal(entry.event, 'ads_txt_request');
    assert.ok(Date.parse(entry.timestamp) >= before && Date.parse(entry.timestamp) <= Date.now());
    assert.equal(entry.method, method);
    assert.equal(entry.hostname, 'hoopire.com');
    assert.equal(entry.path, '/ads.txt');
    assert.equal(entry.userAgent.length, 256);
    assert.equal(entry.rayId, 'ray-test');
    assert.equal(entry.status, response.status);
    assert.doesNotMatch(JSON.stringify(entry), /secret-|192\.0\.2\.1/);
  });
}

test('unrelated assets do not emit ads.txt diagnostics', async (t) => {
  const { default: worker } = await import('../cloudflare/worker.mjs');
  const entries = [];
  t.mock.method(console, 'info', (entry) => entries.push(entry));
  const response = await worker.fetch(new Request('https://hoopire.com/'), {
    ASSETS: { fetch: async () => new Response('page') },
  });
  assert.equal(await response.text(), 'page');
  assert.deepEqual(entries, []);
});

test('Cloudflare persists diagnostics without automatic invocation logs', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../wrangler.jsonc'), 'utf8'));
  assert.equal(config.observability.enabled, true);
  assert.equal(config.observability.head_sampling_rate, 1);
  assert.equal(config.observability.logs.invocation_logs, false);
});
