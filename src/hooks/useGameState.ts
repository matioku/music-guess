// Task 9 will import: useReducer, useEffect, useCallback, useRef (React hooks)
// Task 9 will import: getDailyMbid, getRandomMbid, getReleaseGroup, getArtist, getCoverArt, ResourceMode, Difficulty
import type {
  GameState,
  GameStatus,
  Resource,
  ReleaseGroup,
  Artist,
  ReleaseComparison,
  ArtistComparison,
  SavedGame,
} from "../types";
import { DIFFICULTY_CONFIG } from "../config/difficulty";
import { compareResources } from "../utils/compare";
import { computeAvailableHint } from "../utils/hints";

// ─── Action types ─────────────────────────────────────────────────────────────

export type Action =
  | { type: "LOAD_TARGET_START" }
  | { type: "LOAD_TARGET_SUCCESS"; payload: Resource }
  | { type: "LOAD_TARGET_ERROR" }
  | { type: "LOAD_SAVED"; payload: SavedGame }
  | { type: "SUBMIT_GUESS"; payload: Resource }
  | { type: "TAKE_HINT" }
  | { type: "SKIP_HINT" }
  | { type: "RESET"; payload: { targetMbid: string } };

// ─── Initial state ────────────────────────────────────────────────────────────

export function createInitialState(
  mode: GameState["mode"],
  difficulty: GameState["difficulty"],
  targetMbid: string
): GameState {
  const config = DIFFICULTY_CONFIG[difficulty];
  return {
    mode,
    difficulty,
    status: "playing",
    targetMbid,
    target: null,
    guesses: [],
    coverMode: config.coverMode,
    blurLevel: config.initialBlur,
    revealedFields: [],
    availableHint: null,
    hintsUsed: 0,
    isLoadingTarget: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "LOAD_TARGET_START":
      return { ...state, isLoadingTarget: true };

    case "LOAD_TARGET_SUCCESS":
      return { ...state, target: action.payload, isLoadingTarget: false };

    case "LOAD_TARGET_ERROR":
      return { ...state, isLoadingTarget: false, status: "error" };

    case "LOAD_SAVED": {
      const saved = action.payload;
      const config = DIFFICULTY_CONFIG[saved.difficulty];
      return {
        ...createInitialState(saved.mode, saved.difficulty, saved.targetMbid),
        guesses: saved.guesses,
        status: saved.status,
        blurLevel: saved.blurLevel,
        revealedFields: saved.revealedFields,
        hintsUsed: saved.hintsUsed,
        coverMode: config.coverMode,
        isLoadingTarget: true,
      };
    }

    case "SUBMIT_GUESS": {
      if (!state.target) return state;

      const comparison = compareResources(action.payload, state.target);
      const guess: ReturnType<typeof buildGuess> = buildGuess(
        action.payload,
        state.target,
        comparison
      );
      if (!guess) return state;

      const newGuesses = [...state.guesses, guess];
      const { maxAttempts } = DIFFICULTY_CONFIG[state.difficulty];

      let newStatus: GameStatus = "playing";
      if (action.payload.mbid === state.targetMbid) {
        newStatus = "won";
      } else if (newGuesses.length >= maxAttempts) {
        newStatus = "lost";
      }

      const availableHint =
        newStatus === "playing"
          ? computeAvailableHint(
              newGuesses.length,
              state.difficulty,
              state.mode,
              state.hintsUsed
            )
          : null;

      return { ...state, guesses: newGuesses, status: newStatus, availableHint };
    }

    case "TAKE_HINT": {
      if (!state.availableHint) return state;
      const hint = state.availableHint;
      return {
        ...state,
        blurLevel:
          hint.kind === "blur"
            ? Math.max(0, state.blurLevel - 1)
            : state.blurLevel,
        revealedFields:
          hint.kind === "field"
            ? [...state.revealedFields, hint.field]
            : state.revealedFields,
        hintsUsed: state.hintsUsed + 1,
        availableHint: null,
      };
    }

    case "SKIP_HINT":
      return { ...state, availableHint: null, hintsUsed: state.hintsUsed + 1 };

    case "RESET":
      return createInitialState(
        state.mode,
        state.difficulty,
        action.payload.targetMbid
      );

    default:
      return state;
  }
}

// buildGuess is a helper kept outside the reducer to avoid nesting
function buildGuess(
  payload: Resource,
  target: Resource,
  comparison: ReleaseComparison | ArtistComparison
) {
  if (payload.kind === "release" && target.kind === "release") {
    return { resource: payload as ReleaseGroup, comparison: comparison as ReleaseComparison };
  }
  if (payload.kind === "artist" && target.kind === "artist") {
    return { resource: payload as Artist, comparison: comparison as ArtistComparison };
  }
  return null;
}
