import type { MockQuestion } from "./types";
import type { SectionMeta } from "@/lib/exam";
import { NTPC_SECTIONS, GROUP_D_SECTIONS } from "@/lib/exam";

// ---- Test 1: RRB NTPC UG CBT-1 — Set 1 (existing bank) ----
import { mockQuestions as ntpc1Questions } from "./index";

// ---- Test 2: RRB NTPC UG CBT-1 — Set 2 ----
import { ntpc2Math } from "./ntpc-ug-2/math";
import { ntpc2Reasoning } from "./ntpc-ug-2/reasoning";
import { ntpc2GA } from "./ntpc-ug-2/ga";

// ---- Test 3: RRB Group D CBT — Set 1 ----
import { gdMath } from "./group-d-1/math";
import { gdReasoning } from "./group-d-1/reasoning";
import { gdScience } from "./group-d-1/science";
import { gdGA } from "./group-d-1/ga";

export interface TestDef {
  slug: string;
  exam: "NTPC_UG" | "GROUP_D";
  setNo: number;
  title: string;
  titleHi: string;
  description: string;
  badge: string;
  usersLabel: string;
  durationSec: number;
  sections: SectionMeta[];
  questions: MockQuestion[];
}

function validate(slug: string, expected: number, qs: MockQuestion[]): MockQuestion[] {
  if (qs.length !== expected) {
    throw new Error(`${slug}: expected ${expected} questions, found ${qs.length}`);
  }
  const seen = new Set<number>();
  for (const q of qs) {
    if (seen.has(q.qno)) throw new Error(`${slug}: duplicate qno ${q.qno}`);
    seen.add(q.qno);
    if (q.en.opts.length !== 4 || q.hi.opts.length !== 4)
      throw new Error(`${slug}: q${q.qno} must have 4 options`);
    if (q.correct < 0 || q.correct > 3)
      throw new Error(`${slug}: q${q.qno} invalid correct index`);
  }
  return qs.sort((a, b) => a.qno - b.qno);
}

const ntpc2 = [
  ...ntpc2Math,
  ...ntpc2Reasoning,
  ...ntpc2GA,
];

const groupD1 = [
  ...gdMath,
  ...gdReasoning,
  ...gdScience,
  ...gdGA,
];

export const TEST_DEFS: TestDef[] = [
  {
    slug: "rrb-ntpc-ug-cbt1-full-test-1",
    exam: "NTPC_UG",
    setNo: 1,
    title: "RRB NTPC UG CBT 1 Full Test 2025 — Set 1",
    titleHi: "आरआरबी एनटीपीसी UG CBT-1 फुल टेस्ट 2025 — सेट 1",
    description:
      "68+ shifts की analysis पर आधारित पहला full mock। Maths 30 · Reasoning 30 · GA 40 — सभी questions बिल्कुल नए, previous shifts से zero repeat।",
    badge: "Most Attempted",
    usersLabel: "1.2 Lakh+ attempts",
    durationSec: 90 * 60,
    sections: NTPC_SECTIONS,
    questions: validate("set1", 100, ntpc1Questions),
  },
  {
    slug: "rrb-ntpc-ug-cbt1-full-test-2",
    exam: "NTPC_UG",
    setNo: 2,
    title: "RRB NTPC UG CBT 1 Full Test 2025 — Set 2",
    titleHi: "आरआरबी एनटीपीसी UG CBT-1 फुल टेस्ट 2025 — सेट 2",
    description:
      "Upcoming shifts के लिए predicted pattern का दूसरा paper — high-yield topics के fresh variants, same difficulty curve as recent shifts।",
    badge: "New",
    usersLabel: "New Launch",
    durationSec: 90 * 60,
    sections: NTPC_SECTIONS,
    questions: validate("set2", 100, ntpc2),
  },
  {
    slug: "rrb-group-d-cbt-full-test-1",
    exam: "GROUP_D",
    setNo: 1,
    title: "RRB Group D CBT Full Test 2025 — Set 1",
    titleHi: "आरआरबी ग्रुप डी CBT फुल टेस्ट 2025 — सेट 1",
    description:
      "Level-1 (Group D) pattern: Maths 25 · Reasoning 30 · General Science 25 · GA & Current Affairs 20 — previous shift trends से बना बिल्कुल नया paper।",
    badge: "New",
    usersLabel: "New Launch",
    durationSec: 90 * 60,
    sections: GROUP_D_SECTIONS,
    questions: validate("groupd1", 100, groupD1),
  },
];

export function getTestDef(slug: string): TestDef | undefined {
  return TEST_DEFS.find((t) => t.slug === slug);
}
