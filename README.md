# 🍕 Pizzeria Demo — Site + Panneau d'Administration

Site vitrine + commande pour une pizzeria, **modifiable à 100 % depuis un panneau d'administration**.
Toutes les modifications (textes, menu, prix, photos, promos, avis, zones de livraison…) sont
enregistrées côté serveur et **propagées automatiquement à tous les appareils** : les pages
ouvertes se mettent à jour toutes seules (~20 s), sans rechargement.

## 🚀 Démarrage

```bash
node server.js      # ou : npm start
```

| URL | Description |
|---|---|
| `http://localhost:8080/` | Site public |
| `http://localhost:8080/admin` | Panneau d'administration |

- **Mot de passe admin par défaut : `demo123`** (à changer dans l'onglet *Compte*).
- Variables d'environnement : `PORT` (défaut `8080`), `ADMIN_PASSWORD` (mot de passe initial, au premier lancement uniquement).
- Aucune dépendance : Node.js ≥ 18 suffit (fonction `fetch` native). Pour déployer sur **Vercel**, voir la section *Déploiement* ci-dessous.

## 🌍 Sélecteur de langues (EN / AR)

Le site public est **anglophone par défaut** (la langue française a été retirée du site).
Le sélecteur `EN | ع` (barre de navigation + menu mobile) fonctionne ainsi :

- **EN = langue source** : tout `index.html`, le contenu par défaut (`data/seed.json`) et
  l'admin sont en anglais pour les valeurs éditées côté visiteur.
- Un dictionnaire **EN → AR** (~345 phrases, `assets/i18n.js`, zéro dépendance) traduit
  chaque nœud texte du DOM, les `placeholder`/`title`, le `<title>` de l'onglet et les
  messages composés par le JS ; un `MutationObserver` retraduit tout ce qui est rendu
  ensuite (panier, menu, refresh auto depuis l'admin). Clés normalisées (espaces,
  apostrophes) : une phrase tapée dans l'admin garde sa traduction.
- L'arabe bascule la page en **RTL** (`dir=rtl`) avec ajustements CSS dédiés.
- Le choix est mémorisé (`localStorage pd_lang`), appliqué avant le premier rendu (aucun
  flash), et un ancien réglage `fr` retombe proprement sur `en`.
- Une chaîne inconnue du dictionnaire s'affiche telle quelle (langue source).
- Le panneau d'administration (`/admin`) reste **entièrement en français** (outil exploitant).

## 🎨 Design luxe & 6 thèmes (dont 2 sombres)

Le site public est en **anglais** (langue source ; le français a été retiré). Le sélecteur
`EN | ع` reste disponible (dictionnaire EN → AR dans `assets/i18n.js`, RTL automatique,
persistance `localStorage`).
Le contenu d'**articles** (noms de plats, badges Signature/Veggie/Premium, catégories, prix,
libellés de garnitures du Builder) est traduit en arabe via le même dictionnaire.

**6 thèmes** au choix — bouton pastille (icône demi-teinte) dans l'en-tête + 6 pastilles
dans le menu mobile ; choix mémorisé (`localStorage pd_theme`) et appliqué **avant le
premier rendu** (aucun flash) :

| Thème | Type | Palette |
|---|---|---|
| **Ivory** (défaut) | clair | ivoire chaud + bronze |
| **Porcelain** | clair | porcelaine froide + ardoise |
| **Sand** | clair | sable + bronze |
| **Sage** | clair | vert sauge + vert profond |
| **Night** | **sombre** | noir chaud + or |
| **Forest** | **sombre** | vert nuit + champagne |

Implémentation : chaque thème = un jeu de variables CSS sur `<html data-theme="…">`
(papier, carte, encre, accent, or, bordures, voile de la section réservation…) ; les
utilitaires Tailwind (`bg-ink`, `text-ink`, `bg-cream`, `bg-white`, couleurs de marque,
variantes en transparence via `color-mix`) sont **re-mappés vers ces variables** dans le
bloc `<style>` du site, donc tout le site (modales, panier, builder, admin public…) suit
le thème. Pour ajouter un thème : bloquer `[data-theme="…"]` dans `index.html`, l'ajouter
dans `PD_THEMES` (JS) + une pastille dans le panneau.

Finitions « luxe » : **police serif d'affichage** (Didot/Bodoni/Georgia selon la machine)
pour les titres, filet doré sous le titre du hero, boutons pilles bordés d'or, bordures
1 px, ombres douces, sections photo avec voilages (hero pizza, salle du Builder, table
derrière la réservation, four à bois sur le bandeau et la carte promo). Le hero reste
cinématographique (sombre) dans tous les thèmes ; la section réservation adapte son
voile (clair/sombre) selon le thème.

## 🛠️ Ce qu'on peut modifier depuis l'admin

- **Général** : nom, slogan, bandeau promotionnel, section d'accueil (titres, sous-titre, image, prix, plat vedette…), chiffres clés, bandeau de confiance, coordonnées, carte, horaires, seuil de livraison gratuite, pied de page.
- **Menu** : plats (ajout, modification, duplication, réordonnancement, suppression), prix, promos, badges, étiquettes, images (URL **ou import**), et catégories.
- **Créateur de pizza** : prix de base, tailles, pâtes, sauces, fromages, garnitures (nom, prix, couleur).
- **Offres & Promos** : offre vedette, cartes promo, codes promo (%, montant), lots de la roue de la fortune.
- **Galerie** : photos (URL ou import), titres, tailles des vignettes.
- **Avis** : modération des avis déposés par les visiteurs + ajout manuel.
- **Zones** : quartiers livrés, frais et délais.
- **Commandes & Réservations** : arrivent en temps réel depuis le site public, avec statuts.
- **Compte** : changement de mot de passe, réinitialisation du contenu.

