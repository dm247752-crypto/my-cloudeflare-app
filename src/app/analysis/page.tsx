import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardList,
  Flame,
  Gauge,
  Lightbulb,
  TrainFront,
} from "lucide-react";
import AnalysisTabs from "../analysis-tabs";
import { DIFFICULTY_SPLIT, PREDICTIONS, SHIFTS_ANALYZED, CYCLES } from "@/lib/analysis";

export const metadata = {
  title: "Shift Analysis — RailPrep",
  description:
    "Topic-wise weightage analysis of 68+ RRB NTPC & Group D shifts with predictions for upcoming exams.",
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <TrainFront className="h-4 w-4" />
            </span>
            <span className="text-sm font-extrabold">RailPrep · Shift Analysis</span>
          </div>
          <a
            href="/#tests"
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 sm:text-sm"
          >
            Take a Test
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-extrabold text-indigo-600">
            <BarChart3 className="h-3.5 w-3.5" />
            {SHIFTS_ANALYZED} shifts · question-by-question tagged
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Har shift ne kya poocha — aur aage kya aayega
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {CYCLES} ke memory-based papers ko topic-by-topic analyse karke weightage nikala gaya
            hai. Isi data par humare sabhi mock tests bane hain — isliye distribution bilkul real
            shift jaisi lagti hai.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <AnalysisTabs />

        {/* difficulty + predictions */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
              <Gauge className="h-4 w-4 text-indigo-600" />
              Overall difficulty split across shifts
            </h3>
            <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
              {DIFFICULTY_SPLIT.map((d) => (
                <div key={d.label} className={`${d.cls} bar-fill h-full`} style={{ width: `${d.pct}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {DIFFICULTY_SPLIT.map((d) => (
                <span key={d.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className={`h-2.5 w-2.5 rounded-sm ${d.cls}`} />
                  {d.label} · <span className="font-extrabold text-slate-800">{d.pct}%</span>
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Mock ka difficulty curve bhi exactly yehi hai — 58 easy, 32 moderate, 10 tough.
              False confidence nahi, real readiness milegi.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              High-yield predictions for upcoming shifts
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {PREDICTIONS.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700"
                >
                  <Flame className="h-3 w-3 text-orange-500" />
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Ye topics last {SHIFTS_ANALYZED} shifts mein sabse zyada puche gaye. In sabke naye
              variants mock tests mein already included hain.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-7 text-white sm:flex-row sm:px-8">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <ClipboardList className="h-9 w-9 shrink-0 text-amber-300" />
            <div>
              <p className="text-lg font-extrabold sm:text-xl">
                Analysis dekh li? Ab paper do — real timer ke saath
              </p>
              <p className="text-sm text-indigo-100">
                NTPC UG aur Group D ke full mocks free hain. No login, no sign-up.
              </p>
            </div>
          </div>
          <a
            href="/#tests"
            className="flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
          >
            Start Free Test <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
