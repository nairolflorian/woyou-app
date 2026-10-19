import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserWithRole } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { crmMelden } from "@/lib/crm-sync";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.literal(ROLE.CANDIDATE).default(ROLE.CANDIDATE),
  locale: z.string().optional(),
  // Honeypot: a hidden field that real users never see and bots usually fill.
  website: z.string().optional(),
  source: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit("register", clientIp(req), 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retryInSec: Math.ceil(rl.resetIn / 1000) },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // Honeypot tripped → silently succeed-looking 200 so bots don't retry.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, next: "/" });
  }
  const { email, phone, password, role, locale } = parsed.data;
  if (!email && !phone) {
    return NextResponse.json(
      { error: "EMAIL_OR_PHONE_REQUIRED" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [email ? { email } : {}, phone ? { phone } : {}] },
  });
  if (existing) {
    return NextResponse.json({ error: "ALREADY_REGISTERED" }, { status: 409 });
  }

  const user = await createUserWithRole(
    { email: email || undefined, phone: phone || undefined, password, locale },
    role
  );

  // Herkunft (utm_source/utm_campaign aus dem Werbelink) für die Auswertung je Kanal
  const source = parsed.data.source?.replace(/[^\w./ -]/g, "").slice(0, 80);
  if (source) await prisma.user.update({ where: { id: user.id }, data: { signupSource: source } });

  if (role === ROLE.CANDIDATE) {
    const candidate = await prisma.candidate.create({
      data: { userId: user.id, status: CANDIDATE_STATUS.REGISTERED },
    });
    crmMelden("registriert", candidate.id);
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = role;
  session.email = email || undefined;
  session.locale = locale ?? "de";
  await session.save();

  const next = "/bewerbungsservice/buchen";
  return NextResponse.json({ ok: true, next });
}
