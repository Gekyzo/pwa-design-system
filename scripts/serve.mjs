// Serves this repository for the catalogue page, with `Cache-Control: no-cache` so a normal reload
// always asks for the current file and a CSS edit shows without a hard reload.
// Usage: node scripts/serve.mjs [port]   (default 8090)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
};

// The file under `root` that a request path names, or null when the path leaves `root`.
export const resolve = (root, urlPath) => {
  const path = decodeURIComponent(urlPath.split('?')[0]);
  const file = normalize(join(root, path.endsWith('/') ? `${path}index.html` : path));
  return file === root || file.startsWith(root.endsWith(sep) ? root : root + sep) ? file : null;
};

export const contentType = (file) => TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';

export const server = (root = ROOT) => createServer(async (req, res) => {
  const send = (status, body, type = 'text/plain; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(body);
  };
  try {
    let file = resolve(root, req.url);
    if (!file) return send(403, 'Forbidden');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    send(200, await readFile(file), contentType(file));
  } catch {
    send(404, 'Not found');
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 8090);
  server().listen(port, () => console.log(`http://localhost:${port}/`));
}
