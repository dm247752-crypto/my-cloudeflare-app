"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  BadgePercent,
  FileText,
  Languages,
  Search,
  Target,
  TrainFront,
  Users,
} from "lucide-react";

export interface TestCardData {
  slug: string;
  exam: string;
  title: string;
  titleHi: string;
  description: string;
  badge: string;
  usersLabel: string;
  durationSec: number;
  totalQuestions: number;
  totalMarks: number;
}

const EXAM_FILTERS = [
  { id: "ALL", label: "All Tests" },
  { id: "NTPC_UG", label: "RRB NTPC (UG)" },
  { id: "GROUP_D", label: "RRB Group D" },
];

const EXAM_META: Record<string, { label: string; grad: string }> = {
  NTPC_UG: { label: "RRB NTPC (UG) · CBT-1", grad: "from-indigo-500 to-violet-600" },
  GROUP_D: { label: "RRB Group D · Level-1", grad: "from-orange-500 to-rose-500" },
};

export default function TestList({ tests }: { tests: TestCardData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      if (filter !== "ALL" && t.exam !== filter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.titleHi.includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [tests, query, filter]);

  const exams = useMemo(() => {
    const ids = [...new Set(visible.map((t) => t.exam))];
    return ids.sort();
  }, [visible]);

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests — NTPC, Group D, CBT-1..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAM_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition sm:text-sm ${
                filter === f.id
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Koi test nahi mila — search ya filter badal kar dekho
          </p>
        </div>
      )}

      {/* Grouped cards */}
      {exams.map((exam) => (
        <div key={exam} className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 sm:text-xl">
              <TrainFront className="h-5 w-5 text-indigo-600" />
              {EXAM_META[exam]?.label ?? exam}
            </h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {visible.filter((t) => t.exam === exam).length} Tests
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible
              .filter((t) => t.exam === exam)
              .map((t) => (
                <div
                  key={t.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/10"
                >
                  <div className="flex items-start gap-3 p-5 pb-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${
                        EXAM_META[t.exam]?.grad ?? "from-indigo-500 to-violet-600"
                      }`}
                    >
                      <TrainFront className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
                          Free
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                            t.badge === "New"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {t.badge}
                        </span>
                      </div>
                      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-extrabold leading-snug text-slate-900">
                        {t.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  <div className="mx-5 border-t border-dashed border-slate-200" />

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3 text-[11.5px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      {t.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-indigo-500" />
                      {t.totalMarks} Marks
                    </span>
                    <span className="flex items-center gap-1">
                      <AlarmClock className="h-3.5 w-3.5 text-indigo-500" />
                      {Math.floor(t.durationSec / 60)} Mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Languages className="h-3.5 w-3.5 text-indigo-500" />
                      English, हिंदी
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Users className="h-4 w-4 text-slate-400" />
                      {t.usersLabel}
                    </span>
                    <Link
                      href={`/instructions/${t.slug}`}
                      className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500"
                    >
                      <BadgePercent className="hidden h-4 w-4 sm:block" />
                      Start Test
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
