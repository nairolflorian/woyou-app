import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { clearFeedCache } from "@/lib/jobs-feeds";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  await prisma.careerFeed.update({ where: { id }, data: { active: !!b.active } });
  clearFeedCache();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  await prisma.careerFeed.delete({ where: { id } });
  clearFeedCache();
  return NextResponse.json({ ok: true });
}
