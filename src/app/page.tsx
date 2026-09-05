import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Languages,
  Sparkles,
  Timer,
  TrainFront,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { db } from "@/db";
import { tests } from "@/db/schema";
import { asc } from "drizzle-orm";
import TestList from "./test-list";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Sparkles,
    title: "100% Fresh Questions",
    desc: "Har test ke questions previous shifts ke analysis se naye banaye gaye hain — koi repeat nahi.",
  },
  {
    icon: Timer,
    title: "Real CBT Interface",
    desc: "Question palette, mark-for-review, section tabs aur auto-submit timer — bilkul actual exam jaisa.",
  },
  {
    icon: Languages,
    title: "Bilingual Content",
    desc: "Questions, options aur solutions — sab English + हिंदी dono mein available.",
  },
  {
    icon: BarChart3,
    title: "Deep Result Analysis",
    desc: "Score, accuracy, section-wise report aur weak-topic detection ke saath detailed solutions.",
  },
];

export default async function HomePage() {
  const allTests = await db.select().from(tests).orderBy(asc(tests.id));

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
              <TrainFront className="h-5.5 w-5.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight">
                Rail<span className="text-indigo-600">Prep</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Railway Mock Tests
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#tests" className="transition hover:text-indigo-600">
              Mock Tests
            </a>
            <Link href="/analysis" className="transition hover:text-indigo-600">
              Shift Analysis
            </Link>
            <a href="#features" className="transition hover:text-indigo-600">
              Features
            </a>
          </nav>
          <a
            href="#tests"
            className="group flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 sm:px-5"
          >
            Free Tests <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="bg-grid-dark absolute inset-0 opacity-40" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              NTPC UG + Group D · Naye full mocks live
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Railway Exams ki
              <span className="block text-amber-300">Sabse Smart Taiyari</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Previous shifts ke deep analysis se banaye gaye full-length mocks — har question
              bilkul naya, real exam interface ke saath. Abhi free attempt karo aur apna level
              jaan lo.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#tests"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-indigo-700 shadow-xl transition hover:bg-indigo-50"
              >
                <ClipboardList className="h-4.5 w-4.5" />
                Browse Mock Tests
              </a>
              <Link
                href="/analysis"
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <BarChart3 className="h-4.5 w-4.5" />
                Shift Analysis Dekho
              </Link>
            </div>
          </div>

          {/* stats strip */}
          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: BookOpenCheck, v: "300+", l: "Fresh Questions" },
              { icon: ClipboardList, v: "3", l: "Full Mock Tests" },
              { icon: Users, v: "68+", l: "Shifts Analysed" },
              { icon: Trophy, v: "Free", l: "No Sign-up Needed" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur"
              >
                <s.icon className="h-4.5 w-4.5 text-amber-300" />
                <p className="mt-2 text-xl font-extrabold tabular-nums">{s.v}</p>
                <p className="text-[11px] font-semibold text-indigo-100">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTS ================= */}
      <section id="tests" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Free Mock Test Series
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Upcoming shifts ke liye ready papers
            </h2>
          </div>
        </div>
        <TestList
          tests={allTests.map((t) => ({
            slug: t.slug,
            exam: t.exam,
            title: t.title,
            titleHi: t.titleHi,
            description: t.description,
            badge: t.badge,
            usersLabel: t.usersLabel,
            durationSec: t.durationSec,
            totalQuestions: t.totalQuestions,
            totalMarks: t.totalMarks,
          }))}
        />
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Why RailPrep
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Sirf practice nahi — real exam simulation
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-[#f6f8fc] p-6 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-600/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
                  <f.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white sm:flex-row sm:px-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 shrink-0 text-amber-300" />
              <div>
                <p className="text-base font-extrabold sm:text-lg">
                  Pata hai upcoming shift mein kya sabse zyada aayega?
                </p>
                <p className="text-sm text-indigo-100">
                  68+ shifts ka topic-wise breakdown aur predictions dekho.
                </p>
              </div>
            </div>
            <Link
              href="/analysis"
              className="flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
            >
              View Analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <TrainFront className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-extrabold text-white">RailPrep</p>
              <p className="text-[11px]">NTPC · Group D · RRB Exams</p>
            </div>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed">
            Practice tool with original questions inspired by official RRB patterns. Not
            affiliated with Indian Railways / RRB. All mock tests are free.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <BadgeCheck className="h-4 w-4 text-emerald-400" />
            100% Free · No Login
          </div>
        </div>
      </footer>
    </div>
  );
}
