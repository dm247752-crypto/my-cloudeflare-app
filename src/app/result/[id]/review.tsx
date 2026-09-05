"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Flag, Lightbulb, MinusCircle, XCircle } from "lucide-react";
import type { SectionMeta } from "@/lib/exam";

export interface ReviewItem {
  qno: number;
  section: string;
  topic: string;
  difficulty: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explEn: string;
  explHi: string;
  selected: number | null;
  marked: boolean;
  status: "correct" | "wrong" | "skipped";
}

type Filter = "all" | "correct" | "wrong" | "skipped";

export default function ResultReview({
  review,
  sections,
}: {
  review: ReviewItem[];
  sections: SectionMeta[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    return {
      all: review.length,
      correct: review.filter((r) => r.status === "correct").length,
      wrong: review.filter((r) => r.status === "wrong").length,
      skipped: review.filter((r) => r.status === "skipped").length,
    };
  }, [review]);

  const items = useMemo(
    () => (filter === "all" ? review : review.filter((r) => r.status === filter)),
    [filter, review],
  );

  const sectionLabel = (id: string) =>
    sections.find((s) => s.id === id)?.nameEn ?? id;

  const FILTERS: { key: Filter; label: string; cls: string; activeCls: string }[] = [
    { key: "all", label: "All", cls: "text-slate-600 border-slate-200 bg-white", activeCls: "bg-slate-800 text-white border-transparent" },
    { key: "correct", label: "Correct", cls: "text-emerald-600 border-emerald-200 bg-white", activeCls: "bg-emerald-500 text-white border-transparent" },
    { key: "wrong", label: "Wrong", cls: "text-rose-600 border-rose-200 bg-white", activeCls: "bg-rose-500 text-white border-transparent" },
    { key: "skipped", label: "Skipped", cls: "text-slate-500 border-slate-200 bg-white", activeCls: "bg-slate-400 text-white border-transparent" },
  ];

  return (
    <div>
      {/* filters */}
      <div className="sticky top-16 z-30 -mx-2 flex flex-wrap gap-2 bg-[#f6f8fc]/90 px-2 py-3 backdrop-blur-lg">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition sm:text-sm ${
              filter === f.key ? f.activeCls : `${f.cls} hover:border-slate-300`
            }`}
          >
            {f.label} · {counts[f.key]}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="mt-4 space-y-4">
        {items.map((q) => (
          <article
            key={q.qno}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <span className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-extrabold text-white">
                Q.{q.qno}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {sectionLabel(q.section)} · {q.topic} ·{" "}
                <span className="capitalize">{q.difficulty}</span>
              </span>
              <span className="ml-auto flex items-center gap-2">
                {q.marked && (
                  <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                    <Flag className="h-3 w-3" /> Review
                  </span>
                )}
                {q.status === "correct" && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600">
                    <BadgeCheck className="h-3 w-3" /> +1 Correct
                  </span>
                )}
                {q.status === "wrong" && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-rose-600">
                    <XCircle className="h-3 w-3" /> −0.33 Wrong
                  </span>
                )}
                {q.status === "skipped" && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-500">
                    <MinusCircle className="h-3 w-3" /> Skipped
                  </span>
                )}
              </span>
            </div>

            <div className="px-5 py-4">
              <p className="whitespace-pre-line text-[15px] font-semibold leading-relaxed text-slate-900">
                {q.questionEn}
              </p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-500">
                {q.questionHi}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.optionsEn.map((opt, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isPicked = q.selected === i;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : isPicked
                            ? "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-50/50 text-slate-500"
                      }`}
                    >
                      <span className="mr-1.5 font-bold">({i + 1})</span>
                      {opt}
                      <span className="ml-2 block text-xs opacity-70 sm:ml-0 sm:inline">
                        {q.optionsHi[i]}
                        {isCorrect && " ✓"}
                        {isPicked && !isCorrect && " — your answer"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  <Lightbulb className="h-3.5 w-3.5" /> Solution / हल
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{q.explEn}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{q.explHi}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
