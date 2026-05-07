import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { readChatAttachment } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await ctx.params;
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      candidate: { select: { userId: true } },
      company: { select: { userId: true } },
    },
  });
  if (!conv) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const allowed =
    conv.candidate.userId === session.userId ||
    conv.company.userId === session.userId ||
    isAdmin(session.role);
  if (!allowed) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  // Make sure the message actually references this filename
  const msg = await prisma.message.findFirst({
    where: { conversationId: id, attachmentFilename: filename },
    select: { id: true, attachmentOriginalName: true },
  });
  if (!msg) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const file = await readChatAttachment(id, filename);
  if (!file) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const safeOriginal = (msg.attachmentOriginalName ?? filename).replace(/[\r\n"]/g, "_");
  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${safeOriginal}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
