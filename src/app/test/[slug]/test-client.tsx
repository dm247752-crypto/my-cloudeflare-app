"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlarmClock,
  BookOpenCheck,
  ChevronRight,
  Eraser,
  Flag,
  Loader2,
  Send,
  User,
  X,
} from "lucide-react";
import { formatTime, sectionOfQno, type SectionMeta } from "@/lib/exam";

interface PublicQuestion {
  id: number;
  qno: number;
  section: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
}

interface TestInfo {
  title: string;
  titleHi: string;
  durationSec: number;
  totalQuestions: number;
  sections: SectionMeta[];
}

type AnswerState = {
  selected: number | null;
  marked: boolean;
  visited: boolean;
};
type Answers = Record<number, AnswerState>;

type QStatus =
  | "notvisited"
  | "notanswered"
  | "answered"
  | "marked"
  | "answered-marked";

function statusOf(a: AnswerState | undefined): QStatus {
  if (!a || !a.visited) return "notvisited";
  if (a.selected !== null && a.marked) return "answered-marked";
  if (a.marked) return "marked";
  if (a.selected !== null) return "answered";
  return "notanswered";
}

const STATUS_STYLE: Record<QStatus, string> = {
  notvisited: "border-slate-300 bg-white text-slate-600 hover:bg-slate-100",
  notanswered: "border-[#d63030] bg-[#e3352b] text-white",
  answered: "border-[#0d7d3d] bg-[#1c9e54] text-white",
  marked: "border-[#5b21b6] bg-[#7c3aed] text-white",
  "answered-marked": "border-[#5b21b6] bg-[#7c3aed] text-white",
};

const LEGEND: { key: QStatus; label: string }[] = [
  { key: "answered", label: "Answered" },
  { key: "notanswered", label: "Not Answered" },
  { key: "marked", label: "Marked for Review" },
  { key: "answered-marked", label: "Answered & Marked (evaluated)" },
  { key: "notvisited", label: "Not Visited" },
];

