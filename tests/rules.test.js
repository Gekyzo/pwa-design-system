import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RULES } from '../rules.js';

const shared = readFileSync(new URL('../design-system.css', import.meta.url), 'utf8');
const rule = (id, match) => RULES.find((entry) => entry.id === id && entry.title.includes(match));

test('each rule has a unique title and an id of a known family', () => {
  assert.ok(RULES.length > 0);
  assert.equal(new Set(RULES.map((entry) => entry.title)).size, RULES.length);
  for (const entry of RULES) {
    assert.match(entry.id, /^(DS|LAY|TAP|TXT|FOCUS|SHEET|HAND|STATE)-\d+$/);
    assert.ok(entry.reads.length > 0 && typeof entry.check === 'function', entry.title);
  }
});

test('each id of DS-1 to DS-8, LAY-3, LAY-4, TAP-1, TAP-2, TXT-1 and FOCUS-1 has a rule', () => {
  const ids = new Set(RULES.map((entry) => entry.id));
  for (const id of ['DS-1', 'DS-2', 'DS-3', 'DS-4', 'DS-5', 'DS-6', 'DS-7', 'DS-8', 'LAY-3', 'LAY-4', 'TAP-1', 'TAP-2', 'TXT-1', 'FOCUS-1']) assert.ok(ids.has(id), id);
});

test('each rule that reads only css passes over design-system.css', () => {
  const only = RULES.filter((entry) => entry.reads.join() === 'css');
  assert.ok(only.length >= 10);
  for (const entry of only) assert.deepEqual(entry.check({ css: [shared] }), [], entry.title);
});

const LAYERS = '@layer tokens, base, components, layouts, screens;\n';

test('DS-1 reports a sheet without the layer statement and a rule outside the layers', () => {
  const check = rule('DS-1', 'five layers').check;
  assert.equal(check({ css: [shared, 'a { color: red; }'] }).length, 2);
  assert.equal(check({ css: [shared, `${LAYERS}@layer screens { .x { margin: 0; } }`] }).length, 0);
  assert.equal(check({ css: [`${LAYERS}.x { margin: 0; }`] }).length, 1);
});

test('DS-1 names the sheet that has no layer statement by its index in css', () => {
  const check = rule('DS-1', 'five layers').check;
  assert.deepEqual(check({ css: [shared, 'a { margin: 0; }'] }).filter((text) => text.includes('layer statement')), ['css[1] does not start with the layer statement']);
});

test('DS-2 reports a raw value outside the tokens layer', () => {
  const check = rule('DS-2', 'raw value of a token property').check;
  assert.equal(check({ css: [`${LAYERS}@layer screens { .x { padding: 12px; } }`] }).length, 1);
  assert.equal(check({ css: [`${LAYERS}@layer screens { .x { padding: var(--space-3); } }`] }).length, 0);
  assert.equal(check({ css: [`${LAYERS}@layer tokens { :root { --space-3: 12px; } }`] }).length, 0);
});

test('DS-2 reports reduced motion that is declared twice', () => {
  const check = rule('DS-2', 'reduced motion').check;
  const motion = '@layer tokens { @media (prefers-reduced-motion: reduce) { :root { --motion: 0ms; } } }';
  assert.equal(check({ css: [LAYERS + motion] }).length, 0);
  assert.ok(check({ css: [LAYERS + motion + motion] }).length > 0);
});

test('DS-4 reports an id and a bare element inside a class', () => {
  const check = rule('DS-4', 'bare element').check;
  assert.equal(check({ css: [`${LAYERS}@layer screens { #x { margin: 0; } }`] }).length, 1);
  assert.equal(check({ css: [`${LAYERS}@layer screens { .x span { margin: 0; } }`] }).length, 1);
  assert.equal(check({ css: [`${LAYERS}@layer screens { .x > .y { margin: 0; } }`] }).length, 0);
});

