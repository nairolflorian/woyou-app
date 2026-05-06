import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { gradeTest, getTest } from "@/lib/language-test";

const schema = z.object({
  language: z.enum(["de", "fr", "ar"]).default("de"),
  answers: z.record(z.string(), z.coerce.number().int()),
});

type OtherLang = { lang: string; level: string; score?: number; takenAt?: string; passed?: boolean };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const result = gradeTest(parsed.data.answers);
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });
  }
  const language = parsed.data.language;
  const questions = getTest(language);
  const ids = new Set(questions.map((q) => q.id));

  const updates: Record<string, unknown> = {};
  if (language === "de") {
    updates.languageTestScore = result.score;
    updates.languageTestPassed = result.passed;
    updates.languageTestTakenAt = new Date();
    if (result.level !== "NONE") updates.germanLevel = result.level;
  } else {
    // Update otherLanguages JSON entry for this language.
    let others: OtherLang[] = [];
    try {
      others = candidate.otherLanguages ? JSON.parse(candidate.otherLanguages) : [];
    } catch {
      others = [];
    }
    const idx = others.findIndex((o) => o.lang.toLowerCase() === language);
    const entry: OtherLang = {
      lang: language,
      level: result.level === "NONE" ? "A1" : result.level,
      score: result.score,
      passed: result.passed,
      takenAt: new Date().toISOString(),
    };
    if (idx >= 0) others[idx] = entry;
    else others.push(entry);
    updates.otherLanguages = JSON.stringify(others);
  }

  await prisma.$transaction([
    // Replace this language's answers only (other test results stay).
    prisma.languageTestAnswer.deleteMany({
      where: { candidateId: candidate.id, questionId: { in: [...ids] } },
    }),
    prisma.languageTestAnswer.createMany({
      data: questions.map((q) => ({
        candidateId: candidate.id,
        questionId: q.id,
        answer: String(parsed.data.answers[q.id] ?? -1),
        isCorrect: parsed.data.answers[q.id] === q.correctIndex,
      })),
    }),
    prisma.candidate.update({
      where: { id: candidate.id },
      data: updates,
    }),
  ]);

  return NextResponse.json({ ok: true, language, ...result });
}
