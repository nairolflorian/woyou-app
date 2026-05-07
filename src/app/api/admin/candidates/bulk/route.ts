import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS } from "@/lib/enums";
import { autoMatchForCandidate } from "@/lib/auto-match";
import { audit } from "@/lib/audit";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("STATUS_SET"),
    ids: z.array(z.string()).min(1).max(200),
    status: z.enum(Object.values(CANDIDATE_STATUS) as [string, ...string[]]),
  }),
  z.object({
    action: z.literal("NOTIFY"),
    ids: z.array(z.string()).min(1).max(200),
    title: z.string().min(1).max(160),
    body: z.string().max(2000).optional(),
  }),
]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const candidates = await prisma.candidate.findMany({
    where: { id: { in: parsed.data.ids } },
    select: { id: true, userId: true, status: true },
  });

  if (parsed.data.action === "STATUS_SET") {
    const target = parsed.data.status;
    for (const c of candidates) {
      await prisma.candidate.update({
        where: { id: c.id },
        data: {
          status: target,
          placedAt: target === CANDIDATE_STATUS.PLACED ? new Date() : null,
          paidAt:
            target === CANDIDATE_STATUS.PAID_PLACEABLE ||
            target === CANDIDATE_STATUS.PROPOSED ||
            target === CANDIDATE_STATUS.PLACED
              ? (await prisma.candidate.findUnique({ where: { id: c.id } }))?.paidAt ??
                new Date()
              : null,
        },
      });
      await audit(req, "CANDIDATE_STATUS_CHANGE", { candidateId: c.id }, {
        from: c.status,
        to: target,
        bulk: true,
      });
      if (target === CANDIDATE_STATUS.PAID_PLACEABLE) {
        await autoMatchForCandidate(c.id).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true, updated: candidates.length });
  }

  // NOTIFY: send platform notification + write audit
  const { title, body } = parsed.data;
  for (const c of candidates) {
    await prisma.notification.create({
      data: {
        userId: c.userId,
        type: "ADMIN_BROADCAST",
        title,
        body,
        link: "/profil",
      },
    });
  }
  // One audit row for the whole batch is plenty.
  await audit(req, "CANDIDATE_BULK_NOTIFY", {}, {
    title,
    count: candidates.length,
    candidateIds: candidates.map((c) => c.id),
  });
  return NextResponse.json({ ok: true, notified: candidates.length });
}
