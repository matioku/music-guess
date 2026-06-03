import type { Guess, ResourceMode, FieldComparison } from "../../types";
import { fieldsForMode, FEEDBACK_META } from "../../utils/display";

interface GuessRowProps {
  guess: Guess;
  mode: ResourceMode;
  /** Winning guess — highlighted with a pale-green background. */
  highlight?: boolean;
}

function formatValue(value: FieldComparison["value"]): string {
  if (value === null || value === "") return "—";
  return String(value);
}

function FieldCell({ field }: { field: FieldComparison }) {
  const meta = FEEDBACK_META[field.feedback];
  return (
    <td className={`border-b border-[#e3dfc8] px-2 py-1.5 align-top ${meta.cell}`}>
      <span className="flex items-start gap-1.5">
        <span
          aria-hidden="true"
          className={`mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
        />
        <span className="min-w-0">
          <span className="break-words">{formatValue(field.value)}</span>
          <span className="ml-1 font-semibold" aria-hidden="true">
            {meta.icon}
          </span>
          <span className="sr-only"> — {meta.label}</span>
        </span>
      </span>
    </td>
  );
}

// One comparison row: the guessed resource's name, then a colour/icon/text
// cell per field (never colour alone — RGAA).
export function GuessRow({ guess, mode, highlight }: GuessRowProps) {
  const name =
    guess.resource.kind === "release" ? guess.resource.title : guess.resource.name;
  const comparison = guess.comparison as unknown as Record<string, FieldComparison>;

  return (
    <tr className={`text-[12px] ${highlight ? "ring-2 ring-inset ring-feedback-correct" : ""}`}>
      <th
        scope="row"
        className={`border-b border-[#e3dfc8] px-2 py-1.5 text-left align-top font-semibold text-[#1a1a1a] ${highlight ? "bg-feedback-correct-bg" : "bg-white"}`}
      >
        {name}
      </th>
      {fieldsForMode(mode).map(({ key }) => (
        <FieldCell key={key} field={comparison[key]} />
      ))}
    </tr>
  );
}
