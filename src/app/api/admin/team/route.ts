import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { createUserWithRole } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([ROLE.ADMIN, ROLE.SUPER_ADMIN]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (session.role !== ROLE.SUPER_ADMIN) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "ALREADY_EXISTS" }, { status: 409 });
  await createUserWithRole(
    { email: parsed.data.email, password: parsed.data.password },
    parsed.data.role
  );
  return NextResponse.json({ ok: true });
}
