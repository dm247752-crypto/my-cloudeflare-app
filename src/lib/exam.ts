export interface SectionMeta {
  id: string;
  nameEn: string;
  nameHi: string;
  from: number;
  to: number;
  count: number;
}

export const MARKS_PER_CORRECT = 1;
export const NEGATIVE_MARK = 1 / 3;
export const SAFE_SCORE_UR = 72; // indicative NTPC UG safe score
export const SAFE_SCORE_UR_GROUP_D = 70;

export const NTPC_SECTIONS: SectionMeta[] = [
  { id: "MATH", nameEn: "Mathematics", nameHi: "गणित", from: 1, to: 30, count: 30 },
  {
    id: "REASONING",
    nameEn: "General Intelligence & Reasoning",
    nameHi: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति",
    from: 31,
    to: 60,
    count: 30,
  },
  { id: "GA", nameEn: "General Awareness", nameHi: "सामान्य जागरूकता", from: 61, to: 100, count: 40 },
];

export const GROUP_D_SECTIONS: SectionMeta[] = [
  { id: "MATH", nameEn: "Mathematics", nameHi: "गणित", from: 1, to: 25, count: 25 },
  {
    id: "REASONING",
    nameEn: "General Intelligence & Reasoning",
    nameHi: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति",
    from: 26,
    to: 55,
    count: 30,
  },
  { id: "SCIENCE", nameEn: "General Science", nameHi: "सामान्य विज्ञान", from: 56, to: 80, count: 25 },
  {
    id: "GA",
    nameEn: "General Awareness & Current Affairs",
    nameHi: "सामान्य जागरूकता एवं समसामयिकी",
    from: 81,
    to: 100,
    count: 20,
  },
];

// Legacy alias used by older screens
export const SECTIONS = NTPC_SECTIONS;
export const DURATION_SEC = 90 * 60;

export function sectionOfQno(sections: SectionMeta[], qno: number): SectionMeta {
  const s = sections.find((sec) => qno >= sec.from && qno <= sec.to);
  return s ?? sections[0];
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export const EXAM_LABEL: Record<string, string> = {
  NTPC_UG: "RRB NTPC (UG)",
  GROUP_D: "RRB Group D (Level-1)",
};
