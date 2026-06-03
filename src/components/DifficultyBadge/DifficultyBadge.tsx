import type { Difficulty } from "../../types";
import { DIFFICULTY_CONFIG } from "../../config/difficulty";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  guessCount: number;
}

// Remaining-attempts indicator for capped difficulties. Renders nothing when
// attempts are unlimited (Easy). Pips are doubled with a numeric readout so
// the information never depends on colour alone.
export function DifficultyBadge({ difficulty, guessCount }: DifficultyBadgeProps) {
  const { maxAttempts } = DIFFICULTY_CONFIG[difficulty];
  if (!Number.isFinite(maxAttempts)) return null;

  const remaining = Math.max(0, maxAttempts - guessCount);

  return (
    <div
      className="flex items-center gap-2 lcd-glow"
      aria-label={`${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
    >
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < remaining
                ? "bg-lcd-glow shadow-[0_0_5px_rgba(70,232,255,.8)]"
                : "bg-lcd-dim/40"
            }`}
          />
        ))}
      </span>
      <span className="font-pixel text-[12px]" aria-hidden="true">
        {remaining}/{maxAttempts}
      </span>
    </div>
  );
}
