import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

// Admin: Kündigung als erledigt markieren, Notiz
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const p = z.object({ status: z.enum(["OFFEN", "ERLEDIGT"]).optional(), adminNote: z.string().max(2000).optional() }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Ungültige Angaben." }, { status: 400 });
  await prisma.kuendigung.update({ where: { id }, data: p.data });
  return NextResponse.json({ ok: true });
}
