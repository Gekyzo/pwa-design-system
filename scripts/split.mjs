// Gives the part of an app's styles.css that the design system does not already hold.
// Usage: node scripts/split.mjs <app styles.css> [design-system.css]

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONTAINERS = ['@layer', '@media', '@supports', '@container', '@starting-style'];
const squish = (text) => text.replace(/\s+/g, ' ').trim();

// `css` with each comment blanked out (indexes stay), and the comments with their range.
const scan = (css) => {
  const comments = [];
  const code = css.replace(/\/\*[\s\S]*?\*\//g, (text, start) => {
    comments.push({ text, start, end: start + text.length });
    return text.replace(/[^\n]/g, ' ');
  });
  return { code, comments };
};

const closing = (code, open) => {
  let depth = 0;
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === '{') depth += 1;
    if (code[i] === '}' && --depth === 0) return i;
  }
  return code.length - 1;
};

const declarationsOf = (code, from, to) => {
  const declarations = [];
  let at = from;
  for (const part of code.slice(from, to).split(';')) {
    const colon = part.indexOf(':');
    if (colon !== -1 && part.trim()) {
      declarations.push({
        property: part.slice(0, colon).trim(),
        value: squish(part.slice(colon + 1)),
        start: at + part.length - part.trimStart().length,
        end: at + part.length + 1,
      });
    }
    at += part.length + 1;
  }
  return declarations;
};

