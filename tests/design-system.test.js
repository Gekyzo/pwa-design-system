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

// The 60 shared tokens: 57 custom properties of :root and the colour scheme of :root and of each theme.
const TOKENS = [
  '--bg', '--surface', '--surface-2', '--text', '--muted', '--line', '--accent', '--accent-text', '--accent-soft', '--danger',
  '--warning', '--toast-bg', '--toast-text', '--knob', '--scrim', '--font', '--font-mono', '--text-xs', '--text-s',
  '--text-m', '--text-l', '--text-xl', '--weight-normal', '--weight-medium', '--weight-strong', '--space-half', '--space-1', '--space-2',
  '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--radius-s', '--radius-m', '--radius-l', '--radius-xl',
  '--radius-pill', '--radius-round', '--tap', '--tap-l', '--dock-height', '--icon', '--icon-s', '--arrow', '--nav-height',
  '--rail-width', '--content-max', '--pane-list', '--art-width', '--logo', '--shadow-s', '--shadow-l', '--motion-fast',
  '--motion', '--motion-slow', '--ease',
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

test('the tokens layer holds the 60 shared tokens', () => {
  assert.equal(TOKENS.length + SCHEMES.length, 60);
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

const valueIn = (layer, selector, property) =>
  rules.find((rule) => rule.layer === layer && rule.selector === selector && rule.declarations.some((d) => d.property === property))
    ?.declarations.find((d) => d.property === property).value;

test('the tokens take the values of the revision', () => {
  const expected = {
    '--tap': '48px', '--nav-height': '64px', '--dock-height': '56px', '--radius-m': '12px', '--radius-l': '20px',
    '--radius-xl': '28px', '--surface': 'light-dark(#ffffff, #1d2621)', '--surface-2': 'light-dark(#eef2ef, #26302a)',
    '--weight-medium': '600', '--text-l': '1.375rem', '--space-7': '32px', '--shadow-l': '0 8px 24px rgb(0 0 0 / 0.14)',
    '--ease': 'cubic-bezier(0.2, 0.8, 0.2, 1)', '--motion': '250ms',
  };
  for (const [name, value] of Object.entries(expected)) assert.equal(valueIn('tokens', ':root', name), value, name);
});

test('the reduced-motion block still sets --motion to 0ms', () => {
  const reduced = rules.filter((rule) => rule.layer === 'tokens' && rule.selector === ':root' && rule.declarations.some((d) => d.property === '--motion' && d.value === '0ms'));
  assert.equal(reduced.length, 1);
});

test('a base button is as tall as --tap', () => {
  assert.equal(valueIn('base', 'button', 'min-height'), 'var(--tap)');
});

test('an idle toggle is muted and a pressed one has an accent shape behind its icon', () => {
  assert.equal(valueIn('components', '.button.toggle', 'color'), 'var(--muted)');
  const pressed = '.button.toggle[aria-pressed="true"]';
  assert.equal(valueIn('components', pressed, 'color'), 'var(--accent)');
  assert.equal(valueIn('components', pressed, 'background'), 'var(--accent-soft)');
});

test('an input has one focus indicator: the border, with no outline', () => {
  assert.equal(valueIn('components', '.input:focus-visible', 'outline'), 'none');
  assert.equal(valueIn('components', '.input:focus-visible', 'border-color'), 'var(--accent)');
  assert.equal(valueIn('components', '.input.strong', 'border'), '1px solid var(--accent)');
  assert.equal(valueIn('components', '.input.strong:focus-visible', 'border-width'), '2px');
});

test('the native search cancel button of an input is removed', () => {
  assert.equal(valueIn('components', '.input::-webkit-search-cancel-button', 'appearance'), 'none');
});

test('the actions of a closed swipe row are hidden', () => {
  assert.equal(valueIn('components', '.item-row-swipe:not(.open) .item-row-actions', 'visibility'), 'hidden');
});

test('a scrolling cluster fades its end', () => {
  assert.match(valueIn('layouts', '.cluster.scroll', 'mask-image'), /^linear-gradient\(to right, black calc\(100% - var\(--space-7\)\), transparent\)$/);
  assert.equal(valueIn('layouts', '.cluster.scroll', 'padding-inline-end'), 'var(--space-6)');
});

const declaration = (selector, property) => valueIn('components', selector, property);

test('the sheet has a head, a body, a foot and a saved note', () => {
  const sheet = catalog.components.find((part) => part.name === 'sheet');
  for (const name of ['sheet-head', 'sheet-body', 'sheet-foot', 'sheet-saved']) assert.ok(sheet.parts.some((part) => part.name === name), name);
  assert.ok(sheet.variants.some((variant) => variant.name === 'main'));
  assert.ok(sheet.states.some((state) => state.name === 'on'));
});

test('a sheet with a head is a column that scrolls in its body', () => {
  const selector = '.sheet:has(.sheet-head)';
  assert.equal(declaration(selector, 'padding'), '0');
  assert.equal(declaration(selector, 'display'), 'flex');
  assert.equal(declaration(selector, 'flex-direction'), 'column');
  assert.equal(declaration(selector, 'overflow'), 'hidden');
  assert.equal(declaration('.sheet-body', 'overflow-y'), 'auto');
  assert.equal(declaration('.sheet-body', 'flex'), '1');
  assert.equal(declaration('.sheet-foot', 'border-top'), '1px solid var(--line)');
});

test('a sheet without a head keeps the padding and the scroll of 0.2.1', () => {
  const selector = '.sheet:not(:has(.sheet-head))';
  assert.equal(declaration(selector, 'padding'), 'var(--space-3) var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom))');
  assert.equal(declaration(selector, 'overflow-y'), 'auto');
});

test('the handle and the head take the vertical pan, and the handle is a tap tall', () => {
  assert.equal(declaration('.sheet-grab', 'touch-action'), 'none');
  assert.equal(declaration('.sheet-head', 'touch-action'), 'none');
  assert.equal(declaration('.sheet:has(.sheet-head) .sheet-grab', 'height'), 'var(--tap)');
  assert.equal(declaration('.sheet:has(.sheet-head) .sheet-grab::before', 'background'), 'var(--muted)');
});

test('a sheet without a head keeps the handle of 0.2.1', () => {
  const expected = { width: '40px', height: '4px', margin: '0 auto var(--space-3)', 'border-radius': 'var(--radius-s)', background: 'var(--line)' };
  for (const [property, value] of Object.entries(expected)) assert.equal(declaration('.sheet-grab', property), value, property);
});

test('the head and the foot reverse for the left hand', () => {
  const selector = '[data-hand="left"] .sheet-head, [data-hand="left"] .sheet-foot';
  assert.equal(declaration(selector, 'flex-direction'), 'row-reverse');
});

test('the saved note shows with the state on, and the sheet moves with --ease', () => {
  assert.equal(declaration('.sheet-saved', 'opacity'), '0');
  assert.equal(declaration('.sheet-saved.on', 'opacity'), '1');
  assert.equal(declaration('.sheet', 'transition'), 'transform var(--motion) var(--ease)');
});

const inLayouts = (selector, property) => valueIn('layouts', selector, property);

test('the input row reverses for the left hand and pins to the bottom of a sheet', () => {
  assert.equal(inLayouts('[data-hand="left"] .input-row', 'flex-direction'), 'row-reverse');
  assert.equal(inLayouts('.input-row.pinned', 'position'), 'sticky');
  assert.equal(inLayouts('.input-row.pinned', 'bottom'), '0');
  assert.equal(inLayouts('.input-row.pinned', 'background'), 'var(--surface)');
  const row = catalog.components.find((part) => part.name === 'input-row');
  assert.ok(row.variants.some((variant) => variant.name === 'pinned'));
});

test('a disabled submit button of the input row has no fill', () => {
  const selector = '.input-row > .button:disabled';
  assert.equal(inLayouts(selector, 'background'), 'var(--surface-2)');
  assert.equal(inLayouts(selector, 'color'), 'var(--muted)');
  assert.equal(inLayouts(selector, 'opacity'), '1');
});

test('an invalid input has a danger border, and input-help shows the error in danger', () => {
  assert.equal(declaration('.input[aria-invalid="true"]', 'border-color'), 'var(--danger)');
  assert.equal(declaration('.input-help.danger', 'color'), 'var(--danger)');
  const input = catalog.components.find((part) => part.name === 'input');
  assert.ok(input.parts.some((part) => part.name === 'input-help'));
  assert.ok(input.states.some((state) => state.name === 'invalid'));
  assert.ok(input.variants.some((variant) => variant.name === 'danger'));
});
