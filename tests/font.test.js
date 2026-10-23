import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const file = new URL('../geist.woff2', import.meta.url);
const css = readFileSync(new URL('../design-system.css', import.meta.url), 'utf8');

test('the font file is a woff2 of at most 80 KB', () => {
  assert.equal(readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2');
  assert.ok(statSync(file).size <= 81920);
});

test('the font face names the shipped file', () => {
  const tokens = css.slice(css.indexOf('@layer tokens {'), css.indexOf('@layer base {'));
  const face = tokens.match(/@font-face\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(face, /font-family:\s*"Geist"/);
  assert.match(face, /src:\s*url\("geist\.woff2"\)\s*format\("woff2"\)/);
  assert.match(face, /font-weight:\s*100 900/);
  assert.match(face, /font-display:\s*swap/);
});
