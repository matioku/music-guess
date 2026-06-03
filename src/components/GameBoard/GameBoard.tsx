import { useGameState } from "../../hooks/useGameState";
import { useSearch } from "../../hooks/useSearch";
import { StatusBar } from "../StatusBar/StatusBar";
import { LcdStrip } from "../LcdStrip/LcdStrip";
import { SearchInput } from "../SearchInput/SearchInput";
import { GuessHistory } from "../GuessHistory/GuessHistory";
import { HintPanel } from "../HintPanel/HintPanel";
import { MODE_LABELS } from "../../utils/display";
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
  const { state, submitGuess, takeHint, skipHint, retryLoadTarget } =
    useGameState(mode, difficulty, isDaily);
  const { inputValue, setInput, suggestions, isSearching, error, clearSuggestions } =
    useSearch(mode);

  const handleSelect = (mbid: string) => {
    submitGuess(mbid);
    clearSuggestions();
  };

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

      {/* Game zone — search input + guess history. */}
      <div className="rounded-sm border border-[#aca899] [border-top-color:#fff] [border-left-color:#fff] bg-xp-beige p-3">
        {state.status === "playing" && (
          <SearchInput
            label={`Proposez ${mode === "release" ? "un album" : "un artiste"}`}
            placeholder={`Rechercher ${MODE_LABELS[mode].toLowerCase()}…`}
            value={inputValue}
            suggestions={suggestions}
            isSearching={isSearching}
            error={error}
            onChange={setInput}
            onSelect={handleSelect}
          />
        )}

        {state.status === "playing" && state.availableHint && (
          <HintPanel
            hint={state.availableHint}
            onTake={takeHint}
            onSkip={skipHint}
          />
        )}

        <GuessHistory
          guesses={state.guesses}
          mode={mode}
          revealedFields={state.revealedFields}
        />
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
