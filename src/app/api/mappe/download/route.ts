import { NextResponse } from "next/server";
import { mappeForRequest, readPhoto, readOwnCv } from "@/lib/mappe";
import { cvPdf, letterPdf, type DocLang } from "@/lib/pdf";
import { gapLetter } from "@/lib/letters";
import { docx, type DocPara } from "@/lib/docx";
import { parseProfile } from "@/lib/application";
import { cvParas } from "@/lib/cv-docx";
import { isEmail } from "@/lib/stellensuche-core";

// Unterlagen zum Herunterladen und freien Weiterverwenden (Kund:in für die eigene Mappe, Team mit bookingId):
//   ?doc=cv            Lebenslauf als PDF (eigener hochgeladener Lebenslauf, wenn so eingestellt)
//   ?doc=cv-docx       Lebenslauf als Word-Datei (zum Weiterbearbeiten)
//   ?doc=letter-docx   Anschreiben-Muster mit Lücken als Word-Datei
//   ?doc=letter-pdf    dasselbe Muster als PDF
//   &lang=en           englische Fassung (falls gepflegt)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = await mappeForRequest(url.searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const lang: DocLang = url.searchParams.get("lang") === "en" ? "en" : "de";
  const d0 = lang === "en" && m.profile.dataEn ? { ...parseProfile(m.profile.dataEn), design: m.data.design } : m.data; // Design gilt für beide Sprachen
  // eigene Bewerbungs-Adresse aus dem Profil (Weg 1), sonst die Adresse aus der Mappe
  const appMail = m.booking.candidate.applicationEmail;
  const d = appMail && isEmail(appMail) ? { ...d0, email: appMail.trim() } : d0;
  const name = `${d.firstName}_${d.lastName}`.replace(/[^A-Za-z0-9_-]+/g, "") || "Bewerbung";
  const en = lang === "en";
  const doc = url.searchParams.get("doc");
  const send = (body: Buffer, file: string, type: string) =>
    new NextResponse(new Uint8Array(body), { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "private, no-store" } });

  if (doc === "cv") {
    const own = m.profile.useOwnCv ? await readOwnCv(m.booking.candidate, m.profile.ownCvFile) : null;
    const pdf = own ?? (await cvPdf(d, await readPhoto(m.booking.candidateId, m.profile.photoFile), lang));
    return send(pdf, `${en ? "CV" : "Lebenslauf"}_${name}.pdf`, "application/pdf");
  }
  if (doc === "cv-docx") {
    return send(docx(cvParas(d, lang), `${en ? "CV" : "Lebenslauf"} ${d.firstName} ${d.lastName}`.trim()), `${en ? "CV" : "Lebenslauf"}_${name}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  }
  const g = gapLetter(d, lang);
  if (doc === "letter-pdf") {
    const pdf = await letterPdf(d, g.recipient, g.subject, g.text, lang);
    return send(pdf, `${en ? "Cover_letter_template" : "Anschreiben_Vorlage"}_${name}.pdf`, "application/pdf");
  }
  if (doc === "letter-docx") {
    const fullName = `${d.firstName} ${d.lastName}`.trim();
    const sender = [fullName, d.street, d.zipCity, d.phone, d.email].filter(Boolean).join("  ·  ");
    const hint = en
      ? "Template: replace everything in [square brackets] (highlighted in yellow) and delete this note. Check every sentence before sending."
      : "Vorlage: Alles in [eckigen Klammern] (gelb markiert) ersetzen und diesen Hinweis löschen. Vor dem Versand jeden Satz prüfen.";
    const paras: DocPara[] = [
      { text: hint, size: 9, color: "8A8A8A", spaceAfter: 240 },
      { text: sender, size: 9, align: "right", color: "5C5C5C", spaceAfter: 480 },
      { text: g.recipient.join("\n"), spaceAfter: 480 },
      { text: g.place, align: "right", spaceAfter: 360 },
      { text: g.subject, bold: true, spaceAfter: 320 },
      ...g.text.split(/\n\s*\n/).map((p) => ({ text: p.trim(), spaceAfter: 200 })),
      { text: en ? "Enclosure: CV" : "Anlage: Lebenslauf", size: 9, color: "5C5C5C" },
    ];
    return send(docx(paras, g.subject), `${en ? "Cover_letter_template" : "Anschreiben_Vorlage"}_${name}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  }
  return NextResponse.json({ error: "Unbekanntes Dokument" }, { status: 400 });
}