## 🔄 Synchronisation multi-appareils

- Le contenu vit dans `data/content.json`, servi par `GET /api/content`.
- Chaque sauvegarde admin incrémente une **version** (`GET /api/version`).
- Le site public vérifie la version toutes les 20 s (et au retour sur l'onglet) : si elle a changé, il re-rend la page — les **tous les appareils connectés** voient donc les changements sans rien faire.
- Les avis, commandes et résérations envoyés par les visiteurs sont écrits côté serveur et visibles immédiatement dans l'admin.

## 🎨 Assets locaux (aucun CDN requis)

Le site **ne dépend d'aucun CDN** : Tailwind (CSS compilé, palette minimaliste), polices locales, Font Awesome et canvas-confetti sont servis depuis `assets/vendor/`. Il s'affiche donc correctement même sur un réseau où les CDN sont bloqués ou lents.

Après avoir modifié des classes CSS dans `index.html` / `admin.html`, recompiler le CSS :

```bash
npx tailwindcss@3.4.17 -c tailwind.config.cjs -o assets/vendor/tailwind.css --minify
```

Les seules ressources externes restantes sont les photos de contenu (URLs Unsplash/Pravatar, remplaçables par vos propres imports via l'admin), la carte OpenStreetMap et les liens WhatsApp/Itinéraire.

## 📁 Stockage

| Fichier | Rôle |
|---|---|
| `data/seed.json` | Contenu d'origine (sert à la réinitialisation) |
| `data/content.json` | Contenu live (créé au premier lancement, sauvegardé à chaque modification) |
| `data/orders.json` / `data/reservations.json` | Commandes & réservations reçues |
| `data/uploads/` | Images importées depuis l'admin |
| `assets/vendor/` | CSS, polices et scripts servis localement |

Sauvegarder le dossier `data/` = sauvegarder tout le site.

## 🔒 Sécurité (niveau démo)

- Panneau admin protégé par mot de passe (hash SHA-256 + salt, tokens à durée de vie 12 h).
- Endpoints d'écriture authentifiés ; uploads limités aux images ≤ 5 Mo avec vérification de la signature du fichier.
- Les fichiers internes (`data/`, `server.js`, …) ne sont pas servirs.

## 🌐 Sans serveur (mode statique)

`index.html` reste consultable en statique (double-clic, GitHub Pages…) : sans API,
il retombe sur le contenu par défaut embarqué. Dans ce mode, aucune modification
centralisée n'est possible — il faut le serveur pour l'admin et la synchro.

## ☁️ Déploiement

Le projet fonctionne **sans aucune modification** sur deux types d'hébergement :

### 1. Vercel (serverless) — recommandé pour un déploiement rapide

Sur Vercel il n'y a pas de processus Node persistant ni de système de fichiers
inscriptible : le backend tourne en fonction serverless (`api/[[...path]].js`,
déjà en place) et le stockage passe par une base **Redis Upstash** (gratuit).

1. Créer une base Redis gratuite sur [upstash.com](https://upstash.com) (même compte possible) et copier
   **REST URL** et **REST Token** (format `https://xxxx.upstash.io`).
2. Importer le repo sur [vercel.com/new](https://vercel.com/new) :
   - Framework preset : **Other** — pas de build, pas de commande de démarrage.
3. Dans *Settings → Environment Variables*, ajouter :

   | Variable | Valeur |
   |---|---|
   | `UPSTASH_REDIS_REST_URL` | `https://xxxx.upstash.io` |
   | `UPSTASH_REDIS_REST_TOKEN` | le token Upstash |
   | `ADMIN_PASSWORD` | votre mot de passe admin (sinon `demo123`) |
   | `ADMIN_TOKEN_SECRET` | une longue chaîne aléatoire (sinon dérivée du mot de passe) |

4. Déployer. Site public : `/` — panneau admin : **`/admin`**.

Notes :
- Si les variables Upstash manquent, l'API répond avec un message d'erreur explicite
  en français (aucune donnée n'est perdue).
- Le contenu d'origine est **embarqué dans la fonction serverless** (`api/seed-data.js`),
  car les fichiers hors de `api/` ne sont pas déployés avec elle. Après toute modification
  de `data/seed.json`, régénérer-le avec : `npm run gen-seed`.
- Les images importées sont **automatiquement redimensionnées dans le navigateur**
  (max 1280 px, JPEG ~82 %) pour respecter la limite de taille des valeurs Redis
  (~1 Mo en serverless).
- Offre gratuite Upstash : les bases sont **suspendues après 7 jours d'inactivité**
  (suffisant pour une démo active ; les données sont conservées).
- Les sauvegardes de section font un simple « lire-modifier-écrire » : parfait pour
  un seul admin à la fois (ce projet), à éviter si plusieurs admins écrivent en même temps.

### 2. Render / Railway / VPS / local (serveur Node classique)

`npm start` (Node ≥ 18) — rien d'autre à configurer, le stockage reste dans les
fichiers `data/`. Sur Render : *Web Service* → build `npm install` → start `npm start`.
