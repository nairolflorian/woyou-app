import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { writeChatAttachment } from "@/lib/uploads";

export const runtime = "nodejs";

const schema = z.object({
  body: z.string().min(1),
  channel: z.enum(["PLATFORM", "EMAIL", "TELEGRAM", "WHATSAPP"]).default("PLATFORM"),
});

async function getConv(id: string, userId: string, role?: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      candidate: { include: { user: true } },
      company: { include: { user: true } },
    },
  });
  if (!conv) return null;
  const allowed =
    conv.candidate.userId === userId ||
    conv.company.userId === userId ||
    isAdmin(role);
  return allowed ? conv : null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conv = await getConv(id, session.userId, session.role);
  if (!conv) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ ok: true, messages });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conv = await getConv(id, session.userId, session.role);
  if (!conv) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const contentType = req.headers.get("content-type") ?? "";
  let body: string;
  let channel: "PLATFORM" | "EMAIL" | "TELEGRAM" | "WHATSAPP" = "PLATFORM";
  let attachmentData: Awaited<ReturnType<typeof writeChatAttachment>> | null = null;

  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    const rawBody = String(fd.get("body") ?? "").trim();
    const rawChannel = String(fd.get("channel") ?? "PLATFORM");
    const file = fd.get("file");
    if (file instanceof File && file.size > 0) {
      try {
        attachmentData = await writeChatAttachment(id, file);
      } catch (err) {
        return NextResponse.json(
          { error: "ATTACHMENT_FAILED", message: err instanceof Error ? err.message : String(err) },
          { status: 400 }
        );
      }
    }
    body = rawBody || (attachmentData ? `📎 ${attachmentData.originalName}` : "");
    channel = (["PLATFORM", "EMAIL", "TELEGRAM", "WHATSAPP"] as const).includes(
      rawChannel as "PLATFORM" | "EMAIL" | "TELEGRAM" | "WHATSAPP"
    )
      ? (rawChannel as "PLATFORM" | "EMAIL" | "TELEGRAM" | "WHATSAPP")
      : "PLATFORM";
    if (!body) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }
  } else {
    const json = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });
    body = parsed.data.body;
    channel = parsed.data.channel;
  }

  const msg = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.userId,
      body,
      channel,
      attachmentFilename: attachmentData?.filename,
      attachmentOriginalName: attachmentData?.originalName,
      attachmentMime: attachmentData?.mime,
      attachmentSize: attachmentData?.size,
    },
  });

  // Notify the other side
  const otherUserId =
    session.userId === conv.candidate.userId
      ? conv.company.userId
      : conv.candidate.userId;
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: "NEW_MESSAGE",
      title: "Neue Nachricht",
      body: body.slice(0, 80),
      link: `/chat/${conv.matchId ?? ""}`,
    },
  });

  return NextResponse.json({ ok: true, message: msg });
}
