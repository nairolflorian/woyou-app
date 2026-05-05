import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { gradeTest, LANGUAGE_TEST } from "@/lib/language-test";

const schema = z.object({
  answers: z.record(z.string(), z.coerce.number().int()),
});

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

  await prisma.$transaction([
    prisma.languageTestAnswer.deleteMany({ where: { candidateId: candidate.id } }),
    prisma.languageTestAnswer.createMany({
      data: LANGUAGE_TEST.map((q) => ({
        candidateId: candidate.id,
        questionId: q.id,
        answer: String(parsed.data.answers[q.id] ?? -1),
        isCorrect: parsed.data.answers[q.id] === q.correctIndex,
      })),
    }),
    prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        languageTestScore: result.score,
        languageTestPassed: result.passed,
        languageTestTakenAt: new Date(),
        germanLevel: result.level === "NONE" ? candidate.germanLevel : result.level,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, ...result });
}
