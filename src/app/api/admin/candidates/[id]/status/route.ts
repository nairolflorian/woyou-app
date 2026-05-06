import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS } from "@/lib/enums";
import { autoMatchForCandidate } from "@/lib/auto-match";
import { createPlacementChecklist } from "@/lib/visa-workflow";

const schema = z.object({
  status: z.enum(Object.values(CANDIDATE_STATUS) as [string, ...string[]]),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  await prisma.candidate.update({
    where: { id },
    data: {
      status: parsed.data.status,
      placedAt:
        parsed.data.status === CANDIDATE_STATUS.PLACED ? new Date() : null,
      paidAt:
        parsed.data.status === CANDIDATE_STATUS.PAID_PLACEABLE ||
        parsed.data.status === CANDIDATE_STATUS.PROPOSED ||
        parsed.data.status === CANDIDATE_STATUS.PLACED
          ? (await prisma.candidate.findUnique({ where: { id } }))?.paidAt ?? new Date()
          : null,
    },
  });
  if (parsed.data.status === CANDIDATE_STATUS.PAID_PLACEABLE) {
    await autoMatchForCandidate(id).catch((err) =>
      console.error("auto-match failed:", err)
    );
  }
  if (parsed.data.status === CANDIDATE_STATUS.PLACED) {
    // Best-effort: pick the most recent IN_CONVERSATION / HIRED match to know
    // which company. If none, the checklist is skipped (admin can re-run later).
    const lastMatch = await prisma.match.findFirst({
      where: { candidateId: id, status: { in: ["IN_CONVERSATION", "HIRED"] } },
      orderBy: { updatedAt: "desc" },
    });
    if (lastMatch) {
      await createPlacementChecklist(id, lastMatch.companyId, lastMatch.id).catch(
        (err) => console.error("placement checklist failed:", err)
      );
    }
  }
  return NextResponse.json({ ok: true });
}
