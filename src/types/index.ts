export type ResourceMode  = "release" | "artist";
export type Difficulty    = "easy" | "medium" | "hard" | "expert";
export type GameStatus    = "playing" | "won" | "lost" | "error";
export type CoverMode     = "visible" | "blurred" | "hidden";
export type HintType      =
  | { kind: "blur" }
  | { kind: "field"; field: string };
export type FieldFeedback = "correct" | "wrong" | "partial" | "higher" | "lower";

export interface ReleaseGroup {
  kind: "release";
  mbid: string;
  title: string;
  artist: string;
  artistMbid: string;
  year: number | null;
  primaryType: string | null;
  secondaryTypes: string[];
  country: string | null;
  label: string | null;
  tags: string[];
  coverArtUrl: string | null;
}

export interface Artist {
  kind: "artist";
  mbid: string;
  name: string;
  type: string | null;
  country: string | null;
  area: string | null;
  careerStart: number | null;
  careerEnd: number | null;
  tags: string[];
  imageUrl: string | null;
}

export type Resource = ReleaseGroup | Artist;

export interface FieldComparison {
  value: string | number | null;
  feedback: FieldFeedback;
}

export interface ReleaseComparison {
  artist: FieldComparison;
  year: FieldComparison;
  type: FieldComparison;
  country: FieldComparison;
  label: FieldComparison;
  tags: FieldComparison;
}

export interface ArtistComparison {
  country: FieldComparison;
  type: FieldComparison;
  careerStart: FieldComparison;
  careerEnd: FieldComparison;
  tags: FieldComparison;
}

export interface ReleaseGuess {
  resource: ReleaseGroup;
  comparison: ReleaseComparison;
}

export interface ArtistGuess {
  resource: Artist;
  comparison: ArtistComparison;
}

export type Guess = ReleaseGuess | ArtistGuess;

export interface GameState {
  mode: ResourceMode;
  difficulty: Difficulty;
  status: GameStatus;
  targetMbid: string;
  target: Resource | null;
  guesses: Guess[];
  coverMode: CoverMode;
  blurLevel: number;
  revealedFields: string[];
  availableHint: HintType | null;
  hintsUsed: number;
  isLoadingTarget: boolean;
}

export interface SavedGame {
  date: string;
  mode: ResourceMode;
  difficulty: Difficulty;
  targetMbid: string;
  guesses: Guess[];
  status: GameStatus;
  blurLevel: number;
  revealedFields: string[];
  hintsUsed: number;
}

export interface SearchResult {
  mbid: string;
  title: string;
  subtitle: string;
}
