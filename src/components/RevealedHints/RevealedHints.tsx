import type { Resource } from "../../types";
import { fieldLabel, targetFieldValue } from "../../utils/display";

interface RevealedHintsProps {
  /** Mystery target — only the revealed fields are read from it. */
  target: Resource;
  /** Field keys the player has unlocked via hints. */
  revealedFields: string[];
}

// Persistent board of hints the player has paid for: each unlocked field of the
// mystery target is shown with its actual value, so a taken hint is readable
// (the column header only flags *which* field — this shows *what* it is).
export function RevealedHints({ target, revealedFields }: RevealedHintsProps) {
  if (revealedFields.length === 0) return null;

  return (
    <div className="mt-3 rounded-sm border border-[#5a9a5a] bg-[#eaf6ea] px-3 py-2 text-[12px]">
      <p className="mb-1 flex items-center gap-1.5 font-semibold text-feedback-correct">
        <span aria-hidden="true">💡</span>
        Indices révélés
      </p>
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5">
        {revealedFields.map((key) => (
          <div key={key} className="contents">
            <dt className="font-semibold text-[#3a3a3a]">{fieldLabel(key)} :</dt>
            <dd className="break-words text-[#1a1a1a]">
              {targetFieldValue(target, key)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
