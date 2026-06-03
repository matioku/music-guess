# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # Start dev server (HMR)
bun build            # Type-check + Vite production build
bun lint             # ESLint
bun preview          # Preview production build
bun fetch-popular    # One-shot: populate src/data/popular-*.json (~15–20 min, rate-limited)
```

No test runner is configured. No individual test command exists.

## Project

**MusicGuess** is a Wordle-style daily music guessing game (inspired by "Un Jour Un Film"). The player guesses a mystery music resource by submitting candidates via an autocomplete input; each guess triggers a visual field-by-field metadata comparison.

**Deadline**: Sunday 2026-06-07 at 23:00.

## Stack

- React 19 + TypeScript strict, bundled with Vite
- Tailwind CSS v3 (already configured)
- Package manager: **Bun**
- State: native hooks only (`useState`, `useEffect`, `useReducer`) — no Zustand/Redux

## Game Modes

### Resource modes (selected at game start)

| Mode | MusicBrainz entity | Priority |
|---|---|---|
| **Release** | `release-group` | Primary — must ship |
| **Artist** | `artist` | Secondary |
| **Recording** | `recording` | Bonus |

### Difficulty modes

| Difficulty | Attempts | Behaviour |
|---|---|---|
| **Easy** | Unlimited | Play until found |
| **Hard** | 6 max | Game lost after 6 failed guesses |

### Target selection

MusicBrainz has no native random endpoint. Strategy: maintain local lists of ~500 popular MBIDs bundled in `src/data/popular-releases.json` and `src/data/popular-artists.json`. Draw from these lists via date seed or `Math.random()`. Actual metadata is always fetched live from the API — local lists contain IDs only.

- **Daily mode** (default): seed = `YYYY-MM-DD` + resource mode → same resource for all players
- **Random mode**: pure random draw, triggered by a dedicated button

## Required State Architecture

```ts
const [targetResource, setTargetResource] = useState<Release | Artist | null>(null);
const [guesses, setGuesses] = useState<Guess[]>([]);
const [inputValue, setInputValue] = useState<string>("");
const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
```

`targetResource` must **never appear in the DOM** before the win state (no `console.log`, no HTML attributes).

## Project Structure

```
src/
├── components/
│   ├── ModeSelector/        # Resource type + difficulty picker
│   ├── SearchInput/         # Controlled autocomplete input
│   ├── GuessRow/            # Single comparison row (coloured fields)
│   ├── GuessHistory/        # List of all GuessRows
│   ├── ResourceCard/        # Final reveal card (image + metadata)
│   ├── VictoryScreen/
│   ├── DefeatScreen/        # Hard mode only
│   └── DifficultyBadge/     # Remaining attempts (hard mode)
├── hooks/
│   ├── useDailyResource.ts
│   ├── useRandomResource.ts
│   ├── useGameState.ts
│   └── useLocalStorage.ts
├── services/
│   ├── musicbrainz.ts
│   ├── coverArt.ts
│   └── discogs.ts           # Fallback images only
├── types/
│   └── index.ts             # Release, Artist, Guess, GameState…
├── data/
│   ├── popular-releases.json
│   └── popular-artists.json
└── utils/
    ├── seed.ts              # Date → MBID index
    └── compare.ts           # Field-by-field comparison logic
```

## APIs

### MusicBrainz

Base URL: `https://musicbrainz.org/ws/2/`  
Required header: `User-Agent: UnJourUneRessource/1.0 (contact@example.com)`

```
GET /release-group?query={input}&limit=10&fmt=json   # Autocomplete releases
GET /release-group/{mbid}?inc=artist-credits+releases+tags&fmt=json
GET /artist?query={input}&limit=10&fmt=json          # Autocomplete artists
GET /artist/{mbid}?inc=tags+releases&fmt=json
```

**Rate limit**: max 1 req/s — debounce autocomplete at **300 ms minimum**.

### Cover Art Archive

```
GET https://coverartarchive.org/release-group/{mbid}
→ Use the image with type "Front"
```

### Discogs (fallback only)

Used only when Cover Art Archive returns 404. Token stored in `.env.local`:

