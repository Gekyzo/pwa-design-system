import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCatalog, rulesOf } from '../catalog.js';

const css = readFileSync(new URL('../design-system.css', import.meta.url), 'utf8');
const catalog = parseCatalog({ css, sprite: '' });
const rules = rulesOf(css);

const CORE = [
  'app-header', 'badge', 'banner', 'button', 'chip', 'empty-state', 'fab', 'field', 'group-head', 'icon', 'input',
  'item-list', 'item-row', 'list-group', 'nav-bar', 'pill', 'ring', 'section-head', 'segmented', 'select', 'sheet',
  'swipe-action', 'switch', 'toast',
];

test('the catalogue of the shared stylesheet has no error', () => {
  assert.deepEqual(catalog.errors, []);
});

test('the components layer holds the 24 core components', () => {
  const names = catalog.components.filter((part) => part.layer === 'components').map((part) => part.name);
  assert.equal(names.length, 24);
  assert.deepEqual([...names].sort(), [...CORE].sort());
});

test('the other parts are main in base and the four layouts', () => {
  const of = (layer) => catalog.components.filter((part) => part.layer === layer).map((part) => part.name);
  assert.deepEqual(of('base'), ['main']);
  assert.deepEqual(of('layouts').sort(), ['cluster', 'input-row', 'pane', 'split']);
  assert.equal(catalog.components.length, 29);
});

test('the layer statement comes first', () => {
  assert.ok(css.startsWith('@layer tokens, base, components, layouts, screens;\n'));
});

test('the tokens layer holds 52 distinct selector and property pairs', () => {
  const pairs = new Set(rules.filter((rule) => rule.layer === 'tokens').flatMap((rule) => rule.declarations.map((d) => `${rule.selector} ${d.property}`)));
  assert.equal(pairs.size, 52);
});

test('the shared tokens leave out the ones that an app may lack', () => {
  const names = catalog.tokens.map((token) => token.name);
  for (const name of ['--rail-width', '--content-max', '--pane-list']) assert.ok(!names.includes(name), name);
});

test('the layouts layer holds 17 rules and the base layer 11', () => {
  assert.equal(rules.filter((rule) => rule.layer === 'layouts').length, 17);
  assert.equal(rules.filter((rule) => rule.layer === 'base').length, 11);
});

test('no rule is in screens', () => {
  assert.equal(rules.filter((rule) => rule.layer === 'screens').length, 0);
  assert.ok(rules.every((rule) => rule.layer));
});
