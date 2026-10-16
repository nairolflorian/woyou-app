import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mappeForRequest, saveOwnCv, readOwnCv } from "@/lib/mappe";

// Eigener Lebenslauf: hochladen (POST), verwenden ja/nein (PATCH), ansehen (GET), entfernen (DELETE)
const ctx = (req: Request) => mappeForRequest(new URL(req.url).searchParams.get("bookingId"));

export async function POST(req: Request) {
  const m = await ctx(req);
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  try {
    const name = await saveOwnCv(m.booking.candidateId, file);
    await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { ownCvFile: name, useOwnCv: true } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const m = await ctx(req);
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const { useOwnCv } = await req.json().catch(() => ({}));
  if (useOwnCv && !m.profile.ownCvFile) return NextResponse.json({ error: "Bitte zuerst einen Lebenslauf hochladen." }, { status: 400 });
  await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { useOwnCv: !!useOwnCv } });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const m = await ctx(req);
  const buf = m ? await readOwnCv(m.booking.candidate, m.profile.ownCvFile) : null;
  if (!buf) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="Lebenslauf.pdf"', "Cache-Control": "private, no-store" } });
}

export async function DELETE(req: Request) {
  const m = await ctx(req);
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { ownCvFile: null, useOwnCv: false } });
  return NextResponse.json({ ok: true });
}