test('DS-8 reports a width query that is not a min-width breakpoint', () => {
  const check = rule('DS-8', 'width query').check;
  const base = '@media (min-width: 600px) {} @media (min-width: 840px) {}';
  assert.deepEqual(check({ css: [base] }), []);
  assert.deepEqual(check({ css: [`${base} @media (max-width: 500px) {}`] }), ['max-500px']);
});

test('LAY-4 reads the body padding from the app sheet only', () => {
  const check = rule('LAY-4', 'cutout').check;
  assert.deepEqual(check({ css: [shared] }), []);
  assert.deepEqual(check({ css: [shared, LAYERS] }), ['body end padding', 'body start padding']);
  const body = `${LAYERS}@layer base { body { padding-inline-start: env(safe-area-inset-left); padding-inline-end: env(safe-area-inset-right); } }`;
  assert.deepEqual(check({ css: [shared, body] }), []);
});

test('the icons of the examples are checked only in the sheets of the app', () => {
  const check = rule('DS-6', 'each example').check;
  const sheet = (name) => `${LAYERS}@layer components {\n  /* @component ${name}\n   @summary Text.\n   @example <i class="${name}"><svg><use href="icons.svg#note"/></svg></i> */\n  .${name} { color: var(--x); }\n}\n`;
  const sprite = '<svg><symbol id="cart"/></svg>';
  assert.deepEqual(check({ css: [sheet('alpha')], sprite }), []);
  assert.deepEqual(check({ css: [sheet('alpha'), sheet('beta')], sprite }), ['note']);
});

const inScreens = (body) => `${LAYERS}@layer components { ${body} }`;

test('TAP-1 reports a 44px height and a control under the tap size', () => {
  const check = rule('TAP-1', 'tap').check;
  assert.equal(check({ css: [inScreens('.x { min-height: 44px; }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.x { height: 44px; }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.x { min-height: var(--tap); }')] }).length, 0);
  assert.equal(check({ css: [inScreens('.chip { min-height: var(--icon); }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.button.small { height: var(--icon); }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.input { min-height: 40px; }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.segment { min-height: var(--tap-l); }')] }).length, 0);
  assert.equal(check({ css: [inScreens('.button.x { min-height: calc(var(--tap) + 2px); }')] }).length, 0);
  assert.equal(check({ css: [inScreens('.button.x { min-height: max(var(--icon), var(--tap)); }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.button.x { min-height: var(--tapx); }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.switch-input { height: 26px; }')] }).length, 0);
});

test('TAP-2 reports --line as a text colour', () => {
  const check = rule('TAP-2', 'line').check;
  assert.equal(check({ css: [inScreens('.button.x { color: var(--line); }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.button.x { border-color: var(--line); }')] }).length, 0);
});

test('TXT-1 reports justified text', () => {
  const check = rule('TXT-1', 'justif').check;
  assert.equal(check({ css: [inScreens('.x { text-align: justify; }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.x { text-align: justify !important; }')] }).length, 1);
  assert.equal(check({ css: [inScreens('.x { text-align: start; }')] }).length, 0);
});

test('FOCUS-1 keeps one focus ring: the input drops the global outline and draws a border', () => {
  const check = rule('FOCUS-1', 'focus').check;
  const global = ':focus-visible { outline: 2px solid var(--accent); }';
  assert.deepEqual(check({ css: [shared] }), []);
  assert.equal(check({ css: [inScreens(global)] }).length, 1);
  assert.equal(check({ css: [inScreens(`${global} .input:focus-visible { outline: none; border-color: var(--accent); }`)] }).length, 0);
  assert.equal(check({ css: [inScreens(`${global} .input:focus-visible { outline: 2px solid var(--accent); }`)] }).length, 2);
  assert.equal(check({ css: [inScreens(`${global} .input:focus-visible { outline: none !important; }`)] }).length, 0);
  assert.equal(check({ css: [inScreens(`${global} .input:focus-visible { outline: none; } .field:focus-within .input { outline: 1px solid red; }`)] }).length, 0);
  assert.equal(check({ css: [inScreens('.field-input:focus { outline: 1px solid var(--accent); }')] }).length, 1);
});
