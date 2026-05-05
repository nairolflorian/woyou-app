import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TASK_KINDS, TASK_STATUS } from "@/lib/enums";

const schema = z.object({
  candidateId: z.string().optional(),
  companyId: z.string().optional(),
  matchId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  kind: z.enum(TASK_KINDS as unknown as [string, ...string[]]),
  status: z.enum(TASK_STATUS as unknown as [string, ...string[]]).optional(),
  assignedToId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const t = await prisma.adminTask.create({ data: parsed.data });
  return NextResponse.json({ ok: true, task: t });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const taskId = body.id as string | undefined;
  if (!taskId) return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  const updated = await prisma.adminTask.update({
    where: { id: taskId },
    data: {
      status: body.status,
      assignedToId: body.assignedToId,
      title: body.title,
      description: body.description,
    },
  });
  return NextResponse.json({ ok: true, task: updated });
}
