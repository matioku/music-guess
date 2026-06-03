import type { HintType } from "../../types";
import { fieldLabel } from "../../utils/display";

interface HintPanelProps {
  hint: HintType;
  onTake: () => void;
  onSkip: () => void;
}

function describe(hint: HintType): string {
  return hint.kind === "blur"
    ? "Réduire le flou de la pochette"
    : `Révéler le champ « ${fieldLabel(hint.field)} »`;
}

// XP info-bar offering the next scheduled hint. Taking it applies the hint
// (de-blur or field reveal) via the reducer; skipping consumes the slot.
export function HintPanel({ hint, onTake, onSkip }: HintPanelProps) {
  return (
    <div
      role="status"
      className="mt-3 flex flex-wrap items-center gap-2 rounded-sm border border-[#d6b34a] bg-[#fcf3d0] px-3 py-2 text-[12px]"
    >
      <span aria-hidden="true" className="text-[15px]">
        💡
      </span>
      <span className="flex-1">
        <span className="font-semibold">Indice disponible :</span> {describe(hint)}
      </span>
      <button type="button" className="xp-button px-3 py-1" onClick={onTake}>
        Prendre l'indice
      </button>
      <button type="button" className="xp-button px-3 py-1" onClick={onSkip}>
        Ignorer
      </button>
    </div>
  );
}
