#!/usr/bin/env node
/* ============================================================
 * Pizzeria Demo — Serveur + API (Node pur, zéro dépendance)
 * ------------------------------------------------------------
 * - Sert le site public (index.html) et le panneau admin (/admin)
 * - GET  /api/content        → contenu live du site (tous appareils)
 * - GET  /api/version        → version du contenu (polling)
 * - PUT  /api/section/<clé>  → sauvegarde d'une section (admin, token)
 * - POST /api/login|logout|password|upload|reset (admin)
 * - POST /api/review|order|reservation (public, écritures visiteurs)
 * - GET  /api/orders | /api/reservations + statuts/suppression (admin)
 * - Stockage : data/content.json (contenu), data/orders.json,
 *   data/reservations.json, data/uploads/ (images importées)
 * ============================================================ */
'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const RESA_FILE = path.join(DATA_DIR, 'reservations.json');

const PORT = Number(process.env.PORT || 8080);
const HOST = '0.0.0.0';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'demo123';
const TOKEN_TTL = 12 * 60 * 60 * 1000;      // 12 h
const MAX_BODY = 12 * 1024 * 1024;          // 12 Mo
const MAX_IMAGE = 5 * 1024 * 1024;          // 5 Mo

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf'
};

/* Sections modifiables via /api/section/<clé> et leur type attendu */
const SECTION_TYPES = {
  settings: 'object', menu: 'array', categories: 'array', zones: 'object',
  gallery: 'array', reviews: 'array', promos: 'object', builder: 'object',
  offers: 'object', wheel: 'array'
};
const PUBLIC_API = new Set(['/api/content', '/api/version', '/api/login', '/api/review', '/api/order', '/api/reservation']);

let content = null;
let orders = [];
let reservations = [];
let auth = null;
const tokens = new Map(); // token -> expiration (ms)
let writeQueue = Promise.resolve();

/* ---------------- utils ---------------- */
const now = () => Date.now();
const uid = (p) => p + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
const hashPw = (pw, salt) => crypto.createHash('sha256').update(salt + '::' + pw).digest('hex');
const str = (v, max = 200, d = '') => (typeof v === 'string' ? v.trim().slice(0, max) : d);
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.end(body);
}
const httpErr = (res, code, msg) => json(res, code, { error: msg });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Corps de requête trop volumineux'), { code: 413 })); req.destroy(); }
      else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJson(req) {
  const buf = await readBody(req);
  try { return JSON.parse(buf.toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('JSON invalide'), { code: 400 }); }
}
function persist(file, data) {
  writeQueue = writeQueue
    .then(() => fsp.writeFile(file, JSON.stringify(data, null, 2), 'utf8'))
    .catch((err) => console.error('[persist]', file, err.message));
  return writeQueue;
}
function bump() {
  content.version = (content.version || 0) + 1;
  content.updatedAt = new Date().toISOString();
  persist(CONTENT_FILE, content);
}
function newToken() {
  const t = crypto.randomBytes(24).toString('hex');
  tokens.set(t, now() + TOKEN_TTL);
  return t;
}
function getToken(req) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  return m ? m[1] : null;
}
function checkAuth(req) {
  const t = getToken(req);
  if (!t) return false;
  const exp = tokens.get(t);
  if (!exp) return false;
  if (exp < now()) { tokens.delete(t); return false; }
  if (exp - now() < 2 * 3600 * 1000) tokens.set(t, now() + TOKEN_TTL); // glissant
  return true;
}
function looksLikeImage(buf) {
  if (buf.length < 12) return false;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;                    // PNG
  if (buf[0] === 0xFF && buf[1] === 0xD8) return true;                    // JPEG
  if (buf[0] === 0x47 && buf[1] === 0x49) return true;                    // GIF
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return true;
  return false;
}

/* ---------------- init ---------------- */
async function init() {
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
  let seed;
  try { seed = JSON.parse(await fsp.readFile(SEED_FILE, 'utf8')); }
  catch (e) { console.error('✖ data/seed.json introuvable ou invalide :', e.message); process.exit(1); }

  try { content = JSON.parse(await fsp.readFile(CONTENT_FILE, 'utf8')); }
  catch { content = JSON.parse(JSON.stringify(seed)); }

  // Complète les sections manquantes avec le seed (compatibilité montée de version)
  for (const k of Object.keys(SECTION_TYPES)) {
    if (content[k] === undefined && seed[k] !== undefined) content[k] = JSON.parse(JSON.stringify(seed[k]));
  }
  if (!content.version) { content.version = 1; content.updatedAt = new Date().toISOString(); persist(CONTENT_FILE, content); }

  try { auth = JSON.parse(await fsp.readFile(AUTH_FILE, 'utf8')); }
  catch {
    const salt = crypto.randomBytes(8).toString('hex');
    auth = { salt, hash: hashPw(DEFAULT_PASSWORD, salt) };
    await fsp.writeFile(AUTH_FILE, JSON.stringify(auth, null, 2), 'utf8');
  }
  try { orders = JSON.parse(await fsp.readFile(ORDERS_FILE, 'utf8')); } catch { orders = []; }
  try { reservations = JSON.parse(await fsp.readFile(RESA_FILE, 'utf8')); } catch { reservations = []; }

  setInterval(() => { const t = now(); for (const [k, exp] of tokens) if (exp < t) tokens.delete(k); }, 3600 * 1000).unref();
}

