import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { attempts, questions, tests, type SectionMeta } from "@/db/schema";
import {
  NTPC_SECTIONS,
  SAFE_SCORE_UR,
  SAFE_SCORE_UR_GROUP_D,
  EXAM_LABEL,
} from "@/lib/exam";
import ResultReview from "./review";
import ResultHeader from "./header";

export const dynamic = "force-dynamic";

export const metadata = { title: "Result & Analysis — RailPrep" };

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attemptId = Number(id);
  if (!Number.isFinite(attemptId)) notFound();

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId));
  if (!attempt) notFound();

  if (attempt.status !== "submitted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc] px-6 text-center">
        <p className="text-lg font-extrabold text-slate-800">This attempt was never submitted.</p>
        <p className="max-w-md text-sm text-slate-500">
          Results are generated only after submitting the test. Take a fresh mock instead.
        </p>
        <Link href="/" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white">
          Browse mock tests
        </Link>
      </div>
    );
  }

  let testTitle = "RRB Mock Test";
  let testExam = "NTPC_UG";
  let sections: SectionMeta[] = NTPC_SECTIONS;
  if (attempt.testId) {
    const [test] = await db.select().from(tests).where(eq(tests.id, attempt.testId));
    if (test) {
      testTitle = test.title;
      testExam = test.exam;
      sections = test.sections;
    }
  }

  const allQuestions = await db
    .select()
    .from(questions)
    .where(attempt.testId ? eq(questions.testId, attempt.testId) : undefined)
    .orderBy(asc(questions.qno));

  const ans = attempt.answers ?? {};

  const review = allQuestions.map((q) => {
    const a = ans[String(q.id)];
    const selected = a?.visited ? (a?.selected ?? null) : null;
    const status: "correct" | "wrong" | "skipped" =
      selected === null ? "skipped" : selected === q.correctIndex ? "correct" : "wrong";
    return {
      qno: q.qno,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      questionEn: q.questionEn,
      questionHi: q.questionHi,
      optionsEn: q.optionsEn,
      optionsHi: q.optionsHi,
      correctIndex: q.correctIndex,
      explEn: q.explEn,
      explHi: q.explHi,
      selected,
      marked: a?.marked ?? false,
      status,
    };
  });

  // topic stats
  const topicMap = new Map<
    string,
    { topic: string; section: string; correct: number; wrong: number; skipped: number }
  >();
  for (const r of review) {
    const key = `${r.section}::${r.topic}`;
    const t = topicMap.get(key) ?? {
      topic: r.topic,
      section: r.section,
      correct: 0,
      wrong: 0,
      skipped: 0,
    };
    t[r.status] += 1;
    topicMap.set(key, t);
  }
  const topicStats = [...topicMap.values()].sort(
    (a, b) => b.wrong - a.wrong || b.correct - a.correct,
  );

  const total = allQuestions.length;
  const correct = attempt.correct ?? 0;
  const wrong = attempt.wrong ?? 0;
  const unattempted = attempt.unattempted ?? 0;
  const attemptedPct = total ? Math.round(((correct + wrong) / total) * 100) : 0;
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const score = attempt.score ?? 0;
  const safeScore = testExam === "GROUP_D" ? SAFE_SCORE_UR_GROUP_D : SAFE_SCORE_UR;
  const diffFromSafe = Math.round((score - safeScore) * 100) / 100;

  const secStats = (attempt.sectionStats ?? {}) as Record<
    string,
    { correct: number; wrong: number; skipped: number; score: number }
  >;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <ResultHeader
        candidateName={attempt.candidateName}
        testTitle={testTitle}
        examLabel={EXAM_LABEL[testExam] ?? "RRB Mock"}
        score={score}
        total={total}
        correct={correct}
        wrong={wrong}
        unattempted={unattempted}
        attemptedPct={attemptedPct}
        accuracy={accuracy}
        timeUsedSec={attempt.timeUsedSec ?? 0}
        safeScore={safeScore}
        diffFromSafe={diffFromSafe}
      />

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {/* ===== Section breakdown ===== */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Section-wise Performance</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sections.map((s) => {
              const st = secStats[s.id] ?? { correct: 0, wrong: 0, skipped: 0, score: 0 };
              const attempted = st.correct + st.wrong;
              const acc = attempted > 0 ? Math.round((st.correct / attempted) * 100) : 0;
              const pct = Math.max(0, Math.min(100, (st.score / s.count) * 100));
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="line-clamp-1 text-sm font-extrabold">{s.nameEn}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">{s.nameHi}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tabular-nums">{st.score}</span>
                    <span className="text-sm font-semibold text-slate-400">/ {s.count}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bar-fill h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <span className="rounded-md bg-emerald-50 py-1.5 text-emerald-600">
                      ✓ {st.correct}
                    </span>
                    <span className="rounded-md bg-rose-50 py-1.5 text-rose-600">✗ {st.wrong}</span>
                    <span className="rounded-md bg-slate-100 py-1.5 text-slate-500">
                      — {st.skipped}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Accuracy: <span className="font-bold text-slate-700">{acc}%</span> · Attempted{" "}
                    <span className="font-bold text-slate-700">
                      {attempted}/{s.count}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Topic analysis ===== */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Topic-wise Analysis</h2>
          <p className="mt-1 text-sm text-slate-500">
            Weak topics pe focus karo — yahi improvement ka shortcut hai.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="nice-scroll max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-extrabold">Topic</th>
                    <th className="px-3 py-3 font-extrabold">Section</th>
                    <th className="px-3 py-3 text-center font-extrabold text-emerald-600">Correct</th>
                    <th className="px-3 py-3 text-center font-extrabold text-rose-500">Wrong</th>
                    <th className="px-3 py-3 text-center font-extrabold">Skipped</th>
                    <th className="px-5 py-3 text-right font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topicStats.map((t) => {
                    const strong = t.wrong === 0 && t.correct > 0;
                    const weak = t.wrong > 0;
                    return (
                      <tr key={`${t.section}-${t.topic}`} className="border-t border-slate-100">
                        <td className="px-5 py-3 font-semibold text-slate-800">{t.topic}</td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {sections.find((s) => s.id === t.section)?.nameEn ?? t.section}
                        </td>
                        <td className="px-3 py-3 text-center font-extrabold tabular-nums text-emerald-600">
                          {t.correct}
                        </td>
                        <td className="px-3 py-3 text-center font-extrabold tabular-nums text-rose-500">
                          {t.wrong}
                        </td>
                        <td className="px-3 py-3 text-center tabular-nums text-slate-400">
                          {t.skipped}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                              strong
                                ? "bg-emerald-50 text-emerald-600"
                                : weak
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {strong ? "Strong" : weak ? "Needs work" : "Skipped"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===== Full review ===== */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Question-wise Review &amp; Solutions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Har question ka explanation — English aur हिंदी dono mein.
          </p>
          <div className="mt-5">
            <ResultReview review={review} sections={sections} />
          </div>
        </section>
      </main>
    </div>
  );
}
