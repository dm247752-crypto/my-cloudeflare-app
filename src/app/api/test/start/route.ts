import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { attempts, questions, tests } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; slug?: string };
    const name = (body.name ?? "").trim().slice(0, 60) || "Candidate";
    const slug = (body.slug ?? "").trim();

    if (!slug) {
      return NextResponse.json({ error: "Test slug missing" }, { status: 400 });
    }

    const [test] = await db
      .select()
      .from(tests)
      .where(and(eq(tests.slug, slug), eq(tests.active, true)));

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const allQuestions = await db
      .select({
        id: questions.id,
        qno: questions.qno,
        section: questions.section,
        topic: questions.topic,
        questionEn: questions.questionEn,
        questionHi: questions.questionHi,
        optionsEn: questions.optionsEn,
        optionsHi: questions.optionsHi,
      })
      .from(questions)
      .where(eq(questions.testId, test.id))
      .orderBy(asc(questions.qno));

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "Question bank not seeded yet." },
        { status: 500 },
      );
    }

    const [attempt] = await db
      .insert(attempts)
      .values({ candidateName: name, testId: test.id })
      .returning({ id: attempts.id, startedAt: attempts.startedAt });

    return NextResponse.json({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      test: {
        title: test.title,
        titleHi: test.titleHi,
        exam: test.exam,
        durationSec: test.durationSec,
        totalQuestions: test.totalQuestions,
        sections: test.sections,
      },
      questions: allQuestions, // correct answers are never sent to the client
    });
  } catch (err) {
    console.error("start error", err);
    return NextResponse.json(
      { error: "Could not start the test. Please try again." },
      { status: 500 },
    );
  }
}
