import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sync } from '../sync.mjs';

const FILES = { 'design-system.css': '@layer tokens;\n', 'catalog.js': 'export {};\n', 'rules.js': 'export const RULES = [];\n' };
const sha = (text) => createHash('sha256').update(text).digest('hex');
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

// A committed source repository and an app directory.
const fixture = () => {
  const from = mkdtempSync(join(tmpdir(), 'ds-from-'));
  const to = mkdtempSync(join(tmpdir(), 'ds-to-'));
  for (const [name, text] of Object.entries(FILES)) writeFileSync(join(from, name), text);
  writeFileSync(join(from, 'version.json'), '{ "version": "1.2.3" }\n');
  writeFileSync(join(to, 'package.json'), '{}\n');
  git(from, 'init', '-q');
  git(from, 'add', '.');
  git(from, 'commit', '-qm', 'init');
  return { from, to };
};

test('sync writes the three files and SOURCE.json with the hashes of their content', () => {
  const { from, to } = fixture();
  const source = sync({ from, to });
  const dir = join(to, 'vendor/design-system');
  for (const [name, text] of Object.entries(FILES)) assert.equal(readFileSync(join(dir, name), 'utf8'), text);
  assert.deepEqual(source, {
    version: '1.2.3',
    commit: git(from, 'rev-parse', 'HEAD'),
    files: Object.fromEntries(Object.entries(FILES).map(([name, text]) => [name, sha(text)])),
  });
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'SOURCE.json'), 'utf8')), source);
});

test('sync replaces an older vendored copy', () => {
  const { from, to } = fixture();
  mkdirSync(join(to, 'vendor/design-system'), { recursive: true });
  writeFileSync(join(to, 'vendor/design-system/design-system.css'), 'old');
  sync({ from, to });
  assert.equal(readFileSync(join(to, 'vendor/design-system/design-system.css'), 'utf8'), FILES['design-system.css']);
});

test('sync refuses when a file that it copies has uncommitted changes', () => {
  const { from, to } = fixture();
  writeFileSync(join(from, 'rules.js'), 'export const RULES = [1];\n');
  assert.throws(() => sync({ from, to }), /uncommitted changes in pwa-design-system/);
  assert.equal(existsSync(join(to, 'vendor')), false);
});

test('sync ignores an uncommitted file that it does not copy', () => {
  const { from, to } = fixture();
  writeFileSync(join(from, 'notes.md'), 'draft');
  assert.doesNotThrow(() => sync({ from, to }));
});

test('sync refuses a directory with no package.json', () => {
  const { from } = fixture();
  const to = mkdtempSync(join(tmpdir(), 'ds-empty-'));
  assert.throws(() => sync({ from, to }), /not an app/);
  assert.equal(existsSync(join(to, 'vendor')), false);
});

test('sync refuses when version.json has uncommitted changes', () => {
  const { from, to } = fixture();
  writeFileSync(join(from, 'version.json'), '{ "version": "9.9.9" }\n');
  assert.throws(() => sync({ from, to }), /uncommitted changes in pwa-design-system/);
  assert.equal(existsSync(join(to, 'vendor')), false);
});

test('sync refuses the design system itself as a target', () => {
  const { from, to } = fixture();
  writeFileSync(join(to, 'design-system.css'), '@layer tokens;\n');
  assert.throws(() => sync({ from, to }), /not an app/);
  assert.equal(existsSync(join(to, 'vendor')), false);
});
