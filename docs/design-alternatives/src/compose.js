// compose.js — builds one mockup document from the sources. Plain functions, no imports: build.mjs
// imports this file, and the report inlines its text and calls `compose` in the browser.

const SECTIONS = {
  active: { name: 'Compra', icon: 'cart' },
  recipes: { name: 'Recetas', icon: 'book' },
  menu: { name: 'Menú', icon: 'menu' },
  settings: { name: 'Ajustes', icon: 'settings' },
};

// A mustache-like fill: a key, a block shown when the key is truthy (#) or falsy (^), and the
// current:/selected: marks of the section. Blocks nest, so the block pass repeats until nothing changes.
const blocks = (text, data) => {
  const next = text
    .replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, body) => (data[key] ? body : ''))
    .replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, body) => (data[key] ? '' : body));
  return next === text ? text : blocks(next, data);
};

const fill = (template, data) =>
  blocks(template, data)
    .replace(/\{\{current:(\w+)\}\}/g, (_, key) => (data.section === key ? 'aria-current="page"' : ''))
    .replace(/\{\{selected:(\w+)\}\}/g, (_, key) => (data.section === key ? 'aria-selected="true"' : 'aria-selected="false"'))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => (data[key] == null ? '' : String(data[key])));

// A screen file starts with a comment that holds its meta as JSON.
export const parseScreen = (text) => {
  const match = text.match(/^\s*<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!match) throw new Error('a screen starts with a JSON comment');
  return { meta: JSON.parse(match[1]), html: text.slice(match[0].length) };
};

// The screen of a direction: `name.direction` when it exists, else `name`.
export const screenOf = (sources, direction, name) => sources.screens[`${name}.${direction}`] ?? sources.screens[name];

export const compose = (sources, directionId, name, options = {}) => {
  const direction = sources.directions[directionId];
  const screen = screenOf(sources, directionId, name);
  if (!screen) throw new Error(`no screen ${name}`);
  const behind = screen.meta.behind ? screenOf(sources, directionId, screen.meta.behind) : null;
  const meta = { ...(behind ? behind.meta : {}), ...screen.meta };
  const section = SECTIONS[meta.section] ?? SECTIONS.active;
  const data = {
    ...meta,
    sectionName: section.name,
    sectionIcon: section.icon,
    content: behind ? behind.html : screen.html,
    extra: behind ? screen.html : '',
  };
  const shell = fill(sources.shells[direction.shell], data);
  const styles = [
    sources.ds,
    sources.app,
    direction.theme ? sources.themes[direction.theme] : '',
    direction.shellCss ? sources.shellCss[direction.shellCss] : '',
    direction.variant ? sources.variants[direction.variant] : '',
    sources.mock,
  ].filter(Boolean);
  const root = [
    `lang="es"`,
    `data-hand="${options.hand ?? 'right'}"`,
    options.theme ? `data-theme="${options.theme}"` : '',
    options.density ? `data-density="${options.density}"` : '',
  ].filter(Boolean).join(' ');
  return `<!doctype html>
<html ${root}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${meta.name} — ${direction.name}</title>
${styles.map((css) => `<style>\n${css}\n</style>`).join('\n')}
</head>
<body>
${sources.sprite}
${shell}
</body>
</html>`;
};
