#!/usr/bin/env node
/* ============================================================
 * Pizzeria Demo — Serveur local (Node pur, zéro dépendance)
 * node server.js   (ou npm start)
 * Hébergements compatibles tels quels : local, Render, Railway, VPS…
 * Pour Vercel (serverless) : voir api/[[...path]].js + README.
 * ------------------------------------------------------------
 * - Sert le site public (/) et le panneau admin (/admin)
 * - Délègue l'API à api/_lib.js (partagée avec la fonction Vercel)
 * - Stockage : fichiers data/ (ou Upstash Redis si variables UPSTASH_*)
 * ============================================================ */
'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const lib = require('./api/_lib');

const ROOT = lib.ROOT;
const UPLOAD_DIR = lib.UPLOAD_DIR;
const PORT = Number(process.env.PORT || 8080);
const HOST = '0.0.0.0';
const store = lib.getStore();

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf'
};

const PAGE_404 = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>404 — Pizza Demo</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>"></head>
<body style="font-family:sans-serif;background:#FFF7E9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="text-align:center;border:3px solid #1E0E0A;border-radius:24px;background:#fff;padding:48px 64px;box-shadow:6px 6px 0 #1E0E0A">
<div style="font-size:64px">🍕</div><h1 style="margin:.2em 0">404 — Mamma mia !</h1>
<p style="color:#777">Cette page n'existe pas.</p><a href="/" style="color:#FF2E4C;font-weight:800">← Retour à la pizzeria</a></div></body></html>`;

/* ---------------- fichiers statiques ---------------- */
async function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin.html';

  let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  let base = ROOT;
  let cache = 'no-cache';

  if (rel.startsWith('uploads/')) { base = UPLOAD_DIR; rel = rel.slice('uploads/'.length); cache = 'public, max-age=31536000, immutable'; }

  const file = path.resolve(base, rel);
  if (!file.startsWith(base + path.sep)) return lib.httpErr(res, 403, 'Accès interdit');

  if (base === ROOT) {
    const first = rel.split('/')[0];
    if (rel.startsWith('.') || rel.includes('/.') || first === 'data' || first === 'node_modules' ||
        first === 'api' || first === 'lib' || rel === 'server.js' || rel === 'package.json' || rel === 'package-lock.json') {
      return lib.httpErr(res, 403, 'Accès interdit');
    }
  }

  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) throw new Error('not a file');
    const data = await fsp.readFile(file);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': cache });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(PAGE_404);
  }
}

/* ---------------- serveur ---------------- */
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname.startsWith('/api/')) return await lib.handleApiRequest(req, res, u.pathname, store);
    if (req.method !== 'GET') return lib.httpErr(res, 405, 'Méthode non autorisée');
    return await serveStatic(req, res, u.pathname);
  } catch (err) {
    console.error('[req]', req.method, req.url, err.message);
    const code = err.code === 413 ? 413 : err.code === 400 ? 400 : err.code === 502 ? 502 : 500;
    if (!res.headersSent) lib.httpErr(res, code, code === 500 && !err.code ? 'Erreur serveur' : err.message);
  }
});

store.ready.then(() => {
  server.listen(PORT, HOST, () => {
    console.log('🍕 Pizzeria Demo prête → http://localhost:' + PORT);
    console.log('   Site public : /   •   Panneau admin : /admin   (mot de passe par défaut : ' + (process.env.ADMIN_PASSWORD || 'demo123') + ')');
    console.log(store.serverless ? '   Stockage : Upstash Redis' : '   Stockage : fichiers data/');
  });
}).catch((e) => { console.error('✖ Impossible de démarrer :', e); process.exit(1); });
