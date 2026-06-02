import type {
  Resource,
  ReleaseGroup,
  Artist,
  ReleaseComparison,
  ArtistComparison,
  FieldComparison,
} from "../types";

function compareString(
  guess: string | null,
  target: string | null
): FieldComparison {
  if (guess === null || target === null) return { value: guess, feedback: "wrong" };
  return { value: guess, feedback: guess === target ? "correct" : "wrong" };
}

function compareNumber(
  guess: number | null,
  target: number | null
): FieldComparison {
  if (guess === null || target === null) return { value: guess, feedback: "wrong" };
  if (guess === target) return { value: guess, feedback: "correct" };
  return { value: guess, feedback: guess > target ? "lower" : "higher" };
}

function compareTags(guess: string[], target: string[]): FieldComparison {
  const targetSet = new Set(target);
  const intersection = guess.filter((t) => targetSet.has(t));
  const displayValue = guess.join(", ");

  if (intersection.length === 0) return { value: displayValue, feedback: "wrong" };
  if (intersection.length === guess.length && guess.length === target.length) {
    return { value: displayValue, feedback: "correct" };
  }
  return { value: displayValue, feedback: "partial" };
}

function compareRelease(
  guess: ReleaseGroup,
  target: ReleaseGroup
): ReleaseComparison {
  return {
    artist:  compareString(guess.artist, target.artist),
    year:    compareNumber(guess.year, target.year),
    type:    compareString(guess.primaryType, target.primaryType),
    country: compareString(guess.country, target.country),
    label:   compareString(guess.label, target.label),
    tags:    compareTags(guess.tags, target.tags),
  };
}

function compareArtist(guess: Artist, target: Artist): ArtistComparison {
  return {
    country:     compareString(
                   guess.country ?? guess.area,
                   target.country ?? target.area
                 ),
    type:        compareString(guess.type, target.type),
    careerStart: compareNumber(guess.careerStart, target.careerStart),
    careerEnd:   compareNumber(guess.careerEnd, target.careerEnd),
    tags:        compareTags(guess.tags, target.tags),
  };
}

export function compareResources(
  guess: Resource,
  target: Resource
): ReleaseComparison | ArtistComparison {
  if (guess.kind === "release" && target.kind === "release") {
    return compareRelease(guess, target);
  }
  if (guess.kind === "artist" && target.kind === "artist") {
    return compareArtist(guess, target);
  }
  throw new Error(
    `Kind mismatch: guess="${guess.kind}", target="${target.kind}"`
  );
}
