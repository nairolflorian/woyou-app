import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByLogin, verifyPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ROLE, type Role } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const rl = rateLimit("login", clientIp(req), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retryInSec: Math.ceil(rl.resetIn / 1000) },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const user = await findUserByLogin(parsed.data.login);
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 401 });
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
  }
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as Role;
  session.email = user.email ?? undefined;
  session.locale = user.locale;
  await session.save();

  let next = "/profil";
  if (user.role === ROLE.ADMIN || user.role === ROLE.SUPER_ADMIN) next = "/admin";
  else if (user.role === ROLE.COMPANY) next = "/firmen/dashboard";
  return NextResponse.json({ ok: true, next });
}
