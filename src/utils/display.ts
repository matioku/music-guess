// Shared French display metadata for the UI layer. Keeps labels and the
// colour/icon mapping for field feedback in one place so every component
// renders comparisons consistently (and never relies on colour alone — RGAA).

import type { ResourceMode, Difficulty, FieldFeedback } from "../types";

export const MODE_LABELS: Record<ResourceMode, string> = {
  release: "Release",
  artist: "Artiste",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  expert: "Expert",
};

// Difficulties exposed in the toolbar, in display order.
export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];

// Column order + labels per mode, matching the comparison objects in compare.ts.
export const RELEASE_FIELDS: { key: string; label: string }[] = [
  { key: "artist", label: "Artiste" },
  { key: "year", label: "Année" },
  { key: "type", label: "Type" },
  { key: "country", label: "Pays" },
  { key: "label", label: "Label" },
  { key: "tags", label: "Genres" },
];

export const ARTIST_FIELDS: { key: string; label: string }[] = [
  { key: "country", label: "Pays" },
  { key: "type", label: "Type" },
  { key: "careerStart", label: "Début" },
  { key: "careerEnd", label: "Fin" },
  { key: "tags", label: "Genres" },
];

export function fieldsForMode(mode: ResourceMode) {
  return mode === "release" ? RELEASE_FIELDS : ARTIST_FIELDS;
}

// Labels for every field key a hint can reference (the hint schedule in
// hints.ts uses a couple of keys, e.g. "area", that aren't dedicated columns).
const FIELD_LABELS: Record<string, string> = {
  artist: "Artiste",
  year: "Année",
  type: "Type",
  country: "Pays",
  area: "Pays / origine",
  label: "Label",
  careerStart: "Début de carrière",
  careerEnd: "Fin de carrière",
  tags: "Genres",
};

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export interface FeedbackMeta {
  /** Short symbol doubled with the colour (accessibility). */
  icon: string;
  /** Screen-reader / tooltip label. */
  label: string;
  /** Tailwind classes for the cell background + text colour. */
  cell: string;
  /** Tailwind classes for the status dot. */
  dot: string;
}

export const FEEDBACK_META: Record<FieldFeedback, FeedbackMeta> = {
  correct: {
    icon: "✓",
    label: "exact",
    cell: "bg-feedback-correct-bg text-feedback-correct",
    dot: "bg-feedback-correct",
  },
  wrong: {
    icon: "✗",
    label: "aucun",
    cell: "bg-feedback-wrong-bg text-feedback-wrong",
    dot: "bg-feedback-wrong",
  },
  partial: {
    icon: "≈",
    label: "partiel",
    cell: "bg-feedback-partial-bg text-feedback-partial",
    dot: "bg-feedback-partial",
  },
  higher: {
    icon: "↑",
    label: "plus récent",
    cell: "bg-feedback-wrong-bg text-feedback-wrong",
    dot: "bg-feedback-wrong",
  },
  lower: {
    icon: "↓",
    label: "plus ancien",
    cell: "bg-feedback-wrong-bg text-feedback-wrong",
    dot: "bg-feedback-wrong",
  },
};
