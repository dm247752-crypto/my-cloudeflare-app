// Aggregated analysis of RRB NTPC (UG level) CBT-1 previous shifts
// (2020-21 cycle: 23+ shifts & 2025 cycle: 45+ shifts) — used for the
// "Shift Analysis" dashboard and to weight the mock's question distribution.

export interface TopicWeight {
  topic: string;
  perShift: string; // typical questions per shift
  weight: number; // 0-100, relative emphasis (bar width)
  hot?: boolean; // high-yield prediction for upcoming shifts
}

export interface SectionAnalysis {
  id: string;
  nameEn: string;
  nameHi: string;
  totalQs: number;
  accuracyNote: string;
  topics: TopicWeight[];
}

export const SHIFTS_ANALYZED = "68+";
export const CYCLES = "NTPC UG 2020-21 & 2025 CBT-1";

export const SECTION_ANALYSIS: SectionAnalysis[] = [
  {
    id: "MATH",
    nameEn: "Mathematics",
    nameHi: "गणित",
    totalQs: 30,
    accuracyNote:
      "Arithmetic dominates (~60% of the section). DI appears on almost every shift as a 3–4 question set.",
    topics: [
      { topic: "Number System, HCF-LCM", perShift: "3–4", weight: 72, hot: true },
      { topic: "Percentage, Ratio & Partnership", perShift: "3–5", weight: 88, hot: true },
      { topic: "Profit, Loss & Discount", perShift: "2–4", weight: 80, hot: true },
      { topic: "Speed, Trains, Time & Work", perShift: "4–6", weight: 96, hot: true },
      { topic: "Simple & Compound Interest", perShift: "2–3", weight: 58 },
      { topic: "Average, Ages & Mixture", perShift: "2–3", weight: 55 },
      { topic: "Mensuration (2D + 3D)", perShift: "2–4", weight: 74, hot: true },
      { topic: "Trigonometry & Height-Distance", perShift: "2–3", weight: 62 },
      { topic: "Algebra (identities, equations)", perShift: "1–3", weight: 48 },
      { topic: "Data Interpretation (table/bar)", perShift: "3–5", weight: 84, hot: true },
      { topic: "Statistics & Probability", perShift: "1–2", weight: 38 },
    ],
  },
  {
    id: "REASONING",
    nameEn: "General Intelligence & Reasoning",
    nameHi: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति",
    totalQs: 30,
    accuracyNote:
      "Scoring section — 24+ attempts with 90% accuracy is common among selected candidates. Series & coding appear daily.",
    topics: [
      { topic: "Series (Number / Letter / Alpha-numeric)", perShift: "3–5", weight: 90, hot: true },
      { topic: "Coding-Decoding (2 patterns)", perShift: "3–5", weight: 92, hot: true },
      { topic: "Analogy & Classification", perShift: "4–6", weight: 95, hot: true },
      { topic: "Blood Relation & Direction", perShift: "3–4", weight: 78, hot: true },
      { topic: "Syllogism & Statement-Conclusion", perShift: "2–4", weight: 70 },
      { topic: "Puzzles & Seating Arrangement", perShift: "3–5", weight: 82, hot: true },
      { topic: "Mathematical Operations / Puzzles", perShift: "2–3", weight: 60 },
      { topic: "Clock, Calendar & Mirror Image", perShift: "1–3", weight: 52 },
      { topic: "Venn Diagram, Dice, Counting", perShift: "2–4", weight: 66 },
    ],
  },
  {
    id: "GA",
    nameEn: "General Awareness",
    nameHi: "सामान्य जागरूकता",
    totalQs: 40,
    accuracyNote:
      "Decides merit. Current affairs window: last 12–15 months. Science is heavily NCERT (Class 9–10) based.",
    topics: [
      { topic: "Current Affairs (12–15 months)", perShift: "8–12", weight: 100, hot: true },
      { topic: "General Science (Phy/Chem/Bio)", perShift: "9–12", weight: 97, hot: true },
      { topic: "History & Culture", perShift: "6–8", weight: 80, hot: true },
      { topic: "Indian Polity & Constitution", perShift: "4–6", weight: 72 },
      { topic: "Geography (India + World)", perShift: "4–6", weight: 70 },
      { topic: "Static GK (Awards, Books, Sports, HQ)", perShift: "3–5", weight: 64, hot: true },
      { topic: "Economy & Banking Basics", perShift: "2–3", weight: 45 },
      { topic: "Computers & Environment", perShift: "2–4", weight: 50 },
    ],
  },
];

export const DIFFICULTY_SPLIT = [
  { label: "Easy", pct: 58, cls: "bg-emerald-500" },
  { label: "Moderate", pct: 32, cls: "bg-amber-500" },
  { label: "Tough", pct: 10, cls: "bg-rose-500" },
];

export const PREDICTIONS = [
  "Trains + Speed & Distance",
  "Coding-Decoding (letter shift)",
  "Paris 2024 Olympics & sports awards",
  "Articles & Fundamental Rights",
  "Profit & Loss successive discount",
  "Seating arrangement (single row)",
  "Vitamins & deficiency diseases",
  "Dams, National Parks & Lakes",
  "Number series (×2 + k pattern)",
  "Battle & Invention based history",
];
