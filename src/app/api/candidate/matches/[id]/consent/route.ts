import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, MATCH_STATUS } from "@/lib/enums";

const schema = z.object({ action: z.enum(["approve", "decline"]) });

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.candidateId !== candidate.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (match.status !== MATCH_STATUS.AWAITING_CANDIDATE_CONSENT) {
    return NextResponse.json({ error: "WRONG_STATUS" }, { status: 400 });
  }

  const newStatus =
    parsed.data.action === "approve"
      ? MATCH_STATUS.SHARED_WITH_COMPANY
      : MATCH_STATUS.CANDIDATE_DECLINED;

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id },
      data: { status: newStatus, candidateRespondedAt: new Date() },
    });
    if (parsed.data.action === "approve") {
      // Notify the company user
      const company = await tx.company.findUnique({
        where: { id: match.companyId },
      });
      if (company) {
        await tx.notification.create({
          data: {
            userId: company.userId,
            type: "MATCH_SHARED",
            title: "Neuer Kandidat-Vorschlag",
            body: `Ein Kandidat hat zugestimmt, dass du sein Profil ansiehst.`,
            link: "/firmen/dashboard",
          },
        });
      }
      await tx.candidate.update({
        where: { id: candidate.id },
        data: { timesProposed: { increment: 1 } },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
