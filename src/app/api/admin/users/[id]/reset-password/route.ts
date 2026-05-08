// Super-admin only: generate a fresh random password for a user, return it
// once in the response. The admin is expected to copy it to the user via
// whatever channel is appropriate (email, chat, in person). Audited.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { audit } from "@/lib/audit";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (session.role !== ROLE.SUPER_ADMIN) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (user.deletedAt) {
    return NextResponse.json({ error: "USER_DELETED" }, { status: 400 });
  }

  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const newPwd = Array.from({ length: 12 })
    .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join("");
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(newPwd) },
  });
  await audit(req, "TEAM_MEMBER_CREATE", {}, {
    action: "password_reset",
    targetUserId: id,
  });

  return NextResponse.json({ ok: true, password: newPwd });
}
