import type { Difficulty, CoverMode } from "../types";

export interface DifficultyConfig {
  maxAttempts: number;
  coverMode: CoverMode;
  initialBlur: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { maxAttempts: Infinity, coverMode: "visible",  initialBlur: 0 },
  medium: { maxAttempts: 8,        coverMode: "blurred",  initialBlur: 2 },
  hard:   { maxAttempts: 6,        coverMode: "blurred",  initialBlur: 4 },
  expert: { maxAttempts: 4,        coverMode: "hidden",   initialBlur: 0 },
};
