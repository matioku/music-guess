import type { Guess, ResourceMode } from "../../types";
import { fieldsForMode } from "../../utils/display";
import { GuessRow } from "./GuessRow";

interface GuessHistoryProps {
  guesses: Guess[];
  mode: ResourceMode;
  /** Field keys unlocked by hints — highlighted in the header. */
  revealedFields?: string[];
}

// XP-style results table. Most recent guess on top so the latest feedback is
// visible without scrolling.
export function GuessHistory({ guesses, mode, revealedFields = [] }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return (
      <p className="mt-3 text-[12px] italic text-[#6b6859]">
        Aucune proposition pour l'instant — lancez-vous !
      </p>
    );
  }

  const fields = fieldsForMode(mode);

  return (
    <div className="mt-3 overflow-x-auto rounded-sm border border-[#aca899]">
      <table className="w-full border-collapse bg-white">
        <caption className="sr-only">Historique des propositions</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="xp-th px-2 py-1 text-left text-[11px] font-bold"
            >
              Proposition
            </th>
            {fields.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className={`xp-th px-2 py-1 text-left text-[11px] font-bold ${
                  revealedFields.includes(key) ? "text-feedback-correct" : ""
                }`}
              >
                {label}
                {revealedFields.includes(key) && (
                  <span aria-label=" (indice révélé)" title="Indice révélé">
                    {" "}
                    💡
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...guesses].reverse().map((guess, i) => (
            <GuessRow key={guesses.length - 1 - i} guess={guess} mode={mode} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