/* ---------------- API ---------------- */
async function handleApi(req, res, pathname) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    return res.end();
  }

  /* --- endpoints publics --- */
  if (pathname === '/api/content' && req.method === 'GET') return json(res, 200, content);

  if (pathname === '/api/version' && req.method === 'GET')
    return json(res, 200, { version: content.version || 1, updatedAt: content.updatedAt || null });

  if (pathname === '/api/login' && req.method === 'POST') {
    const b = await readJson(req);
    const pw = str(b.password, 200);
    if (pw && hashPw(pw, auth.salt) === auth.hash) return json(res, 200, { ok: true, token: newToken() });
    await new Promise((r) => setTimeout(r, 600)); // anti force-brute basique
    return httpErr(res, 401, 'Mot de passe incorrect');
  }

  if (pathname === '/api/review' && req.method === 'POST') {
    const b = await readJson(req);
    const t = str(b.t, 600);
    if (!t) return httpErr(res, 400, 'Avis vide');
    const rev = {
      n: str(b.n, 60) || 'Anonyme',
      z: str(b.z, 60) || 'Tripoli',
      s: Math.min(5, Math.max(1, Math.round(num(b.s, 5)))),
      t,
      img: 'https://i.pravatar.cc/100?u=' + now(),
      d: 'À l\u2019instant'
    };
    content.reviews = [rev, ...(Array.isArray(content.reviews) ? content.reviews : [])].slice(0, 60);
    bump();
    return json(res, 201, { ok: true, review: rev });
  }

  if (pathname === '/api/order' && req.method === 'POST') {
    const b = await readJson(req);
    const order = {
      id: uid('PD'), at: new Date().toISOString(), status: 'nouvelle',
      name: str(b.name, 80), phone: str(b.phone, 30), zone: str(b.zone, 60),
      addr: str(b.addr, 200), note: str(b.note, 300), pay: str(b.pay, 20),
      items: Array.isArray(b.items) ? b.items.slice(0, 50).map((it) => ({
        name: str(it && it.name, 80), qty: Math.max(1, Math.round(num(it && it.qty, 1))), price: num(it && it.price)
      })) : [],
      subtotal: num(b.subtotal), delivery: num(b.delivery), discount: num(b.discount), total: num(b.total)
    };
    orders.unshift(order); orders = orders.slice(0, 300);
    persist(ORDERS_FILE, orders);
    return json(res, 201, { ok: true, id: order.id });
  }

  if (pathname === '/api/reservation' && req.method === 'POST') {
    const b = await readJson(req);
    const resa = {
      id: uid('TBL'), at: new Date().toISOString(), status: 'nouvelle',
      name: str(b.name, 80), phone: str(b.phone, 30), date: str(b.date, 20),
      time: str(b.time, 20), guests: str(b.guests, 40), zone: str(b.zone, 60),
      table: str(b.table, 20), note: str(b.note, 300)
    };
    reservations.unshift(resa); reservations = reservations.slice(0, 300);
    persist(RESA_FILE, resa);
    return json(res, 201, { ok: true, id: resa.id });
  }

  /* --- endpoints protégés (admin) --- */
  if (!PUBLIC_API.has(pathname) && !checkAuth(req)) return httpErr(res, 401, 'Non autorisé — reconnecte-toi');

  if (pathname === '/api/logout' && req.method === 'POST') {
    const t = getToken(req); if (t) tokens.delete(t);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/password' && req.method === 'POST') {
    const b = await readJson(req);
    const cur = str(b.current, 200), nxt = str(b.next, 200);
    if (hashPw(cur, auth.salt) !== auth.hash) return httpErr(res, 401, 'Mot de passe actuel incorrect');
    if (nxt.length < 4) return httpErr(res, 400, 'Le nouveau mot de passe doit faire au moins 4 caractères');
    auth.hash = hashPw(nxt, auth.salt);
    await persist(AUTH_FILE, auth);
    return json(res, 200, { ok: true });
  }

  const secMatch = req.method === 'PUT' ? /^\/api\/section\/([a-z]+)$/.exec(pathname) : null;
  if (secMatch) {
    const key = secMatch[1];
    if (!(key in SECTION_TYPES)) return httpErr(res, 400, 'Section inconnue : ' + key);
    const value = await readJson(req);
    const expected = SECTION_TYPES[key];
    const isObj = typeof value === 'object' && value !== null && !Array.isArray(value);
    if (expected === 'array' && !Array.isArray(value)) return httpErr(res, 400, 'Section "' + key + '" : tableau attendu');
    if (expected === 'object' && !isObj) return httpErr(res, 400, 'Section "' + key + '" : objet attendu');
    if (JSON.stringify(value).length > 4 * 1024 * 1024) return httpErr(res, 413, 'Section trop volumineuse');
    content[key] = value;
    bump();
    return json(res, 200, { ok: true, version: content.version });
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    const b = await readJson(req);
    const name = str(b.name, 160) || 'image.png';
    const mExt = /\.(png|jpe?g|webp|gif)$/i.exec(name);
    if (!mExt) return httpErr(res, 400, 'Format non supporté (png, jpg, webp, gif)');
    const raw = typeof b.data === 'string' ? b.data : '';
    if (!raw) return httpErr(res, 400, 'Image manquante');
    if (raw.length > 8 * 1024 * 1024) return httpErr(res, 413, 'Image trop volumineuse (max 5 Mo)');
    const buf = Buffer.from(raw, 'base64');
    if (!buf.length || buf.length > MAX_IMAGE) return httpErr(res, 413, 'Image trop volumineuse (max 5 Mo)');
    if (!looksLikeImage(buf)) return httpErr(res, 400, 'Ce fichier ne semble pas être une image');
    const fname = 'img-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + '.' + mExt[1].toLowerCase();
    await fsp.writeFile(path.join(UPLOAD_DIR, fname), buf);
    return json(res, 201, { ok: true, url: '/uploads/' + fname });
  }

  if (pathname === '/api/reset' && req.method === 'POST') {
    const seed = JSON.parse(await fsp.readFile(SEED_FILE, 'utf8'));
    content = seed;
    content.version = (seed.version || 0) + 1;
    content.updatedAt = new Date().toISOString();
    persist(CONTENT_FILE, content);
    return json(res, 200, { ok: true, version: content.version });
  }

  if (pathname === '/api/orders' && req.method === 'GET') return json(res, 200, orders);

  if (pathname === '/api/order-status' && req.method === 'POST') {
    const b = await readJson(req);
    const o = orders.find((x) => x.id === str(b.id, 40));
    if (!o) return httpErr(res, 404, 'Commande introuvable');
    o.status = str(b.status, 30) || 'nouvelle';
    persist(ORDERS_FILE, orders);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/order-delete' && req.method === 'POST') {
    const b = await readJson(req);
    orders = orders.filter((x) => x.id !== str(b.id, 40));
    persist(ORDERS_FILE, orders);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/reservations' && req.method === 'GET') return json(res, 200, reservations);

  if (pathname === '/api/reservation-status' && req.method === 'POST') {
    const b = await readJson(req);
    const r = reservations.find((x) => x.id === str(b.id, 40));
    if (!r) return httpErr(res, 404, 'Réservation introuvable');
    r.status = str(b.status, 30) || 'nouvelle';
    persist(RESA_FILE, reservations);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/reservation-delete' && req.method === 'POST') {
    const b = await readJson(req);
    reservations = reservations.filter((x) => x.id !== str(b.id, 40));
    persist(RESA_FILE, reservations);
    return json(res, 200, { ok: true });
  }

  return httpErr(res, 404, 'Route API inconnue');
}

