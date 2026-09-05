import "dotenv/config";
import { db } from "./index";
import { attempts, questions, tests } from "./schema";
import { TEST_DEFS } from "../data/registry";

/** Deterministic PRNG so option shuffles are stable across re-seeds */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle EN/HI options in lockstep and return new correct index */
function shuffleOptions(
  optsEn: string[],
  optsHi: string[],
  correct: number,
  seedNum: number,
) {
  const order = [0, 1, 2, 3];
  const rand = mulberry32(seedNum);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    optionsEn: order.map((i) => optsEn[i]),
    optionsHi: order.map((i) => optsHi[i]),
    correctIndex: order.indexOf(correct),
  };
}

async function seed() {
  console.log(`Seeding ${TEST_DEFS.length} tests...`);

  await db.delete(attempts);
  await db.delete(questions);
  await db.delete(tests);

  for (const def of TEST_DEFS) {
    const [test] = await db
      .insert(tests)
      .values({
        slug: def.slug,
        exam: def.exam,
        setNo: def.setNo,
        title: def.title,
        titleHi: def.titleHi,
        description: def.description,
        badge: def.badge,
        usersLabel: def.usersLabel,
        durationSec: def.durationSec,
        totalQuestions: def.questions.length,
        totalMarks: def.questions.length,
        sections: def.sections,
      })
      .returning({ id: tests.id });

    const chunkSize = 25;
    for (let i = 0; i < def.questions.length; i += chunkSize) {
      const chunk = def.questions.slice(i, i + chunkSize);
      await db.insert(questions).values(
        chunk.map((q) => {
          // Shuffle options deterministically so correct answers are spread evenly
          const shuffled = shuffleOptions(
            q.en.opts,
            q.hi.opts,
            q.correct,
            def.setNo * 7919 + def.exam.length * 104729 + q.qno,
          );
          return {
            testId: test.id,
            qno: q.qno,
            section: q.section,
            topic: q.topic,
            difficulty: q.difficulty,
            questionEn: q.en.q,
            questionHi: q.hi.q,
            optionsEn: shuffled.optionsEn,
            optionsHi: shuffled.optionsHi,
            correctIndex: shuffled.correctIndex,
            explEn: q.en.exp,
            explHi: q.hi.exp,
          };
        }),
      );
    }
    console.log(`Seeded ${def.slug}: ${def.questions.length} questions`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
