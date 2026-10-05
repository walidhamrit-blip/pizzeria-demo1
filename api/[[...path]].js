'use strict';
/* Fonction serverless Vercel — traite toutes les routes /api/*
 * (le reste du site est servi statiquement par Vercel : index.html, admin.html, assets/)
 * Stockage : Upstash Redis (variables d'environnement UPSTASH_REDIS_REST_URL/TOKEN,
 * voir README — Déploiement Vercel). */
const lib = require('./_lib');

let store = null;

module.exports = async (req, res) => {
  try {
    store = store || lib.getStore();
    await store.ready;
    const u = new URL(req.url, 'http://localhost');
    if (!u.pathname.startsWith('/api/')) return lib.httpErr(res, 404, 'Introuvable');
    return await lib.handleApiRequest(req, res, u.pathname, store);
  } catch (err) {
    const code = err.code === 413 ? 413 : err.code === 400 ? 400 : err.code === 502 ? 502 : 500;
    if (!res.headersSent) lib.httpErr(res, code, code === 500 && !err.code ? 'Erreur serveur' : err.message);
  }
};
