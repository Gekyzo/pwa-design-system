import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { contentType, resolve, server } from '../scripts/serve.mjs';

test('resolve maps a path to a file under the root', () => {
  assert.equal(resolve('/repo', '/design-system.css'), '/repo/design-system.css');
  assert.equal(resolve('/repo', '/page.js?v=2'), '/repo/page.js');
  assert.equal(resolve('/repo', '/'), '/repo/index.html');
});

test('resolve refuses a path that leaves the root', () => {
  assert.equal(resolve('/repo', '/../etc/passwd'), null);
  assert.equal(resolve('/repo', '/%2e%2e/etc/passwd'), null);
  assert.equal(resolve('/repo', '/../repo-other/x'), null);
});

test('contentType names the type of a file, with a fallback', () => {
  assert.equal(contentType('a/design-system.css'), 'text/css; charset=utf-8');
  assert.equal(contentType('page.JS'), 'text/javascript; charset=utf-8');
  assert.equal(contentType('a.bin'), 'application/octet-stream');
});

test('server sends each file with Cache-Control: no-cache', async () => {
  const app = server().listen(0);
  await once(app, 'listening');
  const base = `http://localhost:${app.address().port}`;
  try {
    const css = await fetch(`${base}/design-system.css`);
    assert.equal(css.status, 200);
    assert.equal(css.headers.get('cache-control'), 'no-cache');
    assert.equal(css.headers.get('content-type'), 'text/css; charset=utf-8');
    assert.match(await css.text(), /@component segmented/);

    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('content-type'), 'text/html; charset=utf-8');

    const missing = await fetch(`${base}/nope.css`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('cache-control'), 'no-cache');
  } finally {
    app.close();
  }
});
