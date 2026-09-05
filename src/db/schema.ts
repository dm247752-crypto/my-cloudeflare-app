import {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export type AnswerMap = Record<
  string,
  {
    selected: number | null;
    marked: boolean;
    visited: boolean;
  }
>;

export type SectionStats = Record<
  string,
  { correct: number; wrong: number; skipped: number; score: number }
>;

export interface SectionMeta {
  id: string;
  nameEn: string;
  nameHi: string;
  from: number;
  to: number;
  count: number;
}

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  exam: text("exam").notNull(), // NTPC_UG | GROUP_D
  setNo: integer("set_no").notNull(),
  title: text("title").notNull(),
  titleHi: text("title_hi").notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull().default("Free"), // Free | New | Trending
  usersLabel: text("users_label").notNull().default("0 attempts"),
  durationSec: integer("duration_sec").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  totalMarks: integer("total_marks").notNull(),
  sections: jsonb("sections").notNull().$type<SectionMeta[]>(),
  active: boolean("active").notNull().default(true),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  qno: integer("qno").notNull(),
  section: text("section").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(), // easy | moderate | hard
  questionEn: text("question_en").notNull(),
  questionHi: text("question_hi").notNull(),
  optionsEn: jsonb("options_en").notNull().$type<string[]>(),
  optionsHi: jsonb("options_hi").notNull().$type<string[]>(),
  correctIndex: integer("correct_index").notNull(),
  explEn: text("expl_en").notNull(),
  explHi: text("expl_hi").notNull(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  testId: integer("test_id"),
  candidateName: text("candidate_name").notNull(),
  status: text("status").notNull().default("in_progress"), // in_progress | submitted
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  timeUsedSec: integer("time_used_sec"),
  answers: jsonb("answers").$type<AnswerMap>(),
  score: real("score"),
  correct: integer("correct"),
  wrong: integer("wrong"),
  unattempted: integer("unattempted"),
  sectionStats: jsonb("section_stats").$type<SectionStats>(),
});