```env
VITE_DISCOGS_TOKEN=your_discogs_token_here
```

```
GET https://api.discogs.com/database/search?q={title artist}&type=release&token={TOKEN}
```

## Comparison Fields

### Release mode

| Field | MusicBrainz path | Feedback |
|---|---|---|
| Artist | `artist-credit[0].name` | Exact |
| Release year | `first-release-date` (year) | Numeric + ↑/↓ |
| Type | `primary-type` + `secondary-types` | Exact |
| Country | `releases[0].country` | Exact |
| Label | `releases[0].label-info[0].label.name` | Exact |
| Genres/tags | `tags` (top 3 by vote) | Partial (intersection) |

### Artist mode

| Field | MusicBrainz path | Feedback |
|---|---|---|
| Country/origin | `area.name` or `country` | Exact |
| Type | `type` (Person/Group/…) | Exact |
| Career start | `life-span.begin` (year) | Numeric + ↑/↓ |
| Career end | `life-span.end` (year, if set) | Numeric + ↑/↓ / N/A |
| Genres/tags | `tags` (top 3 by vote) | Partial (intersection) |

### Visual feedback

- Green: exact match
- Red: no match
- Yellow: partial match (tags/genres only)
- ↑/↓: directional hint for numeric fields

Color feedback **must always be doubled** with a text label or icon — never rely on color alone.

## localStorage Persistence

Key format: `uujr_game_{mode}_{date}` (e.g. `uujr_game_release_2025-06-01`)

```ts
interface SavedGame {
  date: string;
  mode: "release" | "artist" | "recording";
  difficulty: "easy" | "hard";
  targetMbid: string;
  guesses: Guess[];
  status: "playing" | "won" | "lost";
}
```

On load: check for an existing game for today + current mode; resume if found.

## Design

### Aesthetic

Two retro aesthetics combined — immediate recognizability over pixel-perfect reproduction:
- **Windows XP** for the app chrome (window, menus, buttons, tables)
- **Windows Media Player 9** for the player zone — full WMP inspiration, adapted for modern accessibility

Use the `frontend-design` and `ui-ux-pro-max` skills when building UI components.

### Page layout (top → bottom)

1. **Titlebar XP** — app icon, name, decorative minimize/maximize/close buttons
2. **Menubar** — `Fichier / Jeu / Options / Affichage / ?` + session info (seed, date) on the right
3. **Toolbar** — mode buttons (Release / Artiste / Morceau) and difficulty (Facile / Difficile)
4. **LCD strip** — dark WMP-style zone: `?` cover art, animated scrolling title, attempt counter; shows equalizer bars + `LOADING...` text during load
5. **Game zone** — autocomplete input + guess history table
6. **Status bar XP** — contextual info (mode, difficulty, date)

### Palette & typography

**XP chrome**
- Main background: `#ece9d8` (XP beige)
- Titlebars / table headers: blue gradient `#2f8bef → #0054e3`
- Buttons: outset/inset style (light top/left borders, dark bottom/right)
- Font: `Tahoma` for all app content (labels, cells, menus)

**WMP player zone**
- Font: `Tahoma` for body text, `Trebuchet MS` for titles

**Implementation**: use Tailwind for layout/spacing; skeuomorphic details (button gradients, inset/outset, LCD glow) via Tailwind arbitrary values (`[border-top-color:#fff]`) or a companion `xp.css` file. Import `Tahoma` and `Trebuchet MS` locally if possible.

### Special states

- **Victory**: winning row gets a pale-green background; cover art/photo reveals in LCD strip; congratulations message as XP-style modal or banner
- **Defeat** (hard mode only): XP-style dialog box, target resource revealed with cover art
- **Loading**: LCD strip shows equalizer bar animation + `LOADING...` text

## Accessibility

RGAA/WCAG 2.1 AA:
- Heading hierarchy `h1 → h2 → h3` with no skipped levels
- Every form field has a `<label>` or `aria-label`
- Autocomplete: `role="combobox"` + `aria-expanded` + `aria-activedescendant`
- Contrast ratios: normal text ≥ 4.5:1, large text/UI components ≥ 3:1

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
