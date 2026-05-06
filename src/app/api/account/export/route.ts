// DSGVO Art. 15 / Art. 20 — data export.
// Returns a JSON dump of everything we hold about the calling user.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      candidate: { include: { matches: true, testAnswers: true, tasks: true } },
      company: { include: { jobRequests: true, matches: true, tasks: true } },
      sentMessages: true,
      notifications: true,
      assignedTasks: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Strip secrets that are not personal data of the subject.
  const { passwordHash, ...userPublic } = user;
  void passwordHash;

  const payload = {
    exportedAt: new Date().toISOString(),
    note:
      "Dieser Export enthält alle personenbezogenen Daten, die WoYou über dich gespeichert hat (DSGVO Art. 15 / Art. 20).",
    user: userPublic,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="woyou-export-${user.id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
