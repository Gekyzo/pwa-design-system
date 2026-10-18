// Tries this design system in each sibling app without touching it: copies the app to a temp dir,
// syncs the design system into the copy, runs `node --test` there and prints a table.
// Usage: node scripts/try-apps.mjs [appName…]   (default: the five apps and pwa-shopping-list)

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sync } from '../sync.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPS = ['pwa-template', 'pwa-wardrobe', 'pwa-shifts', 'pwa-nexus', 'pwa-financial-calculator', 'pwa-shopping-list'];

const tryApp = (name) => {
  const copy = mkdtempSync(join(tmpdir(), `try-${name}-`));
  try {
    cpSync(join(ROOT, '..', name), copy, { recursive: true, filter: (path) => !/(^|\/)(\.git|node_modules)$/.test(path) });
    sync({ from: ROOT, to: copy });
    const { stdout, stderr } = spawnSync('node', ['--test', '--test-reporter=tap'], { cwd: copy, encoding: 'utf8', maxBuffer: 1 << 26 });
    const count = (label) => Number(stdout.match(new RegExp(`^# ${label} (\\d+)`, 'm'))?.[1] ?? 0);
    const failing = [...new Set([...stdout.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map((m) => m[1].trim()))];
    return { name, pass: count('pass'), fail: count('fail'), failing, error: stdout ? '' : stderr.trim().split('\n')[0] };
  } catch (error) {
    return { name, pass: 0, fail: 0, failing: [], error: error.message };
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
};

const names = process.argv.slice(2).length ? process.argv.slice(2) : APPS;
for (const { name, pass, fail, failing, error } of names.map(tryApp)) {
  console.log(`${name}\tpass ${pass}\tfail ${fail}\t${error || failing.join(' | ')}`);
}
