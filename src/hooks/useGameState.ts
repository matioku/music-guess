import { useReducer, useEffect, useCallback, useRef } from "react";
import type {
  GameState,
  GameStatus,
  Resource,
  ReleaseGroup,
  Artist,
  ReleaseComparison,
  ArtistComparison,
  SavedGame,
  ResourceMode,
  Difficulty,
} from "../types";
import { DIFFICULTY_CONFIG } from "../config/difficulty";
import { compareResources } from "../utils/compare";
import { computeAvailableHint } from "../utils/hints";
import { getDailyMbid, getRandomMbid } from "../utils/seed";
import { getReleaseGroup, getArtist } from "../services/musicbrainz";
import { getCoverArt } from "../services/coverArt";
import { getArtistImage } from "../services/artistImage";

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
    targetLoadError: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "LOAD_TARGET_START":
      return { ...state, isLoadingTarget: true, targetLoadError: false };

    case "LOAD_TARGET_SUCCESS":
      return {
        ...state,
        target: action.payload,
        isLoadingTarget: false,
        targetLoadError: false,
      };

    case "LOAD_TARGET_ERROR":
      return { ...state, isLoadingTarget: false, targetLoadError: true };

    case "LOAD_SAVED": {
      const saved = action.payload;
      return {
        ...createInitialState(saved.mode, saved.difficulty, saved.targetMbid),
        guesses: saved.guesses,
        status: saved.status,
        blurLevel: saved.blurLevel,
        revealedFields: saved.revealedFields,
        hintsUsed: saved.hintsUsed,
        availableHint:
          saved.status === "playing"
            ? computeAvailableHint(
                saved.guesses.length,
                saved.difficulty,
                saved.mode,
                saved.hintsUsed
              )
            : null,
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

// ─── Hook helpers ─────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildKey(mode: ResourceMode, date: string): string {
  return `uujr_game_${mode}_${date}`;
}

async function fetchResource(mbid: string, mode: ResourceMode): Promise<Resource> {
  return mode === "release" ? getReleaseGroup(mbid) : getArtist(mbid);
}

// Loads the target plus its artwork: album cover for releases, photo for
// artists. Only the mystery target goes through here — guesses don't need art.
async function fetchResourceWithCoverArt(mbid: string, mode: ResourceMode): Promise<Resource> {
  const resource = await fetchResource(mbid, mode);
  if (resource.kind === "release") {
    const coverArtUrl = await getCoverArt(resource.mbid, resource.title, resource.artist);
    return { ...resource, coverArtUrl };
  }
  const imageUrl = await getArtistImage(resource.mbid);
  return { ...resource, imageUrl };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState(
  mode: ResourceMode,
  difficulty: Difficulty,
  isDaily: boolean
) {
  const date = today();
  const key = buildKey(mode, date);

  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    (): GameState => {
      const mbid = isDaily ? getDailyMbid(date, mode) : getRandomMbid(mode);
      return createInitialState(mode, difficulty, mbid);
    }
  );

  const initialized = useRef(false);
  const isSubmittingRef = useRef(false);

  // Fetches the target (with cover art) and dispatches the outcome. Reused by
  // mount, retry, and reset — none of which touch guesses/localStorage here.
  const loadTarget = useCallback(
    (mbid: string) => {
      dispatch({ type: "LOAD_TARGET_START" });
      fetchResourceWithCoverArt(mbid, mode)
        .then((resource) =>
          dispatch({ type: "LOAD_TARGET_SUCCESS", payload: resource })
        )
        .catch(() => dispatch({ type: "LOAD_TARGET_ERROR" }));
    },
    [mode]
  );

  // Runs once on mount: restore saved game or start fresh, then fetch target.
  // Only the daily game is persisted/resumed (key = mode+date); random sessions
  // always start fresh and never touch that slot. The saved difficulty must
  // also match the selected one, so switching difficulty in the toolbar starts
  // a new game instead of snapping back to the stored one.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mbidToFetch = state.targetMbid;

    if (isDaily) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const saved = JSON.parse(stored) as SavedGame;
          if (saved.difficulty === difficulty) {
            dispatch({ type: "LOAD_SAVED", payload: saved });
            mbidToFetch = saved.targetMbid;
          }
        } catch {
          // Corrupted entry — proceed with fresh game
        }
      }
    }

    loadTarget(mbidToFetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every meaningful state change (daily game only; skip blank
  // state and load errors). Random sessions are intentionally not saved so
  // they never overwrite the daily slot.
  useEffect(() => {
    if (!initialized.current) return;
    if (!isDaily) return;
    if (state.status === "playing" && state.guesses.length === 0 && state.hintsUsed === 0) return;
    if (state.targetLoadError) return;

    const toSave: SavedGame = {
      date,
      mode: state.mode,
      difficulty: state.difficulty,
      targetMbid: state.targetMbid,
      guesses: state.guesses,
      status: state.status,
      blurLevel: state.blurLevel,
      revealedFields: state.revealedFields,
      hintsUsed: state.hintsUsed,
    };
    localStorage.setItem(key, JSON.stringify(toSave));
  }, [state, key, date, isDaily]);

  const submitGuess = useCallback(
    async (mbid: string) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      try {
        const resource = await fetchResource(mbid, mode);
        dispatch({ type: "SUBMIT_GUESS", payload: resource });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [mode]
  );

  const takeHint = useCallback(() => dispatch({ type: "TAKE_HINT" }), []);
  const skipHint = useCallback(() => dispatch({ type: "SKIP_HINT" }), []);

  // Non-destructive: re-fetch the current target after a load failure, keeping
  // the existing guesses and saved progress intact.
  const retryLoadTarget = useCallback(() => {
    loadTarget(state.targetMbid);
  }, [loadTarget, state.targetMbid]);

  // Destructive: start a brand-new game (clears guesses and saved progress).
  // Only clears the stored slot for the daily game — a random replay must not
  // wipe today's saved daily progress.
  const reset = useCallback(() => {
    const currentDate = today();
    const newMbid = isDaily ? getDailyMbid(currentDate, mode) : getRandomMbid(mode);
    dispatch({ type: "RESET", payload: { targetMbid: newMbid } });
    if (isDaily) localStorage.removeItem(buildKey(mode, currentDate));
    loadTarget(newMbid);
  }, [mode, isDaily, loadTarget]);

  return { state, submitGuess, takeHint, skipHint, reset, retryLoadTarget };
}
