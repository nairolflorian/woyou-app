import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Role } from "@/lib/enums";
import { DEMO_ACCOUNTS, DEMO_MODE_ENABLED } from "@/lib/demo-accounts";

async function loginAndRedirect(req: Request, email: string) {
  if (!DEMO_MODE_ENABLED) {
    return NextResponse.json({ error: "DEMO_MODE_DISABLED" }, { status: 403 });
  }
  const acc = DEMO_ACCOUNTS.find((a) => a.email === email);
  if (!acc) {
    return NextResponse.json({ error: "UNKNOWN_DEMO_ACCOUNT" }, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { email: acc.email } });
  if (!user) {
    return NextResponse.json(
      { error: "ACCOUNT_NOT_SEEDED", hint: "Run npm run db:seed first." },
      { status: 404 }
    );
  }
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as Role;
  session.email = user.email ?? undefined;
  session.locale = user.locale;
  await session.save();

  // Browser usage: redirect to the dashboard. API usage: return JSON.
  const wantsJson =
    req.headers.get("accept")?.includes("application/json") ||
    req.method === "POST";
  if (wantsJson) {
    return NextResponse.json({ ok: true, next: acc.next, account: acc });
  }
  return NextResponse.redirect(new URL(acc.next, req.url));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  return loginAndRedirect(req, email);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return loginAndRedirect(req, body.email ?? "");
}
