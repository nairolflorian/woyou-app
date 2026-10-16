import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mappeForRequest } from "@/lib/mappe";
import { ProfileData, missingFields } from "@/lib/application";

// Mappe speichern (Kund:in solange nicht freigegeben; Admin jederzeit)
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const m = await mappeForRequest(url.searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Kein gebuchter Bewerbungs-Service gefunden." }, { status: 404 });
  if (!m.admin && m.profile.status === "APPROVED") return NextResponse.json({ error: "Die Mappe ist bereits freigegeben. Änderungen bitte über das WoYou-Team." }, { status: 409 });
  const body = await req.json().catch(() => ({}));
  const parsed = ProfileData.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Bitte die Eingaben prüfen (zu lang oder ungültig)." }, { status: 400 });
  await prisma.applicationProfile.update({
    where: { id: m.profile.id },
    data: { data: JSON.stringify(parsed.data), ...(m.admin && typeof body.baseLetter === "string" ? { baseLetter: body.baseLetter.slice(0, 6000) } : {}) },
  });
  return NextResponse.json({ ok: true, missing: missingFields(parsed.data) });
}
