"use client";

import { useState } from "react";
import { Flame, TrendingUp } from "lucide-react";
import { SECTION_ANALYSIS } from "@/lib/analysis";

export default function AnalysisTabs() {
  const [active, setActive] = useState(0);
  const section = SECTION_ANALYSIS[active];

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTION_ANALYSIS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-all sm:px-5 ${
              i === active
                ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {s.nameEn}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                i === active ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {s.totalQs} Qs
            </span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div
        key={section.id}
        className="mt-6 grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[1fr_300px]"
      >
        <div>
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Topic-wise questions asked per shift — {section.nameEn}
              <span className="ml-2 font-semibold text-slate-400">{section.nameHi}</span>
            </h3>
          </div>
          <div className="space-y-3">
            {section.topics.map((t, i) => (
              <div key={t.topic}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                    {t.hot && <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
                    <span className="truncate">{t.topic}</span>
                  </p>
                  <p className="shrink-0 font-mono text-[11px] text-slate-400">
                    {t.perShift} Qs/shift
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="bar-fill h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${t.weight}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-[#f6f8fc] p-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Examiner Insight
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.accuracyNote}</p>
          </div>
          <div className="mt-auto rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
              <Flame className="h-3.5 w-3.5" /> Hot for upcoming shifts
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              Flame-marked topics appeared in 80%+ of recent shifts — humare mocks bhi exactly
              isi weightage par bane hain.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
