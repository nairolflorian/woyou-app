import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { leadDocuments } from "@/lib/leads";

// Vorschau der Unterlagen, wie sie verschickt würden: ?doc=letter | cv
export async function GET(req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { leadId } = await ctx.params;
  const { files } = await leadDocuments(leadId);
  const f = new URL(req.url).searchParams.get("doc") === "cv" ? files[1] : files[0];
  return new NextResponse(new Uint8Array(f.content), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${f.filename}"`, "Cache-Control": "private, no-store" } });
}
