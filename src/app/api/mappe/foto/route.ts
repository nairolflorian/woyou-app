import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mappeForRequest, savePhoto, readPhoto } from "@/lib/mappe";

export async function POST(req: Request) {
  const m = await mappeForRequest(new URL(req.url).searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  try {
    const name = await savePhoto(m.booking.candidateId, file);
    await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { photoFile: name } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const m = await mappeForRequest(new URL(req.url).searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { photoFile: null } });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const m = await mappeForRequest(new URL(req.url).searchParams.get("bookingId"));
  const buf = m ? await readPhoto(m.booking.candidateId, m.profile.photoFile) : null;
  if (!buf) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": m!.profile.photoFile!.endsWith(".png") ? "image/png" : "image/jpeg", "Cache-Control": "private, no-store" } });
}
