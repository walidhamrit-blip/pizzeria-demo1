'use strict';
/* ============================================================
 * Pizzeria Demo — backend partagé
 * Utilisé par :
 *   - server.js            (hébergement Node classique : local, Render, Railway, VPS…)
 *   - api/[[...path]].js   (fonction serverless Vercel)
 * Stockage : fichiers (data/) OU Upstash Redis (variables UPSTASH_*),
 * choisi automatiquement selon l'environnement.
 * ============================================================ */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const RESA_FILE = path.join(DATA_DIR, 'reservations.json');

const TOKEN_TTL = 12 * 60 * 60 * 1000;   // 12 h
const MAX_BODY = 8 * 1024 * 1024;        // 8 Mo
const MAX_IMAGE_FILE = 5 * 1024 * 1024;  // 5 Mo (stockage fichiers)
const MAX_IMAGE_REDIS = 900 * 1024;      // ~900 Ko (stockage Redis, mode serveless)

const SECTION_TYPES = {
  settings: 'object', menu: 'array', categories: 'array', zones: 'object',
  gallery: 'array', reviews: 'array', promos: 'object', builder: 'object',
  offers: 'object', wheel: 'array'
};
const PUBLIC_API = new Set(['/api/content', '/api/version', '/api/login', '/api/review', '/api/order', '/api/reservation']);
const IMG_NAME_RE = /^img-[a-z0-9-]+\.(png|jpe?g|webp|gif)$/i;

/* ---------------- helpers ---------------- */
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

function badJson() { const e = new Error('JSON invalide'); e.code = 400; return e; }

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
/* Accepte un body déjà parsé par l'hébergeur (Vercel) ou lit le flux brut */
async function readJsonBody(req) {
  const b = req.body;
  if (b !== undefined && b !== null && !Buffer.isBuffer(b) && !ArrayBuffer.isView(b)) {
    if (typeof b === 'string') { try { return JSON.parse(b || '{}'); } catch (e) { throw badJson(); } }
    if (typeof b === 'object') return b;
  }
  const buf = await readBody(req);
  try { return JSON.parse(buf.toString('utf8') || '{}'); } catch (e) { throw badJson(); }
}

function looksLikeImage(buf) {
  if (buf.length < 12) return false;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;                    // PNG
  if (buf[0] === 0xFF && buf[1] === 0xD8) return true;                    // JPEG
  if (buf[0] === 0x47 && buf[1] === 0x49) return true;                    // GIF
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return true;
  return false;
}

/* ---- tokens stateless (HMAC) : fonctionnent en serverless sans état partagé ---- */
function tokenSecret() { return String(process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'pizzeria-demo-local-secret'); }
function hmacSig(s) { return crypto.createHmac('sha256', tokenSecret()).update(s).digest('hex'); }
function issueToken() { const payload = String(now() + TOKEN_TTL); return payload + '.' + hmacSig(payload); }
function verifyTokenAuth(req) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!m) return false;
  const parts = m[1].split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!/^\d{1,15}$/.test(payload)) return false;
  const exp = Number(payload);
  if (exp < now()) return false;
  const expected = hmacSig(payload);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/* Contenu d'origine : embarqué dans api/seed-data.js (généré depuis data/seed.json)
 * pour fonctionner en serverless, où les fichiers hors api/ ne sont pas déployés
 * avec la fonction Vercel. En local, data/seed.json reste utilisé s'il est présent. */
