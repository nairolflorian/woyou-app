import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
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
  if (!user.deletedAt) {
    return NextResponse.json({ error: "NOT_DELETED" }, { status: 400 });
  }

  // Strip the "_deleted_<ts>_" prefixes from identity fields.
  const strip = (v: string | null): string | null => {
    if (!v) return v;
    const m = v.match(/^_deleted_\d+_(.+)$/);
    return m ? m[1] : v;
  };

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
      email: strip(user.email),
      phone: strip(user.phone),
      telegramId: strip(user.telegramId),
    },
  });
  await audit(req, "ACCOUNT_SELF_DELETE", {}, { restored: true, userId: id });
  return NextResponse.json({ ok: true });
}
