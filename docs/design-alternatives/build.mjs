#!/usr/bin/env node
// build.mjs — composes the mockups and the report of the design alternatives.
//   node docs/design-alternatives/build.mjs
// Reads design-system.css, ../pwa-shopping-list/styles.css and icons.svg, the themes and src/,
// then writes mockups/<direction>/<screen>.html and index.html (self-contained).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compose, parseScreen } from './src/compose.js';

const here = dirname(fileURLToPath(import.meta.url));
const DS = join(here, '..', '..');
const APP = join(DS, '..', 'pwa-shopping-list');
const REPORT = join(process.env.HOME, '.claude', 'skills', 'report', 'bin', 'report.mjs');
const read = (path) => readFileSync(path, 'utf8');
const files = (dir, ext) => Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => [basename(f, ext), read(join(dir, f))]));

export const DIRECTIONS = {
  current: { name: 'Current (DS 0.6.0)', category: 'baseline', shell: 'base' },
  utility: { name: 'Taller', category: 'visual', shell: 'base', theme: 'theme-utility' },
  editorial: { name: 'Mercado', category: 'visual', shell: 'base', theme: 'theme-editorial' },
  mono: { name: 'Pizarra', category: 'visual', shell: 'base', theme: 'theme-mono' },
  tabs: { name: 'Pestañas', category: 'structural', shell: 'tabs', shellCss: 'tabs' },
  bar: { name: 'Barra única', category: 'structural', shell: 'bar', shellCss: 'bar' },
  cards: { name: 'Tarjetas', category: 'component', shell: 'base', variant: 'cards' },
  tiles: { name: 'Mosaico', category: 'component', shell: 'base', variant: 'tiles' },
};

const SCREENS = ['compra', 'compra-empty', 'add', 'recetas', 'menu', 'ajustes', 'walkthrough'];
const EXTRA = { bar: ['secciones'] };

const screens = Object.fromEntries(Object.entries(files(join(here, 'src', 'screens'), '.html')).map(([name, text]) => [name, parseScreen(text)]));

const sources = {
  directions: DIRECTIONS,
  ds: read(join(DS, 'design-system.css')),
  app: read(join(APP, 'styles.css')),
  sprite: read(join(APP, 'icons.svg')).replace('<svg xmlns="http://www.w3.org/2000/svg">', '<svg xmlns="http://www.w3.org/2000/svg" hidden>'),
  mock: read(join(here, 'src', 'mock.css')),
  themes: files(join(here, 'themes'), '.css'),
  shells: files(join(here, 'src', 'shells'), '.html'),
  shellCss: files(join(here, 'src', 'shells'), '.css'),
  variants: files(join(here, 'src', 'variants'), '.css'),
  screens,
};

// 1. The standalone mockups: light, right hand.
const out = join(here, 'mockups');
rmSync(out, { recursive: true, force: true });
let count = 0;
for (const id of Object.keys(DIRECTIONS)) {
  mkdirSync(join(out, id), { recursive: true });
  for (const screen of [...SCREENS, ...(EXTRA[id] ?? [])]) {
    writeFileSync(join(out, id, `${screen}.html`), compose(sources, id, screen));
    count += 1;
  }
}

// 2. The report: the shell of report.mjs (TOC, engine) around src/report.html, plus the sources
//    and compose.js for the frames.
const skeleton = join(here, '.skeleton.html');
rmSync(skeleton, { force: true });
execFileSync('node', [REPORT, 'new', 'analysis', '--out', skeleton, '--title', 'Design alternatives for the PWA suite', '--description', 'Seven design directions for the six offline PWAs, applied to Bodega.', '--lang', 'en', '--repo', DS], { stdio: 'pipe' });
const shell = read(skeleton);
rmSync(skeleton, { force: true });

// The sources travel as base64: the report check must not read the templates as page content.
const packed = Buffer.from(JSON.stringify(sources), 'utf8').toString('base64');
const composeText = read(join(here, 'src', 'compose.js')).replace(/^export /gm, '');
const frames = `
<script type="text/plain" id="mock-sources">${packed}</script>
<script type="module">
${composeText}
const S = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(document.getElementById('mock-sources').textContent.trim()), (c) => c.charCodeAt(0))));
const SIZES = { phone: [360, 740], fold: [720, 740], tablet: [1024, 680] };
const SCREEN_LIST = ${JSON.stringify(SCREENS)};
const EXTRA = ${JSON.stringify(EXTRA)};
const state = new Map();
const render = (group) => {
  const id = group.dataset.direction;
  const options = state.get(group);
  const [width, height] = SIZES[options.size];
  for (const figure of group.querySelectorAll('.phone')) {
    const frame = figure.querySelector('iframe');
    frame.width = width;
    frame.height = height;
    figure.style.setProperty('--w', width);
    figure.style.setProperty('--h', height);
    frame.srcdoc = compose(S, id, figure.dataset.screen, options);
  }
};
const toggle = (group, key, values, labels) => {
  const box = document.createElement('span');
  box.className = 'frame-toggle';
  values.forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = labels[index];
    button.setAttribute('aria-pressed', String(state.get(group)[key] === value));
    button.addEventListener('click', () => {
      state.get(group)[key] = value;
      for (const sibling of box.children) sibling.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      render(group);
    });
    box.append(button);
  });
  return box;
};
for (const group of document.querySelectorAll('.frames[data-direction]')) {
  const id = group.dataset.direction;
  state.set(group, { theme: 'light', hand: 'right', density: '', size: 'phone' });
  const bar = document.createElement('div');
  bar.className = 'frame-bar';
  bar.append(
    toggle(group, 'theme', ['light', 'dark'], ['Light', 'Dark']),
    toggle(group, 'hand', ['right', 'left'], ['Right hand', 'Left hand']),
    toggle(group, 'density', ['', 'compact'], ['Normal', 'Compact']),
    toggle(group, 'size', ['phone', 'fold', 'tablet'], ['360', '720', '1024']),
  );
  const row = document.createElement('div');
  row.className = 'frame-row';
  for (const screen of [...SCREEN_LIST, ...(EXTRA[id] ?? [])]) {
    const figure = document.createElement('figure');
    figure.className = 'phone';
    figure.dataset.screen = screen;
    const frame = document.createElement('iframe');
    frame.loading = 'lazy';
    frame.title = screen;
    const caption = document.createElement('figcaption');
    const link = document.createElement('a');
    link.href = 'mockups/' + id + '/' + screen + '.html';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = (screenOf(S, id, screen) || { meta: { name: screen } }).meta.name;
    caption.append(link);
    figure.append(frame, caption);
    row.append(figure);
  }
  group.append(bar, row);
  render(group);
}
</script>`;

const main = read(join(here, 'src', 'report.html'));
const page = shell.replace(/<main>[\s\S]*<\/main>/, `<main>\n${main}\n${frames}\n</main>`);
writeFileSync(join(here, 'index.html'), page);
console.log(`${count} mockups, index.html ${(page.length / 1024).toFixed(0)} KB`);