let _seedCache = null;
function readSeed() {
  if (_seedCache) return _seedCache;
  try { _seedCache = require('./seed-data'); }
  catch (e) {
    try { _seedCache = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8')); }
    catch (e2) { throw Object.assign(new Error("Contenu d'origine introuvable (seed manquant)"), { code: 500 }); }
  }
  return _seedCache;
}
function cloneSeed() { return JSON.parse(JSON.stringify(readSeed())); }
function bumpContent(c) { c.version = (c.version || 0) + 1; c.updatedAt = new Date().toISOString(); return c; }

/* ============================================================
 * Stockage fichiers (local / Render / Railway / VPS)
 * ============================================================ */
class FileStore {
  constructor() {
    this.serverless = false;
    this._queue = Promise.resolve();
    this.ready = this._init();
  }
  async _init() {
    await fsp.mkdir(UPLOAD_DIR, { recursive: true });
    try { this.content = JSON.parse(await fsp.readFile(CONTENT_FILE, 'utf8')); }
    catch (e) { this.content = cloneSeed(); }
    const seed = readSeed();
    for (const k of Object.keys(SECTION_TYPES)) {
      if (this.content[k] === undefined && seed[k] !== undefined) this.content[k] = JSON.parse(JSON.stringify(seed[k]));
    }
    if (!this.content.version) { this.content.version = 1; this.content.updatedAt = new Date().toISOString(); this._write(CONTENT_FILE, this.content); }
    try { this.auth = JSON.parse(await fsp.readFile(AUTH_FILE, 'utf8')); }
    catch (e) {
      const salt = crypto.randomBytes(8).toString('hex');
      this.auth = { salt, hash: hashPw(process.env.ADMIN_PASSWORD || 'demo123', salt) };
      this._write(AUTH_FILE, this.auth);
    }
    try { this.orders = JSON.parse(await fsp.readFile(ORDERS_FILE, 'utf8')); } catch (e) { this.orders = []; }
    try { this.reservations = JSON.parse(await fsp.readFile(RESA_FILE, 'utf8')); } catch (e) { this.reservations = []; }
  }
  _write(file, data) {
    this._queue = this._queue
      .then(() => fsp.writeFile(file, JSON.stringify(data, null, 2), 'utf8'))
      .catch((e) => console.error('[persist]', file, e.message));
    return this._queue;
  }
  async getContent() { await this.ready; return this.content; }
  async saveContent(c) { this.content = c; this._write(CONTENT_FILE, c); }
  async listOrders() { await this.ready; return this.orders; }
  async saveOrders(o) { this.orders = o; this._write(ORDERS_FILE, o); }
  async listReservations() { await this.ready; return this.reservations; }
  async saveReservations(r) { this.reservations = r; this._write(RESA_FILE, r); }
  async getAuth() { await this.ready; return this.auth; }
  async saveAuth(a) { this.auth = a; this._write(AUTH_FILE, a); }
  async saveImage(name, buf) { await fsp.mkdir(UPLOAD_DIR, { recursive: true }); await fsp.writeFile(path.join(UPLOAD_DIR, name), buf); return '/uploads/' + name; }
  async getImage(name) { try { return await fsp.readFile(path.join(UPLOAD_DIR, name)); } catch (e) { return null; } }
}

/* ============================================================
 * Stockage Upstash Redis (Vercel / serverless)
 * API REST : POST [ "SET", clé, valeur ] → { result: ... }
 * ============================================================ */
class UpstashStore {
  constructor(url, token) {
    this.serverless = true;
    this.ready = Promise.resolve();
    this.url = String(url).replace(/\/+$/, '');
    this.token = String(token);
    if (!/^https?:\/\/[a-z0-9.-]+/i.test(this.url)) {
      throw Object.assign(new Error('UPSTASH_REDIS_REST_URL invalide (« ' + this.url.slice(0, 60) + ' ») — utilise la valeur qui commence par https:// dans l\'onglet REST de la console Upstash'), { code: 500 });
    }
    if (!this.token) throw Object.assign(new Error('UPSTASH_REDIS_REST_TOKEN est vide'), { code: 500 });
  }
  async _cmd(command, ...args) {
    let r;
    try {
      r = await fetch(this.url, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify([command, ...args])
      });
    } catch (e) {
      const err = new Error('Impossible de joindre Upstash — vérifie la variable UPSTASH_REDIS_REST_URL (elle doit ressembler à https://xxxx.upstash.io)');
      err.code = 502; throw err;
    }
    if (!r.ok) {
      const hint = r.status === 401 || r.status === 403 ? ' — vérifie la variable UPSTASH_REDIS_REST_TOKEN' : '';
      const e = new Error('Erreur stockage Upstash (' + r.status + ')' + hint); e.code = 502; throw e;
    }
    const j = await r.json();
    return j.result;
  }
  async getContent() {
    const s = await this._cmd('GET', 'pd:content');
    if (s) { try { return JSON.parse(s); } catch (e) {} }
    const c = cloneSeed();
    c.version = c.version || 1; c.updatedAt = new Date().toISOString();
    await this._cmd('SET', 'pd:content', JSON.stringify(c));
    return c;
  }
  async saveContent(c) { await this._cmd('SET', 'pd:content', JSON.stringify(c)); }
  async listOrders() { const s = await this._cmd('GET', 'pd:orders'); try { return JSON.parse(s || '[]'); } catch (e) { return []; } }
  async saveOrders(o) { await this._cmd('SET', 'pd:orders', JSON.stringify(o)); }
  async listReservations() { const s = await this._cmd('GET', 'pd:reservations'); try { return JSON.parse(s || '[]'); } catch (e) { return []; } }
  async saveReservations(r) { await this._cmd('SET', 'pd:reservations', JSON.stringify(r)); }
  async getAuth() {
    const s = await this._cmd('GET', 'pd:auth');
    if (s) { try { return JSON.parse(s); } catch (e) {} }
    const salt = crypto.randomBytes(8).toString('hex');
    const a = { salt, hash: hashPw(process.env.ADMIN_PASSWORD || 'demo123', salt) };
    await this.saveAuth(a);
    return a;
  }
  async saveAuth(a) { await this._cmd('SET', 'pd:auth', JSON.stringify(a)); }
  async saveImage(name, buf) { await this._cmd('SET', 'pd:img:' + name, buf.toString('base64')); return '/api/uploads/' + name; }
  async getImage(name) { const b64 = await this._cmd('GET', 'pd:img:' + name); return b64 ? Buffer.from(b64, 'base64') : null; }
}

