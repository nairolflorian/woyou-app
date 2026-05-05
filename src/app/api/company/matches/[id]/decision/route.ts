import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, MATCH_STATUS, CANDIDATE_STATUS } from "@/lib/enums";

const schema = z.object({
  action: z.enum(["interested", "decline", "hire"]),
  feedback: z.string().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.COMPANY) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const company = await prisma.company.findUnique({
    where: { userId: session.userId },
  });
  if (!company) return NextResponse.json({ error: "NO_COMPANY" }, { status: 404 });
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.companyId !== company.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (parsed.data.action === "decline" && !parsed.data.feedback) {
    return NextResponse.json({ error: "FEEDBACK_REQUIRED" }, { status: 400 });
  }

  let newStatus = match.status;
  if (parsed.data.action === "interested") {
    newStatus = MATCH_STATUS.COMPANY_INTERESTED;
    // Open conversation
    await prisma.conversation.upsert({
      where: { matchId: match.id },
      update: {},
      create: {
        matchId: match.id,
        candidateId: match.candidateId,
        companyId: match.companyId,
      },
    });
  } else if (parsed.data.action === "decline") {
    newStatus = MATCH_STATUS.COMPANY_DECLINED;
  } else if (parsed.data.action === "hire") {
    newStatus = MATCH_STATUS.HIRED;
  }

  await prisma.match.update({
    where: { id: match.id },
    data: {
      status: newStatus,
      companyFeedback: parsed.data.feedback ?? match.companyFeedback,
      companyRespondedAt: new Date(),
    },
  });

  if (parsed.data.action === "hire") {
    await prisma.candidate.update({
      where: { id: match.candidateId },
      data: { status: CANDIDATE_STATUS.PLACED, placedAt: new Date() },
    });
    // Open admin task — visa support
    await prisma.adminTask.create({
      data: {
        candidateId: match.candidateId,
        companyId: match.companyId,
        matchId: match.id,
        kind: "VISA",
        title: "Visum & Anerkennungs-Prozess starten",
        description: "Kandidat wurde eingestellt. Visum, Dokumente, Wohnung organisieren.",
      },
    });
  }

  // Notify candidate
  const candidate = await prisma.candidate.findUnique({
    where: { id: match.candidateId },
  });
  if (candidate) {
    await prisma.notification.create({
      data: {
        userId: candidate.userId,
        type:
          parsed.data.action === "hire"
            ? "HIRED"
            : parsed.data.action === "interested"
              ? "COMPANY_INTERESTED"
              : "COMPANY_DECLINED",
        title:
          parsed.data.action === "hire"
            ? "Glückwunsch — du wurdest eingestellt!"
            : parsed.data.action === "interested"
              ? "Ein Unternehmen ist an dir interessiert"
              : "Ein Unternehmen hat sich entschieden, weiterzusuchen",
        body: parsed.data.feedback,
        link: "/profil",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
