// Takes the phone screenshots of the apps that the catalogue page shows, without touching the apps:
// copies each app to a temp dir, syncs this design system into the copy, serves it and drives
// agent-browser through the screens of scripts/seeds.mjs, in light and dark. Writes
// shots/<app>/<theme>-<screen>.png and shots/index.json.
// Usage: node scripts/shots.mjs [appName…]   (default: every app of scripts/seeds.mjs)

import { execFile } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { sync } from '../sync.mjs';
import { server } from './serve.mjs';
import { APPS } from './seeds.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const THEMES = ['light', 'dark'];
// The phone of the reference shots: 360×760 CSS pixels at 2×.
export const VIEWPORT = [360, 760, 2];

export const shotPath = (app, theme, slug) => `shots/${app}/${theme}-${slug}.png`;

// Every shot of `apps`, app by app, light before dark.
export const shotsOf = (apps, themes = THEMES) =>
  apps.flatMap((app) => themes.flatMap((theme) => app.screens.map(({ slug, clicks }) =>
    ({ app: app.name, theme, slug, clicks, file: shotPath(app.name, theme, slug) }))));

// What the catalogue page reads: the apps in order, each with the slugs of its screens.
export const manifestOf = (apps, themes = THEMES) => ({
  themes,
  apps: apps.map(({ name, title, screens }) => ({ name, title, screens: screens.map((screen) => screen.slug) })),
});

// The script that replaces the localStorage of the page with `seed`.
export const seedScript = (seed) => [
  '(() => { localStorage.clear();',
  ...Object.entries(seed).map(([key, value]) =>
    `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value))});`),
  'return true; })()',
].join(' ');

// The script that clicks each selector of `clicks`, with a pause for the slide of a view or a sheet.
export const clickScript = (clicks) =>
  `(async () => { for (const selector of ${JSON.stringify(clicks)}) {` +
  ' const target = document.querySelector(selector);' +
  ' if (!target) throw new Error(`no ${selector}`);' +
  ' target.click(); await new Promise((done) => setTimeout(done, 500)); } return true; })()';

// Async, so the server of this process can answer the browser.
const browser = (...args) => promisify(execFile)('agent-browser', ['--session', 'shots', ...args]);

const shootApp = async (app) => {
  const copy = mkdtempSync(join(tmpdir(), `shots-${app.name}-`));
  cpSync(join(ROOT, '..', app.name), copy, { recursive: true, filter: (path) => !/(^|\/)(\.git|node_modules)$/.test(path) });
  sync({ from: ROOT, to: copy });
  // A new port each run is a new origin: no service worker or storage of an earlier run.
  const http = server(copy);
  await new Promise((done) => http.listen(0, done));
  const url = `http://localhost:${http.address().port}/`;
  try {
    await browser('set', 'viewport', ...VIEWPORT.map(String));
    await browser('open', url);
    await browser('eval', seedScript(app.seed));
    for (const shot of shotsOf([app])) {
      await browser('set', 'media', shot.theme);
      await browser('open', url);
      await browser('wait', '800');
      if (shot.clicks.length) await browser('eval', clickScript(shot.clicks));
      await browser('wait', '400');
      mkdirSync(join(ROOT, 'shots', app.name), { recursive: true });
      await browser('screenshot', join(ROOT, shot.file));
      console.log(shot.file);
    }
  } finally {
    http.close();
    rmSync(copy, { recursive: true, force: true });
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = process.argv.slice(2);
  const unknown = names.filter((name) => !APPS.some((app) => app.name === name));
  if (unknown.length) throw new Error(`Unknown app: ${unknown.join(', ')}`);
  try {
    for (const app of APPS.filter((app) => !names.length || names.includes(app.name))) await shootApp(app);
  } finally {
    await browser('close');
  }
  writeFileSync(join(ROOT, 'shots', 'index.json'), `${JSON.stringify(manifestOf(APPS), null, 2)}\n`);
}
