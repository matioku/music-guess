import type { Difficulty, ResourceMode, HintType } from "../types";

const HINT_INTERVAL = 2;

const RELEASE_FIELDS = ["artist", "year", "type", "country", "label", "tags"];
const ARTIST_FIELDS  = ["type", "careerStart", "country", "area", "tags"];

export function getHintSchedule(
  difficulty: Difficulty,
  mode: ResourceMode
): HintType[] {
  if (difficulty === "easy") return [];

  const fields = mode === "release" ? RELEASE_FIELDS : ARTIST_FIELDS;

  if (difficulty === "expert") {
    // Cover is hidden — blur hints don't apply, only field reveals
    return fields.slice(0, 2).map((field) => ({ kind: "field" as const, field }));
  }

  // medium: [blur, field, blur, field] — 4 slots, hint every 2 guesses up to 8
  // hard:   [blur, field, blur]        — 3 slots, hint every 2 guesses up to 6
  //         (3rd slot at guess 6 is unreachable since game ends at 6th wrong guess)
  const schedule: HintType[] = [];
  const totalSlots = difficulty === "medium" ? 4 : 3;
  let fi = 0;

  for (let i = 0; i < totalSlots; i++) {
    if (i % 2 === 0) {
      schedule.push({ kind: "blur" });
    } else if (fi < fields.length) {
      schedule.push({ kind: "field", field: fields[fi++] });
    }
  }

  return schedule;
}

export function computeAvailableHint(
  guessCount: number,
  difficulty: Difficulty,
  mode: ResourceMode,
  hintsUsed: number
): HintType | null {
  const schedule = getHintSchedule(difficulty, mode);
  if (hintsUsed >= schedule.length) return null;

  const threshold = (hintsUsed + 1) * HINT_INTERVAL;
  if (guessCount < threshold) return null;

  return schedule[hintsUsed];
}
