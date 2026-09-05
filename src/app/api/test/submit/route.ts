import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  attempts,
  questions,
  tests,
  type AnswerMap,
  type SectionMeta,
} from "@/db/schema";
import { MARKS_PER_CORRECT, NEGATIVE_MARK } from "@/lib/exam";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      attemptId?: number;
      answers?: AnswerMap;
      timeUsedSec?: number;
    };

    if (!body.attemptId) {
      return NextResponse.json({ error: "attemptId missing" }, { status: 400 });
    }

    const [attempt] = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, body.attemptId));

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Idempotent: if already submitted, just return the id
    if (attempt.status === "submitted") {
      return NextResponse.json({ attemptId: attempt.id, already: true });
    }

    let sections: SectionMeta[] = [];
    if (attempt.testId) {
      const [test] = await db.select().from(tests).where(eq(tests.id, attempt.testId));
      if (test) sections = test.sections;
    }

    const allQuestions = await db
      .select({
        id: questions.id,
        qno: questions.qno,
        section: questions.section,
        correctIndex: questions.correctIndex,
      })
      .from(questions)
      .where(attempt.testId ? eq(questions.testId, attempt.testId) : undefined);

    const byId = new Map(allQuestions.map((q) => [q.id, q]));
    const answers = body.answers ?? {};

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    const sectionStats: Record<
      string,
      { correct: number; wrong: number; skipped: number; score: number }
    > = {};
    for (const s of sections) {
      sectionStats[s.id] = { correct: 0, wrong: 0, skipped: 0, score: 0 };
    }

    for (const [qIdStr, ans] of Object.entries(answers)) {
      const q = byId.get(Number(qIdStr));
      if (!q || !ans.visited) continue;
      if (!sectionStats[q.section]) {
        sectionStats[q.section] = { correct: 0, wrong: 0, skipped: 0, score: 0 };
      }
      if (ans.selected === null || ans.selected === undefined) {
        unattempted += 1;
        sectionStats[q.section].skipped += 1;
        continue;
      }
      if (ans.selected === q.correctIndex) {
        correct += 1;
        sectionStats[q.section].correct += 1;
      } else {
        wrong += 1;
        sectionStats[q.section].wrong += 1;
      }
    }

    const score =
      Math.round((correct * MARKS_PER_CORRECT - wrong * NEGATIVE_MARK) * 100) / 100;
    for (const key of Object.keys(sectionStats)) {
      const st = sectionStats[key];
      st.score = Math.round((st.correct - st.wrong * NEGATIVE_MARK) * 100) / 100;
    }

    await db
      .update(attempts)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        timeUsedSec: Math.max(0, Math.floor(body.timeUsedSec ?? 0)),
        answers,
        score,
        correct,
        wrong,
        unattempted,
        sectionStats,
      })
      .where(eq(attempts.id, attempt.id));

    return NextResponse.json({ attemptId: attempt.id });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json(
      { error: "Submission failed. Please retry." },
      { status: 500 },
    );
  }
}
