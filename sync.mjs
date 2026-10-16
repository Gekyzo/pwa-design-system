// Copies the shared files into an app: node ../pwa-design-system/sync.mjs [appDir=cwd]
// It writes vendor/design-system/ with the files and SOURCE.json (version, commit, sha256 of each file).

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILES = ['design-system.css', 'catalog.js', 'rules.js'];

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

export const sync = ({ from, to }) => {
  if (!existsSync(join(to, 'package.json'))) throw new Error(`not an app: ${to} has no package.json`);
  if (git(from, 'status', '--porcelain', '--', ...FILES)) throw new Error('uncommitted changes in pwa-design-system');
  const dir = join(to, 'vendor/design-system');
  mkdirSync(dir, { recursive: true });
  const files = {};
  for (const name of FILES) {
    copyFileSync(join(from, name), join(dir, name));
    files[name] = createHash('sha256').update(readFileSync(join(dir, name))).digest('hex');
  }
  const { version } = JSON.parse(readFileSync(join(from, 'version.json'), 'utf8'));
  const source = { version, commit: git(from, 'rev-parse', 'HEAD'), files };
  writeFileSync(join(dir, 'SOURCE.json'), `${JSON.stringify(source, null, 2)}\n`);
  return source;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const source = sync({ from: fileURLToPath(new URL('.', import.meta.url)), to: process.argv[2] ?? process.cwd() });
    console.log(`design-system ${source.version} (${source.commit.slice(0, 7)})`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