// The tree of nodes: a container (children), a rule (declarations) or a keyframes block (atomic).
const nodesOf = (code, from, to, path) => {
  const nodes = [];
  let i = from;
  while (i < to) {
    const open = code.indexOf('{', i);
    const semi = code.indexOf(';', i);
    if (open === -1 || open >= to) break;
    if (semi !== -1 && semi < open) {
      i = semi + 1;
      continue;
    }
    const close = closing(code, open);
    const prelude = squish(code.slice(i, open));
    const start = i + code.slice(i, open).search(/\S/);
    const node = { prelude, start, end: close + 1, path };
    const head = prelude.split(/[\s(]/)[0];
    if (CONTAINERS.includes(head)) {
      node.kind = 'container';
      node.children = nodesOf(code, open + 1, close, [...path, prelude]);
    } else if (head === '@keyframes') {
      node.kind = 'atomic';
      node.key = `${path.join('>')}|${prelude}|${squish(code.slice(open + 1, close))}`;
    } else {
      node.kind = 'rule';
      node.declarations = declarationsOf(code, open + 1, close);
      node.key = `${path.join('>')}|${prelude}|${node.declarations.map((d) => `${d.property}:${d.value}`).join(';')}`;
    }
    nodes.push(node);
    i = close + 1;
  }
  return nodes;
};

const leavesOf = (nodes) => nodes.flatMap((node) => (node.kind === 'container' ? leavesOf(node.children) : [node]));

const parse = (css) => {
  const { code, comments } = scan(css);
  const nodes = nodesOf(code, 0, code.length, []);
  const blocks = comments
    .filter(({ text }) => /^\/\*\s*@component\b/.test(text))
    .map((comment) => ({ ...comment, name: comment.text.match(/@component\s+(\S+)/)[1] }));
  return { css, code, comments, nodes, blocks, leaves: leavesOf(nodes) };
};

// The leaves from each @component block to the next block or the end of its top-level node.
const componentsOf = ({ nodes, blocks, leaves }) =>
  blocks.map((block, index) => {
    const top = nodes.find((node) => node.start < block.start && block.start < node.end);
    const stop = Math.min(blocks[index + 1]?.start ?? Infinity, top?.end ?? Infinity);
    return { ...block, leaves: leaves.filter((leaf) => leaf.start > block.end && leaf.start < stop) };
  });

// The @part, @variant and @state entries of a block comment, each with its continuation lines.
const entriesOf = (text) => {
  const entries = [];
  for (const raw of text.slice(2, -2).split('\n')) {
    const row = raw.trim().replace(/^\*\s?/, '');
    if (/^@\w+/.test(row)) entries.push([row]);
    else if (row && entries.length) entries.at(-1).push(row);
  }
  return entries.filter(([first]) => /^@(part|variant|state)\s/.test(first));
};
const entryKey = ([first]) => first.split(/\s+/).slice(0, 2).join(' ');

const isToken = (leaf) => leaf.path[0] === '@layer tokens';
const declarationKey = (leaf, declaration) => `${leaf.path.join('>')}|${leaf.prelude}|${declaration.property}`;

export const appPart = (appCss, sharedCss) => {
  const app = parse(appCss);
  const shared = parse(sharedCss);
  const sharedKeys = new Set(shared.leaves.filter((leaf) => !isToken(leaf)).map((leaf) => leaf.key));
  const sharedTokens = new Map(
    shared.leaves.filter(isToken).flatMap((leaf) => (leaf.declarations ?? []).map((d) => [declarationKey(leaf, d), d.value])),
  );
  const sharedComponents = new Map(componentsOf(shared).map((part) => [part.name, part]));

  const edits = [];
  const gone = new Set();
  const kept = new Set();
  const cut = (start, end) => edits.push({ start, end, text: '' });

  for (const part of componentsOf(app)) {
    const model = sharedComponents.get(part.name);
    if (!model) continue;
    const pool = [...part.leaves];
    const matched = model.leaves.map((leaf) => {
      const at = pool.findIndex((candidate) => candidate.key === leaf.key);
      return at === -1 ? null : pool.splice(at, 1)[0];
    });
    // In base, the rules after a block may be the app's own (a media rule on body), so extras are allowed.
    const extras = pool.length > 0 && part.leaves[0]?.path[0] !== '@layer base';
    if (matched.includes(null) || extras) {
      // A rule identical to a shared one goes as outside an override; a differing rule stays whole.
      part.leaves.filter((leaf) => !sharedKeys.has(leaf.key)).forEach((leaf) => kept.add(leaf));
      part.leaves.filter((leaf) => sharedKeys.has(leaf.key)).forEach((leaf) => gone.add(leaf));
      const indent = appCss.slice(appCss.lastIndexOf('\n', part.start) + 1, part.start);
      const held = new Set(entriesOf(model.text).map(entryKey));
      const added = entriesOf(part.text).filter((entry) => !held.has(entryKey(entry)));
      const lines = [`/* @extends ${part.name}`, ...added.flat().map((row) => `${indent}   ${row}`)];
      edits.push({ start: part.start, end: part.end, text: added.length ? `${lines.join('\n')} */` : `${lines[0]} */`, indent });
    } else {
      matched.forEach((leaf) => gone.add(leaf));
      cut(part.start, part.end);
    }
  }

  const removable = (leaf) => {
    if (kept.has(leaf)) return false;
    if (gone.has(leaf)) return true;
    if (isToken(leaf)) return leaf.declarations.length > 0 && leaf.declarations.every((d) => sharedTokens.get(declarationKey(leaf, d)) === d.value);
    return sharedKeys.has(leaf.key);
  };

  const lineStart = (at) => appCss.lastIndexOf('\n', at - 1) + 1;
  const lineEnd = (at) => {
    const next = appCss.indexOf('\n', at);
    return next === -1 ? appCss.length : next + 1;
  };

  // A comment alone on its line or lines, right above `start`, leads that node.
  const leadingStart = (start) => {
    const before = appCss.slice(0, lineStart(start));
    const comment = app.comments.find((c) => c.end === before.trimEnd().length && !app.blocks.some((block) => block.start === c.start));
    if (!comment) return start;
    const alone = appCss.slice(lineStart(comment.start), comment.start).trim() === '';
    const lines = (before.slice(comment.end).match(/\n/g) ?? []).length;
    return alone && lines <= 1 ? comment.start : start;
  };

  // True when `node` is wholly removed. The shared token declarations of a kept token rule go alone.
  const settle = (node) => {
    if (node.kind !== 'container') {
      if (removable(node)) return true;
      if (isToken(node) && node.kind === 'rule' && !kept.has(node)) {
        node.declarations.filter((d) => sharedTokens.get(declarationKey(node, d)) === d.value).forEach((d) => cut(leadingStart(d.start), d.end));
      }
      return false;
    }
    return node.children.map(settle).every(Boolean);
  };

  // A container is removed whole when all its children go; otherwise each child that goes is cut.
  const sweep = (node) => {
    if (settle(node)) {
      cut(leadingStart(node.start), node.end);
    } else if (node.kind === 'container') {
      node.children.forEach(sweep);
    }
  };
  app.nodes.forEach(sweep);

  return finish(appCss, edits, lineStart, lineEnd);
};

const where = (leaf) => {
  const [layer, ...contexts] = leaf.path;
  return [layer?.replace('@layer ', '') ?? '', ...contexts].join(' ');
};

// One line for each shared rule that the app does not define, and for each shared declaration
// that no app rule with the same layer, context and selector sets.
export const leaksOf = (appCss, sharedCss) => {
  const app = parse(appCss);
  const shared = parse(sharedCss);
  const keyOf = (leaf) => `${leaf.path.join('>')}|${leaf.prelude}`;
  const set = new Map();
  for (const leaf of app.leaves) {
    const properties = set.get(keyOf(leaf)) ?? new Set();
    (leaf.declarations ?? []).forEach((d) => properties.add(d.property));
    set.set(keyOf(leaf), properties);
  }
  return shared.leaves.flatMap((leaf) => {
    const properties = set.get(keyOf(leaf));
    const name = `${where(leaf)} ${leaf.prelude}`;
    if (!properties) return [name];
    return [...new Set((leaf.declarations ?? []).map((d) => d.property))]
      .filter((property) => !properties.has(property))
      .map((property) => `${name}: ${property}`);
  });
};

const finish = (css, edits, lineStart, lineEnd) => {
  const spans = edits
    .map((edit) => (edit.text === '' ? { ...edit, start: lineStart(edit.start), end: lineEnd(edit.end) } : edit))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [];
  for (const span of spans) {
    const last = merged.at(-1);
    if (last && span.start < last.end && last.text === '' && span.text === '') last.end = Math.max(last.end, span.end);
    else if (!last || span.start >= last.end) merged.push({ ...span });
  }
  let out = css;
  for (const { start, end, text } of merged.reverse()) out = out.slice(0, start) + text + out.slice(end);
  return out
    .replace(/\{\n\s*\n+/g, '{\n')
    .replace(/\n\s*\n+(\s*)\}/g, '\n$1}')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const leaks = args[0] === '--leaks';
  const [appPath, sharedPath = fileURLToPath(new URL('../design-system.css', import.meta.url))] = leaks ? args.slice(1) : args;
  if (!appPath) {
    console.error('Usage: node scripts/split.mjs [--leaks] <app styles.css> [design-system.css]');
    process.exit(1);
  }
  const app = readFileSync(appPath, 'utf8');
  const shared = readFileSync(sharedPath, 'utf8');
  if (leaks) leaksOf(app, shared).forEach((line) => console.log(line));
  else process.stdout.write(appPart(app, shared));
}
