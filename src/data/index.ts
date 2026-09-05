import type { MockQuestion } from "./types";
import { mathQuestions } from "./math";
import { reasoningQuestions } from "./reasoning";
import { gaQuestions } from "./ga";

export const mockQuestions: MockQuestion[] = [
  ...mathQuestions,
  ...reasoningQuestions,
  ...gaQuestions,
].sort((a, b) => a.qno - b.qno);

// Sanity checks (run at import time on the server/seed side)
if (mockQuestions.length !== 100) {
  throw new Error(`Expected 100 questions, found ${mockQuestions.length}`);
}
const seen = new Set<number>();
for (const q of mockQuestions) {
  if (seen.has(q.qno)) throw new Error(`Duplicate qno ${q.qno}`);
  seen.add(q.qno);
  if (q.en.opts.length !== 4 || q.hi.opts.length !== 4) {
    throw new Error(`Question ${q.qno} must have 4 options`);
  }
  if (q.correct < 0 || q.correct > 3) {
    throw new Error(`Question ${q.qno} has invalid correct index`);
  }
}

export type { MockQuestion };