let _store = null;
function getStore() {
  if (_store) return _store;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    _store = new UpstashStore(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN);
  } else if (process.env.VERCEL) {
    const e = new Error('Stockage non configuré : ajoute les variables UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN (voir README — Déploiement Vercel)');
    e.code = 500;
    throw e;
  } else {
    _store = new FileStore();
  }
  return _store;
}

/* ============================================================
 * API (commune au serveur local et à la fonction Vercel)
 * ============================================================ */
async function handleApiRequest(req, res, pathname, store) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    return res.end();
  }

  /* ---------- endpoints publics ---------- */
  if (pathname === '/api/content' && req.method === 'GET') return json(res, 200, await store.getContent());

  if (pathname === '/api/version' && req.method === 'GET') {
    const c = await store.getContent();
    return json(res, 200, { version: c.version || 1, updatedAt: c.updatedAt || null });
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const pw = str(b.password, 200);
    const auth = await store.getAuth();
    if (pw && hashPw(pw, auth.salt) === auth.hash) return json(res, 200, { ok: true, token: issueToken() });
    await new Promise((r) => setTimeout(r, 600)); // anti force-brute basique
    return httpErr(res, 401, 'Mot de passe incorrect');
  }

  if (pathname === '/api/review' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const t = str(b.t, 600);
    if (!t) return httpErr(res, 400, 'Avis vide');
    const rev = {
      n: str(b.n, 60) || 'Anonyme', z: str(b.z, 60) || 'Tripoli',
      s: Math.min(5, Math.max(1, Math.round(num(b.s, 5)))), t,
      img: 'https://i.pravatar.cc/100?u=' + now(), d: 'À l\u2019instant'
    };
    const c = await store.getContent();
    c.reviews = [rev, ...(Array.isArray(c.reviews) ? c.reviews : [])].slice(0, 60);
    bumpContent(c); await store.saveContent(c);
    return json(res, 201, { ok: true, review: rev });
  }

  if (pathname === '/api/order' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const order = {
      id: uid('PD'), at: new Date().toISOString(), status: 'nouvelle',
      name: str(b.name, 80), phone: str(b.phone, 30), zone: str(b.zone, 60),
      addr: str(b.addr, 200), note: str(b.note, 300), pay: str(b.pay, 20),
      items: Array.isArray(b.items) ? b.items.slice(0, 50).map((it) => ({
        name: str(it && it.name, 80), qty: Math.max(1, Math.round(num(it && it.qty, 1))), price: num(it && it.price)
      })) : [],
      subtotal: num(b.subtotal), delivery: num(b.delivery), discount: num(b.discount), total: num(b.total)
    };
    const list = await store.listOrders();
    list.unshift(order);
    await store.saveOrders(list.slice(0, 300));
    return json(res, 201, { ok: true, id: order.id });
  }

  if (pathname === '/api/reservation' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const resa = {
      id: uid('TBL'), at: new Date().toISOString(), status: 'nouvelle',
      name: str(b.name, 80), phone: str(b.phone, 30), date: str(b.date, 20),
      time: str(b.time, 20), guests: str(b.guests, 40), zone: str(b.zone, 60),
      table: str(b.table, 20), note: str(b.note, 300)
    };
    const list = await store.listReservations();
    list.unshift(resa);
    await store.saveReservations(list.slice(0, 300));
    return json(res, 201, { ok: true, id: resa.id });
  }

  /* ---------- images importées (lecture publique, cache immuable) ---------- */
  if (req.method === 'GET' && pathname.startsWith('/api/uploads/')) {
    const name = decodeURIComponent(pathname.slice('/api/uploads/'.length));
    if (!IMG_NAME_RE.test(name)) return httpErr(res, 404, 'Image introuvable');
    const buf = await store.getImage(name);
    if (!buf) return httpErr(res, 404, 'Image introuvable');
    const ext = path.extname(name).toLowerCase().slice(1);
    const type = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type, 'Content-Length': buf.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(buf);
  }

  /* ---------- endpoints protégés (admin) ---------- */
  if (!PUBLIC_API.has(pathname) && !pathname.startsWith('/api/uploads/') && !verifyTokenAuth(req))
    return httpErr(res, 401, 'Non autorisé — reconnecte-toi');

  if (pathname === '/api/logout' && req.method === 'POST') {
    /* tokens stateless : la déconnexion se fait côté client */
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/password' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const cur = str(b.current, 200), nxt = str(b.next, 200);
    const auth = await store.getAuth();
    if (hashPw(cur, auth.salt) !== auth.hash) return httpErr(res, 401, 'Mot de passe actuel incorrect');
    if (nxt.length < 4) return httpErr(res, 400, 'Le nouveau mot de passe doit faire au moins 4 caractères');
    await store.saveAuth({ salt: auth.salt, hash: hashPw(nxt, auth.salt) });
    return json(res, 200, { ok: true });
  }

  const secMatch = req.method === 'PUT' ? /^\/api\/section\/([a-z]+)$/.exec(pathname) : null;
  if (secMatch) {
    const key = secMatch[1];
    if (!(key in SECTION_TYPES)) return httpErr(res, 400, 'Section inconnue : ' + key);
    const value = await readJsonBody(req);
    const expected = SECTION_TYPES[key];
    const isObj = typeof value === 'object' && value !== null && !Array.isArray(value);
    if (expected === 'array' && !Array.isArray(value)) return httpErr(res, 400, 'Section "' + key + '" : tableau attendu');
    if (expected === 'object' && !isObj) return httpErr(res, 400, 'Section "' + key + '" : objet attendu');
    if (JSON.stringify(value).length > 4 * 1024 * 1024) return httpErr(res, 413, 'Section trop volumineuse');
    const c = await store.getContent();
    c[key] = value;
    bumpContent(c); await store.saveContent(c);
    return json(res, 200, { ok: true, version: c.version });
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const name = str(b.name, 160) || 'image.png';
    const mExt = /\.(png|jpe?g|webp|gif)$/i.exec(name);
    if (!mExt) return httpErr(res, 400, 'Format non supporté (png, jpg, webp, gif)');
    const raw = typeof b.data === 'string' ? b.data : '';
    if (!raw) return httpErr(res, 400, 'Image manquante');
    if (raw.length > 8 * 1024 * 1024) return httpErr(res, 413, 'Image trop volumineuse');
    const buf = Buffer.from(raw, 'base64');
    const cap = store.serverless ? MAX_IMAGE_REDIS : MAX_IMAGE_FILE;
    if (!buf.length || buf.length > cap) {
      return httpErr(res, 413, store.serverless
        ? 'Image trop lourde pour le stockage serveless (max ~900 Ko). Elle est normalement redimensionnée automatiquement — réessaie, ou colle une URL d\u2019image.'
        : 'Image trop volumineuse (max 5 Mo)');
    }
    if (!looksLikeImage(buf)) return httpErr(res, 400, 'Ce fichier ne semble pas être une image');
    const fname = 'img-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + '.' + mExt[1].toLowerCase();
    const url = await store.saveImage(fname, buf);
    return json(res, 201, { ok: true, url });
  }

  if (pathname === '/api/reset' && req.method === 'POST') {
    const c = cloneSeed();
    bumpContent(c);
    await store.saveContent(c);
    return json(res, 200, { ok: true, version: c.version });
  }

  if (pathname === '/api/orders' && req.method === 'GET') return json(res, 200, await store.listOrders());

  if (pathname === '/api/order-status' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const list = await store.listOrders();
    const o = list.find((x) => x.id === str(b.id, 40));
    if (!o) return httpErr(res, 404, 'Commande introuvable');
    o.status = str(b.status, 30) || 'nouvelle';
    await store.saveOrders(list);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/order-delete' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const list = await store.listOrders();
    await store.saveOrders(list.filter((x) => x.id !== str(b.id, 40)));
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/reservations' && req.method === 'GET') return json(res, 200, await store.listReservations());

  if (pathname === '/api/reservation-status' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const list = await store.listReservations();
    const r = list.find((x) => x.id === str(b.id, 40));
    if (!r) return httpErr(res, 404, 'Réservation introuvable');
    r.status = str(b.status, 30) || 'nouvelle';
    await store.saveReservations(list);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/reservation-delete' && req.method === 'POST') {
    const b = await readJsonBody(req);
    const list = await store.listReservations();
    await store.saveReservations(list.filter((x) => x.id !== str(b.id, 40)));
    return json(res, 200, { ok: true });
  }

  return httpErr(res, 404, 'Route API inconnue');
}

module.exports = {
  ROOT, DATA_DIR, UPLOAD_DIR, SECTION_TYPES,
  json, httpErr, readJsonBody, handleApiRequest, getStore,
  FileStore, UpstashStore, readSeed, cloneSeed, issueToken, verifyTokenAuth, hashPw
};
