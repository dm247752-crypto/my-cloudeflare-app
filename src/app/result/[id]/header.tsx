"use client";

import Link from "next/link";
import {
  AlarmClock,
  ArrowLeft,
  BadgeCheck,
  Crosshair,
  RotateCcw,
  Target,
  TrainFront,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { formatTime } from "@/lib/exam";

export default function ResultHeader({
  candidateName,
  testTitle,
  examLabel,
  score,
  total,
  correct,
  wrong,
  unattempted,
  attemptedPct,
  accuracy,
  timeUsedSec,
  safeScore,
  diffFromSafe,
}: {
  candidateName: string;
  testTitle: string;
  examLabel: string;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  attemptedPct: number;
  accuracy: number;
  timeUsedSec: number;
  safeScore: number;
  diffFromSafe: number;
}) {
  const pct = Math.max(0, Math.min(100, (score / Math.max(1, total)) * 100));
  const C = 2 * Math.PI * 54;
  const cleared = score >= safeScore;
  const ringColor = cleared ? "#10b981" : score >= total * 0.4 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <TrainFront className="h-4 w-4 text-indigo-600" />
            Test Report
          </div>
          <Link
            href="/#tests"
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-indigo-500 sm:text-sm"
          >
            <RotateCcw className="h-4 w-4" /> More Tests
          </Link>
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[340px_1fr]">
          {/* Score ring */}
          <div className="animate-rise mx-auto flex flex-col items-center">
            <div className="relative">
              <svg width="190" height="190" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#e2e8f0" strokeWidth="11" />
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  transform="rotate(-90 70 70)"
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold tabular-nums text-slate-900">
                  {Number.isInteger(score) ? score : score.toFixed(2)}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  out of {total}
                </span>
              </div>
            </div>
            <div
              className={`mt-3 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold ${
                cleared ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {cleared
                ? `Safe zone! +${diffFromSafe} above indicative cut-off`
                : `${Math.abs(diffFromSafe)} marks short of safe score (${safeScore})`}
            </div>
          </div>

          {/* Details */}
          <div className="animate-rise-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              {examLabel} · Mock Result
            </p>
            <h1 className="mt-1.5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Shabash, {candidateName}!
            </h1>
            <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-slate-500">{testTitle}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
              Detailed analysis neeche hai — section-wise score, weak topics aur har question ka
              solution.{" "}
              {unattempted > 25
                ? "Bahut saare questions skip hue — next attempt mein zyada attempt karne ki strategy try karo."
                : accuracy < 70
                  ? "Accuracy improve karo — negative marking se marks bachao."
                  : "Solid attempt! Ab weak topics polish karo."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: BadgeCheck, v: correct, l: "Correct", cls: "text-emerald-500 bg-emerald-50" },
                { icon: XCircle, v: wrong, l: "Wrong (−⅓ each)", cls: "text-rose-500 bg-rose-50" },
                { icon: Crosshair, v: `${accuracy}%`, l: "Accuracy", cls: "text-indigo-500 bg-indigo-50" },
                { icon: Target, v: `${attemptedPct}%`, l: "Attempted", cls: "text-amber-500 bg-amber-50" },
                { icon: AlarmClock, v: formatTime(timeUsedSec), l: "Time Used", cls: "text-violet-500 bg-violet-50" },
                { icon: TrendingUp, v: unattempted, l: "Unattempted", cls: "text-slate-400 bg-slate-100" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.cls}`}>
                    <s.icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-xl font-extrabold tabular-nums text-slate-900">{s.v}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
