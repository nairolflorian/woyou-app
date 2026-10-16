import { NextResponse } from "next/server";
import { mappeForRequest, readPhoto } from "@/lib/mappe";
import { cvPdf, letterPdf } from "@/lib/pdf";
import { baseLetter } from "@/lib/letters";
import type { DocLang } from "@/lib/pdf";

// Vorschau: ?type=cv | anschreiben  (Admin zusätzlich &bookingId=…)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = await mappeForRequest(url.searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const lang: DocLang = m.admin && url.searchParams.get("lang") === "en" ? "en" : "de";
  const d = lang === "en" ? m.dataEn ?? m.data : m.data;
  const name = `${d.firstName}_${d.lastName}`.replace(/[^A-Za-z0-9_-]+/g, "") || "Bewerbung";
  let pdf: Buffer;
  let file: string;
  if (url.searchParams.get("type") === "anschreiben") {
    pdf = lang === "en"
      ? await letterPdf(d, ["[Company]", "[Contact person]", "[Street]", "[Postcode, city]"], `Application for the position of ${d.targetJob || "[position]"}`, baseLetter(d, "en"), "en")
      : await letterPdf(d, ["[Firma]", "[Ansprechpartner]", "[Straße]", "[PLZ Ort]"], `Bewerbung als ${d.targetJob || "[Stelle]"}`, m.profile.baseLetter || baseLetter(d));
    file = `${lang === "en" ? "Cover_letter_template" : "Anschreiben_Vorlage"}_${name}.pdf`;
  } else {
    pdf = await cvPdf(d, await readPhoto(m.booking.candidateId, m.profile.photoFile), lang);
    file = `${lang === "en" ? "CV" : "Lebenslauf"}_${name}.pdf`;
  }
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${file}"`, "Cache-Control": "private, no-store" } });
}
