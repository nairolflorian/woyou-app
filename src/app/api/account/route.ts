// Self-edit of login credentials. Authenticated users can change:
//   - email
//   - phone
//   - password (requires the current one)
// Soft-deleted accounts are blocked. We avoid leaking which fields are
// already taken: any uniqueness violation just returns ALREADY_TAKEN.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(4).max(40).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(6).max(200).optional(),
  })
  .refine((d) => d.email || d.phone || d.newPassword, {
    message: "AT_LEAST_ONE_FIELD_REQUIRED",
  });

export async function PATCH(req: Request) {
  const rl = rateLimit("account-edit", clientIp(req), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me || me.deletedAt) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.email && parsed.data.email !== me.email) {
    updates.email = parsed.data.email;
  }
  if (parsed.data.phone && parsed.data.phone !== me.phone) {
    updates.phone = parsed.data.phone;
  }
  if (parsed.data.newPassword) {
    if (!me.passwordHash) {
      return NextResponse.json({ error: "NO_PASSWORD_SET" }, { status: 400 });
    }
    if (
      !parsed.data.currentPassword ||
      !(await verifyPassword(parsed.data.currentPassword, me.passwordHash))
    ) {
      return NextResponse.json({ error: "WRONG_CURRENT_PASSWORD" }, { status: 401 });
    }
    updates.passwordHash = await hashPassword(parsed.data.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noChange: true });
  }

  try {
    await prisma.user.update({ where: { id: me.id }, data: updates });
  } catch {
    // Almost always a unique-constraint violation on email/phone.
    return NextResponse.json({ error: "ALREADY_TAKEN" }, { status: 409 });
  }

  // Update the cached email in the session if we changed it.
  if (typeof updates.email === "string") {
    session.email = updates.email;
    await session.save();
  }
  return NextResponse.json({ ok: true });
}
