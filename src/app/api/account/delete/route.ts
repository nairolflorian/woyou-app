// DSGVO Art. 17 — right to be forgotten.
// User must POST { confirm: "DELETE" } to confirm. Cascades through Prisma
// schema (User → Candidate → matches/tasks/etc.; messages keep their FK
// to user via "Cascade" so they're cleaned up too). Files in /app/uploads
// are removed best-effort.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ROLE } from "@/lib/enums";

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

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });

  if (candidate) {
    const dir = path.join(
      process.env.UPLOAD_DIR ?? "/app/uploads",
      "candidates",
      candidate.id
    );
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }

  await prisma.user.delete({ where: { id: session.userId } });

  session.destroy();
  return NextResponse.json({ ok: true });
}
