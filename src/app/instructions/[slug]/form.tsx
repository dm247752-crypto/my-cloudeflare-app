"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Loader2,
  TrainFront,
  User,
} from "lucide-react";
import type { SectionMeta } from "@/lib/exam";

interface TestRow {
  slug: string;
  title: string;
  titleHi: string;
  durationSec: number;
  totalQuestions: number;
  totalMarks: number;
  sections: SectionMeta[];
}

const INSTRUCTIONS: { en: string; hi: string }[] = [
  {
    en: "The clock will be set by the server and will count down at the top-right corner. The test will auto-submit when time expires.",
    hi: "घड़ी ऊपर दाएँ कोने में चलेगी और समय समाप्त होते ही परीक्षा स्वतः जमा हो जाएगी।",
  },
  {
    en: "Each correct answer gives +1 mark. Each wrong answer deducts 1/3 mark (0.33). Unattempted questions carry no penalty.",
    hi: "प्रत्येक सही उत्तर पर +1 अंक मिलेगा। प्रत्येक गलत उत्तर पर 1/3 अंक (0.33) कटेगा। बिना हल किए प्रश्नों पर कोई दंड नहीं है।",
  },
  {
    en: "All questions are Multiple Choice (MCQ) with 4 options and only one correct answer. Questions are shown in both English and Hindi.",
    hi: "सभी प्रश्न बहुविकल्पीय (MCQ) हैं जिनमें 4 विकल्प और केवल एक सही उत्तर है। प्रश्न अंग्रेजी और हिंदी दोनों में दिखाए जाते हैं।",
  },
  {
    en: "You can move to any question using the question palette on the right and can switch between sections freely.",
    hi: "आप दाईं ओर के प्रश्न पैलेट से किसी भी प्रश्न पर जा सकते हैं और सेक्शन के बीच स्वतंत्र रूप से जा सकते हैं।",
  },
  {
    en: "'Save & Next' saves your answer and moves to the next question. 'Clear Response' removes the chosen option. 'Mark for Review & Next' flags the question — marked answers ARE still evaluated.",
    hi: "'Save & Next' उत्तर सहेजकर अगले प्रश्न पर ले जाता है। 'Clear Response' चुना विकल्प हटाता है। 'Mark for Review & Next' प्रश्न को चिह्नित करता है — चिह्नित उत्तरों का भी मूल्यांकन होता है।",
  },
];

const PALETTE_INFO = [
  { cls: "border-slate-300 bg-white text-slate-600", en: "Not Visited (grey/white)", hi: "नहीं देखा गया" },
  { cls: "border-[#d63030] bg-[#e3352b] text-white", en: "Visited but Not Answered (red)", hi: "देखा गया पर उत्तर नहीं" },
  { cls: "border-[#0d7d3d] bg-[#1c9e54] text-white", en: "Answered (green)", hi: "उत्तर दिया गया" },
  { cls: "border-[#5b21b6] bg-[#7c3aed] text-white", en: "Marked for Review (purple)", hi: "समीक्षा हेतु चिह्नित" },
];

export default function InstructionsForm({ test }: { test: TestRow }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState("");

  const start = () => {
    if (name.trim().length < 2) {
      setErr("Please enter your name / कृपया अपना नाम लिखें");
      return;
    }
    if (!agree) {
      setErr("Please accept the declaration / कृपया घोषणा स्वीकार करें");
      return;
    }
    setErr("");
    setStarting(true);
    router.push(`/test/${test.slug}?name=${encodeURIComponent(name.trim())}`);
  };

  const mins = Math.floor(test.durationSec / 60);

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      {/* header */}
      <header className="bg-[#123d6e] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <TrainFront className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold">{test.title}</p>
              <p className="truncate text-[11px] text-blue-200">
                General Instructions / सामान्य निर्देश
              </p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold sm:block">
            {mins} Min · {test.totalQuestions} Qs
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* exam summary strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { l: "Total Questions / कुल प्रश्न", v: `${test.totalQuestions} (1 mark each)` },
            { l: "Duration / अवधि", v: `${mins} Minutes` },
            { l: "Negative Marking / नकारात्मक अंकन", v: "1/3 per wrong answer" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.l}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{s.v}</p>
            </div>
          ))}
        </div>

        {/* section pattern table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-bold">Subject / विषय</th>
                <th className="px-5 py-3 text-center font-bold">Q. No.</th>
                <th className="px-5 py-3 text-center font-bold">Questions</th>
                <th className="px-5 py-3 text-center font-bold">Marks / अंक</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {test.sections.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    {s.nameEn} / {s.nameHi}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {s.from} – {s.to}
                  </td>
                  <td className="px-5 py-3 text-center">{s.count}</td>
                  <td className="px-5 py-3 text-center">{s.count}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                <td className="px-5 py-3">Total / कुल</td>
                <td className="px-5 py-3 text-center">
                  1 – {test.totalQuestions}
                </td>
                <td className="px-5 py-3 text-center">{test.totalQuestions}</td>
                <td className="px-5 py-3 text-center">{test.totalMarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* instructions list */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-base font-extrabold text-slate-900">
            Important Instructions / महत्वपूर्ण निर्देश
          </h2>
          <ol className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#123d6e] text-[11px] font-bold text-white">
                1
              </span>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-slate-800">
                  Total duration of the test is {mins} minutes and it has {test.totalQuestions} questions of 1 mark each.
                </p>
                <p className="mt-0.5 text-slate-500">
                  परीक्षा की कुल अवधि {mins} मिनट है और इसमें 1 अंक प्रत्येक के {test.totalQuestions} प्रश्न हैं।
                </p>
              </div>
            </li>
            {INSTRUCTIONS.map((ins, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#123d6e] text-[11px] font-bold text-white">
                  {i + 2}
                </span>
                <div className="text-sm leading-relaxed">
                  <p className="font-medium text-slate-800">{ins.en}</p>
                  <p className="mt-0.5 text-slate-500">{ins.hi}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* palette legend */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question Palette Colour Code / प्रश्न पैलेट रंग कोड
            </p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {PALETTE_INFO.map((p) => (
                <div key={p.en} className="flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-bold ${p.cls}`}>
                    1
                  </span>
                  <div className="text-xs leading-tight">
                    <p className="font-semibold text-slate-700">{p.en}</p>
                    <p className="text-slate-500">{p.hi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* candidate form */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <User className="h-4.5 w-4.5 text-[#123d6e]" />
            Candidate Details / परीक्षार्थी विवरण
          </h2>
          <div className="mt-4 max-w-md">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Name / आपका नाम
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              placeholder="e.g. Rahul Kumar"
              maxLength={60}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#123d6e] focus:ring-2 focus:ring-[#123d6e]/15"
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#123d6e]"
            />
            <span>
              I have read and understood all the instructions and I agree to follow them.
              <br />
              <span className="text-slate-500">
                मैंने सभी निर्देश पढ़ लिए हैं और मैं उनका पालन करने के लिए सहमत हूँ।
              </span>
            </span>
          </label>
          {err && <p className="mt-3 text-sm font-semibold text-red-600">{err}</p>}

          <button
            onClick={start}
            disabled={starting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c9e54] py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#15803d] disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {starting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <BadgeCheck className="h-5 w-5" />
            )}
            I am ready to begin the test / मैं परीक्षा शुरू करने के लिए तैयार हूँ
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Timer starts as soon as the question paper loads. Best experienced on desktop.
          </p>
        </div>
      </main>
    </div>
  );
}
