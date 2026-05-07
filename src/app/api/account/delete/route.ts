// DSGVO Art. 17 — right to be forgotten.
// User must POST { confirm: "DELETE" } to confirm. We soft-delete first
// (mark User.deletedAt + scrub identifying fields so the email/phone is
// freed up for re-registration), then a 30-day purge cron permanently
// removes the row + cascades. Super-admins can restore from
// /admin/papierkorb within that window.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { audit } from "@/lib/audit";

const schema = z.object({ confirm: z.literal("DELETE") });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // Super-admins must not nuke themselves through this UI.
  if (session.role === ROLE.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "SUPER_ADMIN_PROTECTED" },
      { status: 403 }
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "CONFIRM_REQUIRED" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { candidate: { select: { id: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Audit BEFORE we scrub identity so the row still has the original email.
  await audit(req, "ACCOUNT_SELF_DELETE", {
    candidateId: user.candidate?.id ?? null,
  });

  // Free email/phone/telegramId so the user can re-register, and disable
  // password login. We move identity into a deletedAtMarker prefix so
  // unique constraints don't bite us if they re-register the same email.
  const stamp = Date.now();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
      email: user.email ? `_deleted_${stamp}_${user.email}` : null,
      phone: user.phone ? `_deleted_${stamp}_${user.phone}` : null,
      telegramId: user.telegramId
        ? `_deleted_${stamp}_${user.telegramId}`
        : null,
      passwordHash: null,
    },
  });

  session.destroy();
  return NextResponse.json({ ok: true });
}
