import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCatalog, rulesOf } from '../catalog.js';

const css = readFileSync(new URL('../design-system.css', import.meta.url), 'utf8');
const catalog = parseCatalog({ css, sprite: '' });
const rules = rulesOf(css);

// The checks below say "holds", not "holds exactly": a later shared addition does not fail them.
const CORE = [
  'app-header', 'badge', 'banner', 'button', 'chip', 'empty-state', 'fab', 'field', 'group-head', 'icon', 'input',
  'item-list', 'item-row', 'list-group', 'nav-bar', 'pill', 'ring', 'section-head', 'segmented', 'select', 'sheet',
  'swipe-action', 'switch', 'toast',
];

// The 55 shared tokens: 52 custom properties of :root and the colour scheme of :root and of each theme.
const TOKENS = [
  '--bg', '--surface', '--text', '--muted', '--line', '--accent', '--accent-text', '--accent-soft', '--danger',
  '--warning', '--toast-bg', '--toast-text', '--knob', '--scrim', '--font', '--font-mono', '--text-xs', '--text-s',
  '--text-m', '--text-l', '--text-xl', '--weight-normal', '--weight-strong', '--space-half', '--space-1', '--space-2',
  '--space-3', '--space-4', '--space-5', '--space-6', '--radius-s', '--radius-m', '--radius-l', '--radius-xl',
  '--radius-pill', '--radius-round', '--tap', '--tap-l', '--icon', '--icon-s', '--arrow', '--nav-height',
  '--rail-width', '--content-max', '--pane-list', '--art-width', '--logo', '--shadow-s', '--shadow-l', '--motion-fast',
  '--motion', '--motion-slow',
];
const SCHEMES = [':root color-scheme', ':root[data-theme="light"] color-scheme', ':root[data-theme="dark"] color-scheme'];

const of = (layer) => catalog.components.filter((part) => part.layer === layer).map((part) => part.name);

test('the catalogue of the shared stylesheet has no error', () => {
  assert.deepEqual(catalog.errors, []);
});

test('the components layer holds the 24 core components', () => {
  for (const name of CORE) assert.ok(of('components').includes(name), name);
});

test('the base layer holds main and the layouts layer the four layouts', () => {
  assert.ok(of('base').includes('main'));
  for (const name of ['cluster', 'input-row', 'pane', 'split']) assert.ok(of('layouts').includes(name), name);
});

test('the layer statement comes first', () => {
  assert.ok(css.startsWith('@layer tokens, base, components, layouts, screens;\n'));
});

test('the tokens layer holds the 55 shared tokens', () => {
  assert.equal(TOKENS.length + SCHEMES.length, 55);
  const pairs = new Set(rules.filter((rule) => rule.layer === 'tokens').flatMap((rule) => rule.declarations.map((d) => `${rule.selector} ${d.property}`)));
  for (const name of TOKENS) assert.ok(pairs.has(`:root ${name}`), name);
  for (const pair of SCHEMES) assert.ok(pairs.has(pair), pair);
});

test('the layout tokens are a size scale', () => {
  const scales = new Map(catalog.tokens.map((token) => [token.name, token.scale]));
  for (const name of ['--rail-width', '--content-max', '--pane-list']) assert.equal(scales.get(name), 'size', name);
});

test('no rule is in screens, and each rule is in a layer', () => {
  assert.equal(rules.filter((rule) => rule.layer === 'screens').length, 0);
  assert.ok(rules.every((rule) => rule.layer));
});
