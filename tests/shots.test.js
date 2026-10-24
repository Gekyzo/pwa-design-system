import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { clickScript, manifestOf, seedScript, shotPath, shotsOf } from '../scripts/shots.mjs';
import { APPS } from '../scripts/seeds.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const app = (name, ...slugs) => ({ name, title: name.toUpperCase(), seed: {}, screens: slugs.map((slug) => ({ slug, clicks: [`#${slug}`] })) });

// A localStorage that records what a script does to it.
const fakeStorage = (entries = {}) => {
  const store = new Map(Object.entries(entries));
  return { store, clear: () => store.clear(), setItem: (key, value) => store.set(key, String(value)) };
};

test('shotsOf gives each screen of each app, light before dark', () => {
  assert.deepEqual(shotsOf([app('a', 'one', 'two'), app('b', 'three')]).map((shot) => shot.file), [
    'shots/a/light-one.png', 'shots/a/light-two.png', 'shots/a/dark-one.png', 'shots/a/dark-two.png',
    'shots/b/light-three.png', 'shots/b/dark-three.png',
  ]);
  assert.deepEqual(shotsOf([app('a', 'one')], ['dark'])[0], { app: 'a', theme: 'dark', slug: 'one', clicks: ['#one'], file: 'shots/a/dark-one.png' });
});

test('shotsOf of no app is empty', () => {
  assert.deepEqual(shotsOf([]), []);
});

test('manifestOf keeps the apps in order with the slugs of their screens', () => {
  assert.deepEqual(manifestOf([app('a', 'one', 'two'), app('b', 'three')]), {
    themes: ['light', 'dark'],
    apps: [{ name: 'a', title: 'A', screens: ['one', 'two'] }, { name: 'b', title: 'B', screens: ['three'] }],
  });
});

test('seedScript replaces the storage, keeping a string and storing anything else as JSON', () => {
  const localStorage = fakeStorage({ old: 'x' });
  assert.equal(new Function('localStorage', `return ${seedScript({ lang: 'es', doc: { version: 1, items: ['a"b'] } })}`)(localStorage), true);
  assert.deepEqual([...localStorage.store], [['lang', 'es'], ['doc', '{"version":1,"items":["a\\"b"]}']]);
});

test('clickScript clicks each selector in order', async () => {
  const clicked = [];
  const document = { querySelector: (selector) => ({ click: () => clicked.push(selector) }) };
  const setTimeout = (done) => done();
  assert.equal(await new Function('document', 'setTimeout', `return ${clickScript(['#a', '.b[data-view="c"]'])}`)(document, setTimeout), true);
  assert.deepEqual(clicked, ['#a', '.b[data-view="c"]']);
});

test('clickScript fails on a selector that matches nothing', async () => {
  const document = { querySelector: () => null };
  await assert.rejects(new Function('document', 'setTimeout', `return ${clickScript(['#gone'])}`)(document, (done) => done()), /no #gone/);
});

test('every app has a title, a unique name and screens with unique slugs', () => {
  assert.equal(new Set(APPS.map((entry) => entry.name)).size, APPS.length);
  for (const { name, title, screens } of APPS) {
    assert.ok(title, name);
    assert.ok(screens.length, name);
    assert.equal(new Set(screens.map((screen) => screen.slug)).size, screens.length, name);
  }
});

test('the committed shots match scripts/seeds.mjs', () => {
  const manifest = JSON.parse(readFileSync(new URL('../shots/index.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest, manifestOf(APPS));
  for (const { file } of shotsOf(APPS)) assert.ok(existsSync(`${ROOT}${file}`), file);
  assert.equal(shotPath('a', 'dark', 'one'), 'shots/a/dark-one.png');
});
