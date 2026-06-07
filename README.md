# MusicGuess — Un Jour, Une Ressource

Jeu de devinettes musical à la Wordle/Heardle. Chaque jour, une **ressource
musicale mystère** (album ou artiste) est tirée ; le joueur la devine en
soumettant des propositions via un autocomplete. Chaque proposition déclenche
une comparaison **champ par champ** des métadonnées (artiste, année, type,
pays, label, genres…), avec un retour visuel coloré + texte + icône.

L'interface reprend l'esthétique **Windows XP (Luna)** pour le chrome
applicatif et **Windows Media Player 9** pour la zone lecteur (pochette
floutée, titre défilant, barres d'égaliseur).

## Démo jouable

Jouez à MusicGuess directement dans votre navigateur ! https://musicguess.matioku.net

## Univers & fonctionnement

- **Modes de ressource** : Release (album / EP / single / compilation) et Artiste.
- **Difficultés** : Facile (illimité), Moyen (8 essais), Difficile (6), Expert (4).
  Les modes capés masquent ou floutent la pochette et débloquent des indices.
- **Tirage** : *partie du jour* (seed `date + mode`, identique pour tous) ou
  *nouvelle partie aléatoire*.
- **Indices** : selon la difficulté, réduction progressive du flou de la
  pochette et révélation de champs.
- **Persistance** : la partie du jour est sauvegardée dans `localStorage` et
  reprise au rechargement.

La ressource cible n'apparaît jamais en clair dans le DOM avant la victoire.

## Stack

- React 19 + TypeScript strict, bundlé avec Vite
- Tailwind CSS v3 (+ `src/styles/xp.css` pour le skeuomorphisme XP/WMP)
- State : hooks natifs uniquement (`useReducer`, `useState`, `useEffect`)
- Gestionnaire de paquets : **Bun**

## APIs utilisées

- [**MusicBrainz**](https://musicbrainz.org) (`musicbrainz.org/ws/2/`) — recherche et métadonnées des
  ressources.
- [**Cover Art Archive**](https://coverartarchive.org/) — pochettes d'albums.
- [**Discogs**](https://discogs.com/developers) — images de repli (fallback) quand Cover Art Archive renvoie 404.
  Token dans `.env.local` : `VITE_DISCOGS_TOKEN=…`. (à obtenir à l'adresse https://www.discogs.com/settings/developers)

## Installation

```bash
bun install
bun dev        # serveur de dev (HMR)
bun build      # type-check + build de production
bun lint       # ESLint
bun preview    # prévisualisation du build
```

> Sans Bun installé, les commandes équivalentes fonctionnent avec npm :
> `npm install`, `npx vite`, `npx vite build`, `npx eslint .`.

## Structure

```
src/
├── components/   # UI XP/WMP (TitleBar, Toolbar, LcdStrip, SearchInput,
│                 #  GuessHistory, HintPanel, VictoryScreen, DefeatScreen…)
├── hooks/        # useGameState, useSearch, useLocalStorage
├── services/     # musicbrainz, coverArt, discogs
├── utils/        # compare, hints, seed, display
├── config/       # difficulty
├── data/         # listes de MBIDs populaires (release / artist)
└── types/        # types partagés
```

## Membres & rôles

- Thibaud Mineau: frontend et design
- Mathieu Chauvet: Logique et liaison des API
