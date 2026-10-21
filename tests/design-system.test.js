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

// The 61 shared tokens: 58 custom properties of :root and the colour scheme of :root and of each theme.
const TOKENS = [
  '--bg', '--surface', '--surface-2', '--text', '--muted', '--line', '--accent', '--accent-text', '--accent-soft', '--danger',
  '--warning', '--toast-bg', '--toast-text', '--knob', '--scrim', '--font', '--font-mono', '--text-xs', '--text-s',
  '--text-m', '--text-l', '--text-xl', '--weight-normal', '--weight-medium', '--weight-strong', '--space-half', '--space-1', '--space-2',
  '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--radius-s', '--radius-m', '--radius-l', '--radius-xl',
  '--radius-pill', '--radius-round', '--tap', '--tap-l', '--dock-height', '--icon', '--icon-s', '--arrow', '--nav-height',
  '--rail-width', '--side-sheet', '--content-max', '--pane-list', '--art-width', '--logo', '--shadow-s', '--shadow-l', '--motion-fast',
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

test('the tokens layer holds the 61 shared tokens', () => {
  assert.equal(TOKENS.length + SCHEMES.length, 61);
  const pairs = new Set(rules.filter((rule) => rule.layer === 'tokens').flatMap((rule) => rule.declarations.map((d) => `${rule.selector} ${d.property}`)));
  for (const name of TOKENS) assert.ok(pairs.has(`:root ${name}`), name);
  for (const pair of SCHEMES) assert.ok(pairs.has(pair), pair);
});

test('the layout tokens are a size scale', () => {
  const scales = new Map(catalog.tokens.map((token) => [token.name, token.scale]));
  for (const name of ['--rail-width', '--content-max', '--pane-list', '--side-sheet']) assert.equal(scales.get(name), 'size', name);
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

test('an invalid input keeps the danger border on focus, also strong and in a field', () => {
  for (const selector of [
    '.input[aria-invalid="true"]:focus-visible',
    '.input.strong[aria-invalid="true"]',
    '.input.strong[aria-invalid="true"]:focus-visible',
    '.field-input[aria-invalid="true"]:focus',
  ]) assert.equal(declaration(selector, 'border-color'), 'var(--danger)', selector);
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

test('the action bar sticks to the bottom and its buttons keep the large tap size', () => {
  assert.equal(declaration('.action-bar', 'position'), 'sticky');
  assert.equal(declaration('.action-bar', 'bottom'), '0');
  assert.equal(declaration('.action-bar', 'background'), 'linear-gradient(transparent, var(--bg) var(--space-4))');
  assert.equal(declaration('.action-bar', 'padding'), 'var(--space-2) var(--space-4)');
  assert.equal(declaration('.action-bar .button', 'min-height'), 'var(--tap-l)');
  assert.equal(declaration('.action-bar .button', 'white-space'), 'nowrap');
  assert.ok(catalog.components.some((part) => part.name === 'action-bar' && part.examples.length));
});

test('a settings row is a tall row, danger is red, and the group head is a quiet title', () => {
  assert.equal(declaration('.settings-row', 'min-height'), 'var(--tap-l)');
  assert.equal(declaration('.settings-row.danger', 'color'), 'var(--danger)');
  assert.equal(declaration('.list-group-head', 'color'), 'var(--muted)');
  assert.equal(declaration('.list-group-head', 'font-weight'), 'var(--weight-medium)');
  assert.equal(declaration('.list-group-head', 'text-transform'), undefined);
  assert.equal(declaration('.settings-row .chevron', 'color'), 'var(--muted)');
  assert.equal(declaration('.list-group.card', 'box-shadow'), 'var(--shadow-s)');
  assert.equal(declaration('.list-group.card', 'border'), '0');
  const group = catalog.components.find((part) => part.name === 'list-group');
  for (const name of ['list-group-head', 'settings-row', 'settings-row-label', 'settings-row-value']) assert.ok(group.parts.some((part) => part.name === name), name);
  assert.ok(group.variants.some((variant) => variant.name === 'danger'));
  assert.ok(group.variants.some((variant) => variant.name === 'card'));
});

test('a low empty state sits at the bottom of its area with a large button', () => {
  const selector = '.empty-state.low';
  assert.equal(declaration(selector, 'display'), 'flex');
  assert.equal(declaration(selector, 'flex-direction'), 'column');
  assert.equal(declaration(selector, 'justify-content'), 'flex-end');
  assert.equal(declaration(selector, 'min-height'), '50%');
  assert.equal(declaration('.empty-state.low .button', 'min-height'), 'var(--tap-l)');
  const empty = catalog.components.find((part) => part.name === 'empty-state');
  assert.ok(empty.variants.some((variant) => variant.name === 'low'));
  assert.ok(empty.parts.some((part) => part.name === 'empty-state-title'));
});

test('an outline button of an empty state is opaque, with the text colour', () => {
  assert.equal(declaration('.empty-state .button.outline', 'background'), 'var(--surface)');
  assert.equal(declaration('.empty-state .button.outline', 'color'), 'var(--text)');
});

test('a segmented is a switch track whose knob slides to the chosen segment', () => {
  assert.equal(declaration('.segmented', 'background'), 'var(--surface-2)');
  assert.equal(declaration('.segmented::before', 'background'), 'var(--accent)');
  assert.equal(declaration('.segmented::before', 'transform'), 'translateX(calc(var(--segment-index) * 100%))');
  assert.equal(declaration('.segmented:has(> .segment:nth-child(3))', '--segment-count'), '3');
  assert.equal(declaration('.segmented:has(> .segment:nth-child(2)[aria-pressed="true"])', '--segment-index'), '1');
  assert.equal(declaration('.segmented:has(> .segment:nth-child(3)[aria-pressed="true"])', '--segment-index'), '2');
  assert.equal(declaration('.segmented .segment[aria-pressed="true"]', 'color'), 'var(--accent-text)');
});

test('a swipe action stacks its icon and label in a column 72px wide', () => {
  assert.equal(declaration('.swipe-action', 'flex-direction'), 'column');
  assert.equal(declaration('.swipe-action', 'width'), 'calc(var(--tap) + var(--space-6))');
  assert.equal(declaration('.swipe-action', 'font-size'), 'var(--text-xs)');
  assert.equal(declaration('.swipe-action.neutral', 'background'), 'var(--surface-2)');
  assert.equal(declaration('.swipe-action.neutral', 'color'), 'var(--text)');
  const action = catalog.components.find((part) => part.name === 'swipe-action');
  assert.ok(action.variants.some((variant) => variant.name === 'neutral'));
  assert.ok(action.parts.some((part) => part.name === 'swipe-action-label'));
});

test('the row trailing slot is fixed, and mirrors as a whole for the left hand', () => {
  assert.equal(declaration('.item-row-end', 'flex'), 'none');
  assert.equal(declaration('.item-row-end', 'width'), 'calc(var(--tap) * 2)');
  assert.equal(declaration('[data-hand="left"] .item-row-end', 'flex-direction'), 'row-reverse');
  const row = catalog.components.find((part) => part.name === 'item-row');
  assert.ok(row.parts.some((part) => part.name === 'item-row-end'));
  assert.ok(row.parts.some((part) => part.name === 'item-row-label'));
});

test('the left hand moves only the check and the trailing slot, not the text', () => {
  assert.notEqual(declaration('[data-hand="left"] .item-row-body', 'flex-direction'), 'row-reverse');
  assert.equal(declaration('[data-hand="left"] .item-row-check', 'order'), '1');
  assert.equal(declaration('[data-hand="left"] .item-row-end', 'order'), '-1');
});

test('a row label holds two lines, and a tick row is the tick target', () => {
  assert.equal(declaration('.item-row-label', '-webkit-line-clamp'), '2');
  assert.equal(declaration('.item-row-label', 'display'), '-webkit-box');
  assert.equal(declaration('.item-row-body.tick .item-row-check', 'pointer-events'), 'none');
  assert.equal(declaration('.item-row-body.tick', 'cursor'), 'pointer');
  const row = catalog.components.find((part) => part.name === 'item-row');
  assert.ok(row.states.some((state) => state.name === 'tick'));
});

const allValues = (selector, property) =>
  rules.filter((rule) => rule.selector === selector).flatMap((rule) => rule.declarations.filter((d) => d.property === property).map((d) => d.value));

test('the dock is fixed above the bottom bar and is hidden from 600px', () => {
  assert.equal(declaration('.dock', 'position'), 'fixed');
  assert.equal(declaration('.dock', 'bottom'), 'calc(var(--nav-height) + env(safe-area-inset-bottom))');
  assert.equal(declaration('.dock', 'height'), 'var(--dock-height)');
  assert.equal(declaration('.dock', 'background'), 'var(--surface)');
  assert.ok(allValues('.dock', 'display').includes('none'));
  const padding = declaration('.dock', 'padding-inline');
  assert.match(padding, /safe-area-inset-left/);
  assert.match(padding, /safe-area-inset-right/);
});

test('the dock mirrors for the left hand and has a field and a clear part', () => {
  assert.equal(declaration('[data-hand="left"] .dock', 'flex-direction'), 'row-reverse');
  assert.equal(declaration('.dock-clear', 'color'), 'var(--muted)');
  assert.equal(declaration('.dock-clear', 'width'), 'var(--tap)');
  const dock = catalog.components.find((part) => part.name === 'dock');
  for (const name of ['dock-field', 'dock-clear']) assert.ok(dock.parts.some((part) => part.name === name), name);
});

test('a dock lifts the add button and the main padding below 600px', () => {
  assert.match(allValues('body:has(.dock:not([hidden])) .fab', 'bottom').join(), /var\(--dock-height\)/);
  assert.match(allValues('body:has(.dock:not([hidden])) main', 'padding-bottom')[0], /var\(--dock-height\)/);
});

test('the current nav item is a pill behind its icon with a plain label', () => {
  const current = '.nav-item[aria-current="page"]';
  assert.equal(declaration(`${current} .icon`, 'background'), 'var(--accent-soft)');
  assert.equal(declaration(`${current} .icon`, 'border-radius'), 'var(--radius-pill)');
  assert.equal(declaration(`${current} .icon`, 'color'), 'var(--accent)');
  assert.match(declaration(`${current} .icon`, 'padding'), /var\(--space-1\) var\(--space-5\)/);
  assert.equal(declaration(current, 'color'), 'var(--text)');
  assert.equal(declaration(current, 'font-weight'), 'var(--weight-medium)');
});

test('the rail stands at the start side by default and at the end side for the right hand', () => {
  assert.equal(declaration('.nav-bar', 'inset-inline-start'), '0');
  assert.equal(declaration(':root[data-hand="right"] .nav-bar', 'right'), '0');
  assert.equal(declaration(':root[data-hand="right"] .nav-bar', 'inset-inline-start'), 'auto');
  assert.match(declaration(':root[data-hand="right"] .nav-bar', 'width'), /safe-area-inset-right/);
  assert.match(declaration(':root[data-hand="right"] .toast', 'right'), /var\(--rail-width\) \+ env\(safe-area-inset-right\)/);
  assert.match(declaration(':root[data-hand="right"] .toast', 'left'), /safe-area-inset-left/);
  assert.match(declaration(':root[data-hand="right"] .fab', 'right'), /var\(--rail-width\) \+ env\(safe-area-inset-right\)/);
});

test('the dock field shows its focus with an accent border', () => {
  assert.equal(declaration('.dock-field', 'border'), '2px solid var(--line)');
  assert.equal(declaration('.dock-field:focus-within', 'border-color'), 'var(--accent)');
});

test('the add button collapses to a square tap target', () => {
  assert.equal(declaration('.fab.collapsed', 'width'), 'var(--tap)');
  assert.equal(declaration('.fab.collapsed', 'height'), 'var(--tap)');
  assert.match(declaration('.fab', 'transition'), /width var\(--motion-fast\) var\(--ease\)/);
  const fab = catalog.components.find((part) => part.name === 'fab');
  assert.ok(fab.states.some((state) => state.name === 'collapsed'));
});

test('the header title is one line with an ellipsis, and the ring text has equal digits', () => {
  assert.equal(declaration('.app-header-title', 'white-space'), 'nowrap');
  assert.equal(declaration('.app-header-title', 'text-overflow'), 'ellipsis');
  assert.equal(declaration('.ring-text', 'font-variant-numeric'), 'tabular-nums');
});

test('the compact density sets three tokens in the tokens layer and leaves --tap alone', () => {
  const rule = rules.find((r) => r.layer === 'tokens' && r.selector === ':root[data-density="compact"]');
  assert.ok(rule);
  assert.deepEqual(rule.declarations.map((d) => [d.property, d.value]), [['--tap-l', '48px'], ['--nav-height', '56px'], ['--dock-height', '48px']]);
  assert.equal(valueIn('tokens', ':root', '--side-sheet'), '400px');
});

test('from 840px a sheet with a head is a side sheet next to the rail', () => {
  const layer = '.sheet-layer:has(.sheet-head)';
  const sheet = '.sheet-layer:has(.sheet-head) .sheet';
  assert.equal(declaration(layer, 'flex-direction'), 'row');
  assert.match(declaration(layer, 'padding-inline-start'), /var\(--rail-width\) \+ env\(safe-area-inset-left\)/);
  assert.equal(declaration(sheet, 'height'), '100%');
  assert.equal(declaration(sheet, 'max-height'), '100%');
  assert.equal(declaration(sheet, 'width'), 'var(--side-sheet)');
  assert.equal(declaration(sheet, 'border-start-end-radius'), 'var(--radius-xl)');
  assert.equal(declaration(sheet, 'border-start-start-radius'), '0');
  assert.equal(declaration(`${layer}[hidden] .sheet`, 'transform'), 'translateX(-100%)');
  assert.equal(declaration('.sheet:has(.sheet-head) .sheet-grab', 'display'), 'none');
});

test('the right hand puts the side sheet at the end, next to the rail', () => {
  const layer = ':root[data-hand="right"] .sheet-layer:has(.sheet-head)';
  assert.equal(declaration(layer, 'justify-content'), 'flex-end');
  assert.match(declaration(layer, 'padding-inline-end'), /var\(--rail-width\) \+ env\(safe-area-inset-right\)/);
  assert.equal(declaration(layer, 'padding-inline-start'), '0');
  assert.equal(declaration(`${layer} .sheet`, 'border-start-start-radius'), 'var(--radius-xl)');
  assert.equal(declaration(`${layer} .sheet`, 'border-start-end-radius'), '0');
  assert.equal(declaration(`${layer}[hidden] .sheet`, 'transform'), 'translateX(100%)');
});

test('the dock input shows one focus indicator and no native clear', () => {
  assert.equal(declaration('.dock-input:focus-visible', 'outline'), 'none');
  assert.equal(declaration('.dock-input::-webkit-search-cancel-button', 'appearance'), 'none');
});

test('a visible dock lifts the toast above itself below 600px and not from 600px', () => {
  const selector = 'body:has(.dock:not([hidden])) .toast';
  const values = allValues(selector, 'bottom');
  assert.equal(values.length, 2);
  assert.match(values[0], /var\(--dock-height\)/);
  assert.doesNotMatch(values[1], /var\(--dock-height\)/);
  assert.equal(values[1], allValues('.toast', 'bottom')[1]);
});

test('a headed sheet clears the bottom and the top safe areas', () => {
  const inset = (name) => new RegExp(`calc\\(var\\(--space-\\d\\) \\+ env\\(safe-area-inset-${name}\\)\\)`);
  assert.match(declaration('.sheet:has(.sheet-head):not(:has(.sheet-foot)) .sheet-body', 'padding-bottom'), inset('bottom'));
  assert.match(inLayouts('.input-row.pinned:last-child', 'padding-bottom'), inset('bottom'));
  assert.match(declaration('.sheet-layer:has(.sheet-head) .sheet-head', 'padding-top'), inset('top'));
});

test('the dock field fits the compact dock and its input fills the field', () => {
  assert.equal(declaration('.dock-field', 'height'), 'calc(var(--dock-height) - var(--space-2))');
  assert.equal(declaration('.dock-field', 'min-height'), '0');
  assert.equal(declaration('.dock-input', 'min-height'), '0');
  assert.equal(declaration('.dock-input', 'align-self'), 'stretch');
});

test('the add button collapsed has a catalogue example', () => {
  const fab = catalog.components.find((part) => part.name === 'fab');
  assert.ok(fab.examples.some((example) => /class="fab collapsed"/.test(example)));
});

test('a strong input keeps its text still when the border grows on focus', () => {
  assert.equal(declaration('.input.strong:focus-visible', 'padding-inline'), 'calc(var(--space-3) - 1px)');
});

test('an open sheet moves the toast to the top after every rule that sets its bottom', () => {
  const order = rules.filter((rule) => rule.layer === 'components' && /\.toast$/.test(rule.selector));
  const sheetOpen = order.findIndex((rule) => rule.selector === 'body:has(.sheet-layer:not([hidden])) .toast');
  assert.equal(sheetOpen, order.length - 1);
});

test('an idle switch track is --muted for a 3:1 contrast and a checked one is --accent', () => {
  assert.equal(declaration('.switch-input', 'background'), 'var(--muted)');
  assert.equal(declaration('.switch-input:checked', 'background'), 'var(--accent)');
});
