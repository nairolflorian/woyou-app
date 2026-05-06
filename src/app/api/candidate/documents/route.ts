import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import {
  DOC_KINDS,
  type DocKind,
  parseDocs,
  writeUpload,
  deleteUpload,
  findAvatar,
} from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
    select: { documents: true },
  });
  return NextResponse.json({ ok: true, documents: parseDocs(candidate?.documents) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const kindRaw = form.get("kind");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "FILE_MISSING" }, { status: 400 });
  }
  const kind = (DOC_KINDS as readonly string[]).includes(String(kindRaw))
    ? (String(kindRaw) as DocKind)
    : "other";

  // Avatars must be images.
  if (kind === "avatar") {
    const lower = file.name.toLowerCase();
    if (!/\.(jpe?g|png)$/.test(lower)) {
      return NextResponse.json(
        { error: "AVATAR_MUST_BE_IMAGE", message: "Profilbild muss JPG oder PNG sein." },
        { status: 400 }
      );
    }
  }

  let stored;
  try {
    stored = await writeUpload(candidate.id, file, kind);
  } catch (err) {
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  let docs = parseDocs(candidate.documents);
  // Replace existing avatar instead of accumulating: we always show "the"
  // avatar, so old ones would just clutter the disk.
  if (kind === "avatar") {
    const old = findAvatar(docs);
    if (old) {
      await deleteUpload(candidate.id, old.filename);
      docs = docs.filter((d) => d.id !== old.id);
    }
  }
  docs.push(stored);
  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { documents: JSON.stringify(docs) },
  });

  return NextResponse.json({ ok: true, document: stored });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });

  const docs = parseDocs(candidate.documents);
  const target = docs.find((d) => d.id === id);
  if (!target) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await deleteUpload(candidate.id, target.filename);
  const next = docs.filter((d) => d.id !== id);
  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { documents: JSON.stringify(next) },
  });
  return NextResponse.json({ ok: true });
}