export default function TestClient({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = (searchParams.get("name") ?? "Candidate").trim() || "Candidate";

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [lang, setLang] = useState<"both" | "en" | "hi">("both");
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  // -------- start attempt --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/test/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start test");
        if (cancelled) return;
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setTestInfo(data.test);
        setTimeLeft(data.test.durationSec);
        startedAtRef.current = Date.now();
        setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : "Failed to start test");
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- timer --------
  useEffect(() => {
    if (phase !== "ready") return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const currentQ = questions[current];
  const sections: SectionMeta[] = testInfo?.sections ?? [];

  // -------- mark current as visited --------
  useEffect(() => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const existing = prev[currentQ.id];
      if (existing?.visited) return prev;
      return {
        ...prev,
        [currentQ.id]: {
          selected: existing?.selected ?? null,
          marked: existing?.marked ?? false,
          visited: true,
        },
      };
    });
  }, [currentQ]);

  // -------- submit --------
  const doSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !attemptId || !testInfo) return;
      submittedRef.current = true;
      setSubmitting(true);
      const timeUsedSec = Math.min(
        testInfo.durationSec,
        Math.round((Date.now() - startedAtRef.current) / 1000),
      );
      try {
        const res = await fetch("/api/test/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, answers, timeUsedSec }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submit failed");
        router.push(`/result/${data.attemptId}`);
      } catch (e) {
        submittedRef.current = false;
        setSubmitting(false);
        setShowSubmit(false);
        alert(
          (e instanceof Error ? e.message : "Submit failed") +
            (auto ? " (auto-submit)" : ""),
        );
      }
    },
    [attemptId, answers, testInfo, router],
  );

  useEffect(() => {
    if (timeLeft === 0 && phase === "ready") void doSubmit(true);
  }, [timeLeft, phase, doSubmit]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!submittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // -------- actions --------
  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < questions.length) setCurrent(idx);
    },
    [questions.length],
  );

  const saveAndNext = useCallback(() => {
    goTo(current + 1 < questions.length ? current + 1 : current);
  }, [current, questions.length, goTo]);

  const markAndNext = useCallback(() => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] ?? { selected: null, visited: true }),
        marked: true,
      },
    }));
    goTo(current + 1 < questions.length ? current + 1 : current);
  }, [currentQ, current, questions.length, goTo]);

  const clearResponse = useCallback(() => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] ?? { marked: false, visited: true }),
        selected: null,
      },
    }));
  }, [currentQ]);

  const selectOption = useCallback(
    (optIdx: number) => {
      if (!currentQ) return;
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...(prev[currentQ.id] ?? { marked: false }),
          selected: optIdx,
          visited: true,
        },
      }));
    },
    [currentQ],
  );

  // -------- counts --------
  const counts = useMemo(() => {
    const c: Record<QStatus, number> = {
      notvisited: 0,
      notanswered: 0,
      answered: 0,
      marked: 0,
      "answered-marked": 0,
    };
    for (const q of questions) c[statusOf(answers[q.id])] += 1;
    return c;
  }, [answers, questions]);

  const sectionCounts = useMemo(() => {
    return sections.map((sec) => {
      const qs = questions.filter((q) => q.section === sec.id);
      const c = { total: qs.length, answered: 0, notanswered: 0, marked: 0, notvisited: 0 };
      for (const q of qs) {
        const st = statusOf(answers[q.id]);
        if (st === "answered" || st === "answered-marked") c.answered += 1;
        else if (st === "notanswered") c.notanswered += 1;
        else if (st === "marked") c.marked += 1;
        else c.notvisited += 1;
      }
      return { ...c, sec };
    });
  }, [answers, questions, sections]);

  const activeSection = currentQ && sections.length
    ? sectionOfQno(sections, currentQ.qno)
    : null;

  // -------- render --------
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef2f7]">
        <Loader2 className="h-10 w-10 animate-spin text-[#123d6e]" />
        <div className="text-center">
          <p className="font-semibold text-slate-800">Preparing your question paper…</p>
          <p className="mt-1 text-sm text-slate-500">
            Fresh questions are being loaded from the question bank
          </p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef2f7] px-6 text-center">
        <X className="h-12 w-12 text-red-500" />
        <p className="max-w-md text-sm text-slate-600">{errorMsg}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-[#123d6e] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!currentQ || !testInfo || !activeSection) return null;

  const curAns = answers[currentQ.id];
  const lowTime = timeLeft < 600;

  return (
    <div className="flex min-h-screen select-none flex-col bg-[#eef2f7] text-slate-900">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 bg-[#123d6e] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-2 sm:px-5">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold sm:text-base">{testInfo.title}</h1>
            <p className="truncate text-[11px] text-blue-200">
              {testInfo.titleHi} &nbsp;|&nbsp; +1 Mark, −1/3 Negative
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-bold tabular-nums sm:text-xl ${
              lowTime ? "animate-pulse bg-red-600" : "bg-[#0c2c52]"
            }`}
          >
            <AlarmClock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Section tabs */}
        <div className="border-t border-white/10 bg-[#0c2c52]">
          <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 sm:px-5">
            {sections.map((sec) => {
              const active = sec.id === activeSection.id;
              const firstIdx = questions.findIndex((q) => q.section === sec.id);
              return (
                <button
                  key={sec.id}
                  onClick={() => firstIdx >= 0 && goTo(firstIdx)}
                  className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? "border-amber-400 bg-white/10 text-amber-300"
                      : "border-transparent text-blue-200 hover:bg-white/5"
                  }`}
                >
                  {sec.nameEn} <span className="opacity-60">({sec.from}–{sec.to})</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-3 p-2 sm:p-3 lg:flex-row">
        {/* ---- Question panel ---- */}
        <section className="flex min-h-[60vh] flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#123d6e] px-2.5 py-1 text-xs font-bold text-white">
                Question No. {currentQ.qno} / प्रश्न सं. {currentQ.qno}
              </span>
              <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 sm:inline">
                {activeSection.nameEn} · {currentQ.topic}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">+1.0</span>
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-600">−0.33</span>
              <div className="ml-1 flex overflow-hidden rounded-md border border-slate-200">
                {(
                  [
                    ["en", "EN"],
                    ["both", "EN+हिं"],
                    ["hi", "हिं"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setLang(val)}
                    className={`px-2 py-1 text-[11px] font-bold ${
                      lang === val
                        ? "bg-[#123d6e] text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question text */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {(lang === "en" || lang === "both") && (
              <p className="whitespace-pre-line text-[15px] font-semibold leading-relaxed text-slate-900">
                {currentQ.questionEn}
              </p>
            )}
            {(lang === "hi" || lang === "both") && (
              <p
                className={`whitespace-pre-line text-[15px] font-semibold leading-relaxed text-slate-800 ${
                  lang === "both" ? "mt-3 border-t border-dashed border-slate-200 pt-3" : ""
                }`}
              >
                {currentQ.questionHi}
              </p>
            )}

            {/* Options */}
            <div className="mt-5 space-y-2.5">
              {currentQ.optionsEn.map((opt, i) => {
                const selected = curAns?.selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    className={`flex w-full items-start gap-3 rounded-lg border-2 px-3.5 py-3 text-left transition-all ${
                      selected
                        ? "border-[#123d6e] bg-[#eaf2fb] shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-[#123d6e] bg-[#123d6e]" : "border-slate-300"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      {(lang === "en" || lang === "both") && (
                        <span className="block text-sm text-slate-800">
                          <span className="mr-1.5 font-bold text-slate-500">({i + 1})</span>
                          {opt}
                        </span>
                      )}
                      {(lang === "hi" || lang === "both") && (
                        <span
                          className={`block text-sm ${
                            lang === "both" ? "mt-0.5 text-slate-500" : "text-slate-800"
                          }`}
                        >
                          {lang === "both" ? "" : `(${i + 1}) `}
                          {currentQ.optionsHi[i]}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
            <button
              onClick={clearResponse}
              disabled={curAns?.selected === null || curAns?.selected === undefined}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Eraser className="h-4 w-4" /> Clear Response
            </button>
            <button
              onClick={markAndNext}
              className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              <Flag className="h-4 w-4" /> Mark for Review &amp; Next
            </button>
            <button
              onClick={saveAndNext}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#1c9e54] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#15803d]"
            >
              Save &amp; Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ---- Palette panel ---- */}
        <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:w-[300px]">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-[#123d6e] px-4 py-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <User className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{name}</p>
              <p className="text-[11px] text-blue-200">Candidate / परीक्षार्थी</p>
            </div>
          </div>

          <div className="nice-scroll max-h-[46vh] overflow-y-auto p-3 lg:max-h-none">
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-b border-slate-100 pb-3">
              {LEGEND.map((l) => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <span
                    className={`relative flex h-6 w-6 items-center justify-center rounded border text-[10px] font-bold ${STATUS_STYLE[l.key]}`}
                  >
                    {counts[l.key]}
                    {l.key === "answered-marked" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#1c9e54] ring-1 ring-white" />
                    )}
                  </span>
                  <span className="text-[9.5px] font-medium leading-tight text-slate-500">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Palette */}
            <div className="py-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <BookOpenCheck className="h-3.5 w-3.5" />
                {activeSection.nameEn}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  const st = statusOf(answers[q.id]);
                  const isCurrent = idx === current;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(idx)}
                      className={`relative flex h-9 items-center justify-center rounded-md border text-[13px] font-bold transition ${STATUS_STYLE[st]} ${
                        isCurrent ? "ring-2 ring-slate-900 ring-offset-1" : ""
                      }`}
                    >
                      {q.qno}
                      {st === "answered-marked" && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#1c9e54] ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            <button
              onClick={() => setShowSubmit(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e3352b] py-2.5 text-sm font-bold text-white transition hover:bg-[#c62828]"
            >
              <Send className="h-4 w-4" /> Submit Test / परीक्षा समाप्त करें
            </button>
          </div>
        </aside>
      </div>

      {/* ===== Submit modal ===== */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#123d6e] px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold sm:text-base">
                Submit Test? / परीक्षा समाप्त करें?
              </h2>
              <button
                onClick={() => setShowSubmit(false)}
                className="rounded-md p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="nice-scroll max-h-[60vh] overflow-y-auto p-5">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-2 font-semibold">Section</th>
                    <th className="py-2 pr-2 text-center font-semibold text-emerald-700">Ans.</th>
                    <th className="py-2 pr-2 text-center font-semibold text-red-600">Not Ans.</th>
                    <th className="py-2 pr-2 text-center font-semibold text-violet-600">Marked</th>
                    <th className="py-2 text-center font-semibold text-slate-400">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionCounts.map(({ sec, total, answered, notanswered, marked, notvisited }) => (
                    <tr key={sec.id} className="border-b border-slate-100 font-medium">
                      <td className="py-2 pr-2">
                        {sec.nameEn} ({total})
                      </td>
                      <td className="py-2 pr-2 text-center text-emerald-700">{answered}</td>
                      <td className="py-2 pr-2 text-center text-red-600">{notanswered}</td>
                      <td className="py-2 pr-2 text-center text-violet-600">{marked}</td>
                      <td className="py-2 text-center text-slate-400">{notvisited}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2 pr-2">Total</td>
                    <td className="py-2 pr-2 text-center text-emerald-700">
                      {counts.answered + counts["answered-marked"]}
                    </td>
                    <td className="py-2 pr-2 text-center text-red-600">{counts.notanswered}</td>
                    <td className="py-2 pr-2 text-center text-violet-600">{counts.marked}</td>
                    <td className="py-2 text-center text-slate-400">{counts.notvisited}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-800">
                Note: Answers marked for review WILL be evaluated. Negative marking of 1/3 mark
                applies. / ध्यान दें: समीक्षा हेतु चिह्नित उत्तरों का भी मूल्यांकन होगा। 1/3 अंक की
                नकारात्मक अंकन लागू है।
              </p>
            </div>
            <div className="flex gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
              <button
                onClick={() => setShowSubmit(false)}
                className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel / रद्द करें
              </button>
              <button
                onClick={() => void doSubmit()}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1c9e54] py-2.5 text-sm font-bold text-white hover:bg-[#15803d] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Submit / हाँ, जमा करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Auto submitting overlay ===== */}
      {submitting && !showSubmit && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-slate-900/70 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-sm font-semibold text-white">
            Submitting your test… / आपकी परीक्षा जमा हो रही है…
          </p>
        </div>
      )}
    </div>
  );
}
