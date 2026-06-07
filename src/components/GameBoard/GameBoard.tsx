import { useState } from "react";
import { CoverZoomModal } from "../Modal/CoverZoomModal";
import { useGameState } from "../../hooks/useGameState";
import { useSearch } from "../../hooks/useSearch";
import { useSettings } from "../../hooks/useSettings";
import { StatusBar } from "../StatusBar/StatusBar";
import { LcdStrip } from "../LcdStrip/LcdStrip";
import { SearchInput } from "../SearchInput/SearchInput";
import { GuessHistory } from "../GuessHistory/GuessHistory";
import { HintPanel } from "../HintPanel/HintPanel";
import { RevealedHints } from "../RevealedHints/RevealedHints";
import { VictoryScreen } from "../VictoryScreen/VictoryScreen";
import { DefeatScreen } from "../DefeatScreen/DefeatScreen";
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
  /** Start a fresh random round (App remounts the board). */
  onNewRandom: () => void;
  /** Switch to (or restart) today's daily round (App remounts the board). */
  onDaily: () => void;
}

// Owns one round of play. Remounted by App (via key) whenever the resource
// mode, difficulty or daily/random session changes, so the hooks re-initialise
// cleanly. Everything that depends on the mystery resource lives here.
export function GameBoard({
  mode,
  difficulty,
  isDaily,
  date,
  onNewRandom,
  onDaily,
}: GameBoardProps) {
  const { state, submitGuess, takeHint, skipHint, retryLoadTarget } =
    useGameState(mode, difficulty, isDaily);
  const { inputValue, setInput, suggestions, isSearching, error, clearSuggestions } =
    useSearch(mode);
  const { settings } = useSettings();

  const [zoomOpen, setZoomOpen] = useState(false);

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

  // Reveal the cover/title on any end state (win or defeat).
  const revealed = state.status !== "playing";
  const title = revealed && state.target
    ? state.target.kind === "release"
      ? state.target.title
      : state.target.name
    : null;
  const subtitle = revealed && state.target?.kind === "release"
    ? state.target.artist
    : null;

  // Blur applied to the LCD cover; once revealed it's crisp. The zoom enlarges
  // the cover ~3× the LCD size, so the modal blur is scaled to match and never
  // reveals more detail than the LCD while playing.
  const coverBlurPx = revealed ? 0 : state.blurLevel * settings.blurFactor;
  const zoomBlurPx = coverBlurPx * 3;

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
        onZoom={() => setZoomOpen(true)}
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

        {state.target && state.status === "playing" && (
          <RevealedHints
            target={state.target}
            revealedFields={state.revealedFields}
          />
        )}

        <GuessHistory
          guesses={state.guesses}
          mode={mode}
          revealedFields={state.revealedFields}
          highlightMbid={state.status === "won" ? state.targetMbid : undefined}
        />
      </div>

      {state.status === "won" && state.target && (
        <VictoryScreen
          resource={state.target}
          guessCount={state.guesses.length}
          isDaily={isDaily}
          onDaily={onDaily}
          onNewRandom={onNewRandom}
        />
      )}
      {state.status === "lost" && state.target && (
        <DefeatScreen
          resource={state.target}
          isDaily={isDaily}
          onDaily={onDaily}
          onNewRandom={onNewRandom}
        />
      )}

      {zoomOpen && coverOf(state.target) && (
        <CoverZoomModal
          src={coverOf(state.target)!}
          title={revealed ? (title ?? "Pochette") : "Pochette mystère"}
          blurPx={zoomBlurPx}
          onClose={() => setZoomOpen(false)}
        />
      )}
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
