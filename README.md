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
- Aucune dépendance : Node.js ≥ 16 suffit.

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

## 📁 Stockage

| Fichier | Rôle |
|---|---|
| `data/seed.json` | Contenu d'origine (sert à la réinitialisation) |
| `data/content.json` | Contenu live (créé au premier lancement, sauvegardé à chaque modification) |
| `data/orders.json` / `data/reservations.json` | Commandes & réservations reçues |
| `data/uploads/` | Images importées depuis l'admin |

Sauvegarder le dossier `data/` = sauvegarder tout le site.

## 🔒 Sécurité (niveau démo)

- Panneau admin protégé par mot de passe (hash SHA-256 + salt, tokens à durée de vie 12 h).
- Endpoints d'écriture authentifiés ; uploads limités aux images ≤ 5 Mo avec vérification de la signature du fichier.
- Les fichiers internes (`data/`, `server.js`, …) ne sont pas servirs.

## 🌐 Sans serveur (mode statique)

`index.html` reste consultable en statique (double-clic, GitHub Pages…) : sans API,
il retombe sur le contenu par défaut embarqué. Dans ce mode, aucune modification
centralisée n'est possible — il faut le serveur pour l'admin et la synchro.
