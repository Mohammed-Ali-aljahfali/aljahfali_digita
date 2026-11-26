import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.ico':'image/x-icon', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const pathname = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep) || relative.split(/[\\/]/).some(p => p.startsWith('.') || ['node_modules','supabase','test-results','tests','scratch','docs'].includes(p))) { res.writeHead(404); return res.end('Not found'); }
    if (!(await stat(target)).isFile()) { res.writeHead(404); return res.end('Not found'); }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/subscriptions.html`));
