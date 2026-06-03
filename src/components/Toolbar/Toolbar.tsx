import type { ResourceMode, Difficulty } from "../../types";
import {
  MODE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
} from "../../utils/display";

const MODES: ResourceMode[] = ["release", "artist"];

interface ToolbarProps {
  mode: ResourceMode;
  difficulty: Difficulty;
  isDaily: boolean;
  onModeChange: (mode: ResourceMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewRandom: () => void;
  onDaily: () => void;
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="px-1 text-[11px] font-semibold text-[#5a5749]">
        {label}
      </span>
      <div role="group" aria-label={label} className="flex gap-1">
        {children}
      </div>
      <span aria-hidden className="mx-1 h-6 w-px bg-[#aca899]" />
    </div>
  );
}

// XP toolbar: resource mode + difficulty selectors and the daily/random
// session controls. Changing mode or difficulty remounts the board upstream.
export function Toolbar({
  mode,
  difficulty,
  isDaily,
  onModeChange,
  onDifficultyChange,
  onNewRandom,
  onDaily,
}: ToolbarProps) {
  return (
    <div className="xp-panel flex flex-wrap items-center gap-2 px-2 py-1.5">
      <Group label="Ressource">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            className={`xp-button px-3 py-1 text-[12px] ${mode === m ? "is-active" : ""}`}
            onClick={() => onModeChange(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </Group>

      <Group label="Difficulté">
        {DIFFICULTY_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={difficulty === d}
            className={`xp-button px-3 py-1 text-[12px] ${difficulty === d ? "is-active" : ""}`}
            onClick={() => onDifficultyChange(d)}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </Group>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-pressed={isDaily}
          className={`xp-button px-3 py-1 text-[12px] ${isDaily ? "is-active" : ""}`}
          onClick={onDaily}
        >
          Partie du jour
        </button>
        <button
          type="button"
          className="xp-button px-3 py-1 text-[12px]"
          onClick={onNewRandom}
        >
          Nouvelle partie aléatoire
        </button>
      </div>
    </div>
  );
}
