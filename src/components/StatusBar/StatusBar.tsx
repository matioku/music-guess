import type { ResourceMode, Difficulty, GameStatus } from "../../types";
import { MODE_LABELS, DIFFICULTY_LABELS } from "../../utils/display";

interface StatusBarProps {
  mode: ResourceMode;
  difficulty: Difficulty;
  date: string;
  status: GameStatus;
  guessCount: number;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: "En cours",
  won: "Gagné",
  lost: "Perdu",
};

// XP status bar: sunken cells with contextual session info.
function Cell({ children, grow }: { children: React.ReactNode; grow?: boolean }) {
  return (
    <div
      className={`border border-[#aca899] [border-top-color:#fff] [border-left-color:#fff] px-2 py-0.5 text-[11px] text-[#3a382e] ${grow ? "flex-1" : ""}`}
    >
      {children}
    </div>
  );
}

export function StatusBar({
  mode,
  difficulty,
  date,
  status,
  guessCount,
}: StatusBarProps) {
  return (
    <div className="xp-panel flex items-stretch gap-0.5 px-0.5 py-0.5">
      <Cell grow>{STATUS_LABELS[status]} · {guessCount} essai{guessCount > 1 ? "s" : ""}</Cell>
      <Cell>Ressource : {MODE_LABELS[mode]}</Cell>
      <Cell>Difficulté : {DIFFICULTY_LABELS[difficulty]}</Cell>
      <Cell>{date}</Cell>
    </div>
  );
}
