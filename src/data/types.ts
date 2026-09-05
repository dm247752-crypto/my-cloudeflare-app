export type SectionId = string; // MATH | REASONING | GA | SCIENCE | ...
export type Difficulty = "easy" | "moderate" | "hard";

export interface Localized {
  q: string;
  opts: string[];
  exp: string;
}

export interface MockQuestion {
  qno: number;
  section: SectionId;
  topic: string;
  difficulty: Difficulty;
  en: Localized;
  hi: Localized;
  correct: number; // 0..3
}
