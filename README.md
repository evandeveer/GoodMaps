# 🗺️ GoodMaps - Guide & Carte des Activités Adaptées

<p align="center">
  <img src="src/assets/logo-goodmaps.png" alt="GoodMaps Logo" width="220" />
</p>

<p align="center">
  <strong>L'application inclusive pour découvrir facilement des lieux et activités adaptés à tous dans la métropole lilloise.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Google_Maps_API-4285F4?logo=googlemaps" alt="Google Maps" />
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap" alt="Bootstrap" />
</p>

---

## 🌟 Présentation

**GoodMaps** est une plateforme web moderne et intuitive conçue pour simplifier la recherche de sorties, d'activités culturelles, de parcs et d'équipements sportifs adaptés aux besoins de chacun :
- **Handicap moteur** ♿ (accès PMR, rampes, ascenseurs, prêt de matériel)
- **Handicap sensoriel** 👁️👂 (visites tactiles, audio-description, boucles magnétiques, LSF)
- **Handicap mental & psychique** 🧠 (espaces apaisants, médiation animale, repères simplifiés)
- **Handicap cognitif** 📖 (supports en FALC - Facile à Lire et à Comprendre)
- **Multi-handicap** 🤝 (lieux labellisés *Tourisme & Handicap*)
- **Sans handicap / Tout public** ✨

L'application couvre **près de 100 lieux réels et vérifiés** sur l'ensemble de la **Métropole Européenne de Lille (MEL)** : Lille, Villeneuve-d'Ascq, Roubaix, Tourcoing, Croix, Houplin-Ancoisne, Armentières, etc.

---

## ✨ Fonctionnalités Clés

- **⚡ Chargement Immédiat & Géolocalisation** : Détection automatique de la position de l'utilisateur ou centrage par défaut sur Lille.
- **🏷️ Filtres Interactifs en Direct** : Puces de filtrage instantané sans recharger la page (*Tous, 🌳 Parcs & Nature, 🏛️ Musées & Art, 📚 Médiathèques, ⚽ Sport & Loisirs, 🎭 Culture, ✨ Gratuit*).
- **🎨 Marqueurs Thématiques Personnalisés** : Chaque catégorie dispose d'un marqueur SVG distinctif (icône et code couleur dédié) pour un repérage immédiat sur la carte.
- **💬 Info-Bulles Interactives (`InfoWindowF`)** :
  - Distance calculée en direct depuis votre position (formule d'*Haversine*)
  - Badge de catégorie et horaires d'ouverture
  - Bouton **« Itinéraire ↗ »** ouvrant directement le guidage GPS Google Maps / Waze.
- **📱 Double Affichage (Carte + Carrousel Synchronisé)** :
  - Carrousel de cartes défilantes sous la carte.
  - Sélection bidirectionnelle : cliquer sur un pin centre le carrousel, cliquer sur une carte centre la carte et ouvre sa bulle.
- **🔄 Navigation Fluide & Conservation d'État** : Bouton « ← Modifier mes critères » permettant de revenir au formulaire d'accueil tout en conservant vos choix précédents.
- **📦 Base de Données 100 % Locale & Fiable** : Plus d'hallucinations d'IA : coordonnées GPS réelles, vérifiées au mètre près (ex: Parc du Héron, LaM, Piscine de Roubaix, Hospice Comtesse...).

---

## 🛠️ Stack Technique

- **Frontend** : [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Outillage** : [Vite 5](https://vitejs.dev/)
- **Cartographie** : [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api) (avec le hook moderne `useJsApiLoader` et composants `MarkerF` / `InfoWindowF`)
- **Styles & UI** : CSS3 moderne avec variables, Flexbox/Grid, Bootstrap 5
- **Routage** : [React Router v6](https://reactrouter.com/)

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- Un gestionnaire de paquets (`npm`, `pnpm` ou `yarn`)
- Une clé d'API [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key) avec l'API **Maps JavaScript API** activée.

### 2. Cloner le dépôt
```bash
git clone https://github.com/evandeveer/GoodMaps.git
cd GoodMaps
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configuration de l'environnement
Créez un fichier `.env` à la racine du projet (en vous basant sur `.env.example`) :
```env
VITE_GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps_ici
```

### 5. Lancer l'application en mode développement
```bash
npm run dev
```
L'application est accessible localement à l'adresse : **http://localhost:5173/thibault/GoodMaps/**

### 6. Compiler pour la production
```bash
npm run build
```
Les fichiers prêts pour le déploiement seront générés dans le dossier `dist/`.

---

## 📁 Architecture du Projet

```text
GoodMaps/
├── public/                 # Fichiers statiques publics
├── src/
│   ├── assets/             # Logos, icônes et images
│   ├── components/         # Composants réutilisables (GoogleMapComponent, LoadingOverlay...)
│   ├── controllers/        # Logique métier et filtres de recherche (apiServiceGPT.ts)
│   ├── data/               # Base de données des activités (activities.json)
│   ├── pages/              # Pages principales (Home.tsx, MapPage.tsx)
│   ├── utils/              # Fonctions utilitaires (catégories, couleurs...)
│   ├── types.ts            # Définitions TypeScript (Activity, UserInfo...)
│   ├── App.tsx             # Configuration des routes
│   ├── App.css             # Styles de l'application
│   └── main.tsx            # Point d'entrée React
├── .env.example            # Exemple de variables d'environnement
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
└── README.md               # Documentation
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à proposer de nouveaux lieux accessibles ou des améliorations d'interface :
1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/nouveau-lieu`)
3. Commitez vos modifications (`git commit -m 'Ajout du musée X'`)
4. Pushez vers la branche (`git push origin feature/nouveau-lieu`)
5. Ouvrez une Pull Request
