import { useGameState } from "../../hooks/useGameState";
import { StatusBar } from "../StatusBar/StatusBar";
import { LcdStrip } from "../LcdStrip/LcdStrip";
import type { ResourceMode, Difficulty, Resource } from "../../types";

function coverOf(target: Resource | null): string | null {
  if (!target) return null;
  return target.kind === "release" ? target.coverArtUrl : target.imageUrl;
}

interface GameBoardProps {
  mode: ResourceMode;
  difficulty: Difficulty;
  isDaily: boolean;
  date: string;
}

// Owns one round of play. Remounted by App (via key) whenever the resource
// mode, difficulty or daily/random session changes, so the hooks re-initialise
// cleanly. Everything that depends on the mystery resource lives here.
export function GameBoard({ mode, difficulty, isDaily, date }: GameBoardProps) {
  const { state, retryLoadTarget } = useGameState(mode, difficulty, isDaily);

  if (state.targetLoadError) {
    return (
      <div className="bg-xp-beige p-6 text-center text-[13px]">
        <p className="mb-3 text-feedback-wrong">
          Impossible de charger la ressource mystère.
        </p>
        <button
          type="button"
          className="xp-button px-4 py-1"
          onClick={retryLoadTarget}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const revealed = state.status === "won";
  const title = revealed && state.target
    ? state.target.kind === "release"
      ? state.target.title
      : state.target.name
    : null;
  const subtitle = revealed && state.target?.kind === "release"
    ? state.target.artist
    : null;

  return (
    <div className="flex flex-col gap-2 bg-xp-beige p-2">
      <LcdStrip
        coverUrl={coverOf(state.target)}
        coverMode={state.coverMode}
        blurLevel={state.blurLevel}
        isLoading={state.isLoadingTarget}
        revealed={revealed}
        title={title}
        subtitle={subtitle}
        difficulty={difficulty}
        guessCount={state.guesses.length}
      />

      {/* Game zone — search input + guess history, built in later commits. */}
      <div className="min-h-[120px] rounded-sm border border-[#aca899] bg-white p-3 text-[12px] text-[#5a5749]">
        Zone de jeu (à venir) — essais : {state.guesses.length}
      </div>

      <StatusBar
        mode={mode}
        difficulty={difficulty}
        date={date}
        status={state.status}
        guessCount={state.guesses.length}
      />
    </div>
  );
}
