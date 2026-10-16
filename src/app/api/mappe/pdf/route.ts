import { NextResponse } from "next/server";
import { mappeForRequest, readPhoto } from "@/lib/mappe";
import { cvPdf, letterPdf } from "@/lib/pdf";
import { baseLetter } from "@/lib/letters";

// Vorschau: ?type=cv | anschreiben  (Admin zusätzlich &bookingId=…)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = await mappeForRequest(url.searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const name = `${m.data.firstName}_${m.data.lastName}`.replace(/[^A-Za-z0-9_-]+/g, "") || "Bewerbung";
  let pdf: Buffer;
  let file: string;
  if (url.searchParams.get("type") === "anschreiben") {
    pdf = await letterPdf(m.data, ["[Firma]", "[Ansprechpartner]", "[Straße]", "[PLZ Ort]"], `Bewerbung als ${m.data.targetJob || "[Stelle]"}`, m.profile.baseLetter || baseLetter(m.data));
    file = `Anschreiben_Vorlage_${name}.pdf`;
  } else {
    pdf = await cvPdf(m.data, await readPhoto(m.booking.candidateId, m.profile.photoFile));
    file = `Lebenslauf_${name}.pdf`;
  }
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${file}"`, "Cache-Control": "private, no-store" } });
}
