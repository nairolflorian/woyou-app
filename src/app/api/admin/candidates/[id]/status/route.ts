import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS } from "@/lib/enums";

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
  return NextResponse.json({ ok: true });
}
