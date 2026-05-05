import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserWithRole } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum([ROLE.CANDIDATE, ROLE.COMPANY]).default(ROLE.CANDIDATE),
  locale: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID", details: parsed.error.flatten() },
      { status: 400 }
    );
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

  if (role === ROLE.CANDIDATE) {
    await prisma.candidate.create({
      data: { userId: user.id, status: CANDIDATE_STATUS.REGISTERED },
    });
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = role;
  session.email = email || undefined;
  session.locale = locale ?? "de";
  await session.save();

  const next = role === ROLE.COMPANY ? "/arbeitgeber/registrierung" : "/registrierung/profil";
  return NextResponse.json({ ok: true, next });
}
