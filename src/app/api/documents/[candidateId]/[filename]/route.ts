import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, MATCH_STATUS } from "@/lib/enums";
import { isAdmin } from "@/lib/auth";
import { readUpload, parseDocs } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ candidateId: string; filename: string }> }
) {
  const { candidateId, filename } = await ctx.params;
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { matches: true },
  });
  if (!candidate) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const isOwner = candidate.userId === session.userId;
  const isAdminUser = isAdmin(session.role);
  let isAllowedCompany = false;
  const ACTIVE: string[] = [
    MATCH_STATUS.SHARED_WITH_COMPANY,
    MATCH_STATUS.COMPANY_INTERESTED,
    MATCH_STATUS.IN_CONVERSATION,
    MATCH_STATUS.HIRED,
  ];
  if (session.role === ROLE.COMPANY) {
    const company = await prisma.company.findUnique({ where: { userId: session.userId } });
    if (company) {
      isAllowedCompany = candidate.matches.some(
        (m) => m.companyId === company.id && ACTIVE.includes(m.status)
      );
    }
  }
  if (!isOwner && !isAdminUser && !isAllowedCompany) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  // Verify the file is actually known to this candidate
  const docs = parseDocs(candidate.documents);
  if (!docs.find((d) => d.filename === filename)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const file = await readUpload(candidateId, filename);
  if (!file) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