/* ---------------- fichiers statiques ---------------- */
const PAGE_404 = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>404 — Pizza Demo</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>"></head>
<body style="font-family:sans-serif;background:#FFF7E9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="text-align:center;border:3px solid #1E0E0A;border-radius:24px;background:#fff;padding:48px 64px;box-shadow:6px 6px 0 #1E0E0A">
<div style="font-size:64px">🍕</div><h1 style="margin:.2em 0">404 — Mamma mia !</h1>
<p style="color:#777">Cette page n'existe pas.</p><a href="/" style="color:#FF2E4C;font-weight:800">← Retour à la pizzeria</a></div></body></html>`;

async function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin.html';

  let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  let base = ROOT;
  let cache = 'no-cache';

  if (rel.startsWith('uploads/')) { base = UPLOAD_DIR; rel = rel.slice('uploads/'.length); cache = 'public, max-age=31536000, immutable'; }

  const file = path.resolve(base, rel);
  if (!file.startsWith(base + path.sep)) return httpErr(res, 403, 'Accès interdit');

  if (base === ROOT) {
    const first = rel.split('/')[0];
    if (rel.startsWith('.') || rel.includes('/.') || first === 'data' || first === 'node_modules' ||
        rel === 'server.js' || rel === 'package.json' || rel === 'package-lock.json') {
      return httpErr(res, 403, 'Accès interdit');
    }
  }

  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) throw new Error('not a file');
    const data = await fsp.readFile(file);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': cache });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(PAGE_404);
  }
}

/* ---------------- serveur ---------------- */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET') return httpErr(res, 405, 'Méthode non autorisée');
    return await serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[req]', req.method, req.url, err.message);
    const code = err.code === 413 ? 413 : err.code === 400 ? 400 : 500;
    if (!res.headersSent) httpErr(res, code, code === 500 ? 'Erreur serveur' : err.message);
  }
});

init().then(() => {
  server.listen(PORT, HOST, () => {
    console.log('🍕 Pizzeria Demo prête → http://localhost:' + PORT);
    console.log('   Site public : /   •   Panneau admin : /admin   (mot de passe par défaut : ' + DEFAULT_PASSWORD + ')');
  });
}).catch((e) => { console.error('✖ Impossible de démarrer :', e); process.exit(1); });
