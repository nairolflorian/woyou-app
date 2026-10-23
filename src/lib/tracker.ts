import "server-only";

// Weg 1: Bewerbungs-Tracker der Kund:innen (gemerkte Stellen, eigener Stand, Notizen, Anschreiben je Stelle).
// Die Person pflegt alles selbst und verschickt selbst. WoYou versendet nichts und liest keine Antworten.
import type { SavedJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { letterForJob, subjectLine, salutation } from "@/lib/letters";
import { letterPdf, cvPdf, bundlePdf, type DocLang } from "@/lib/pdf";
import { readPhoto, readOwnCv } from "@/lib/mappe";
import { buildEml, safeFilename } from "@/lib/eml";
import { docx, type DocPara } from "@/lib/docx";
import type { ProfileData } from "@/lib/application";
import { profileForCandidate } from "@/lib/stellensuche";
import { coverMail, isEmail, isHttpUrl, type TrackerStatus } from "@/lib/stellensuche-core";

export type TrackerItem = {
  id: string; source: string; title: string; company: string; city: string | null; url: string | null; applyUrl: string | null;
  email: string | null; status: TrackerStatus; appliedAt: string | null; repliedAt: string | null; interviewAt: string | null;
  notes: string; coverLetter: string | null; letterLang: DocLang; hasEnglish: boolean; germanRequired: string | null; createdAt: string;
  // Entwurf für den Selbstversand (gespeicherter Stand oder Vorschlag)
  mailTo: string; mailSubject: string; mailBody: string; draftEdited: boolean; followUpAt: string | null;
};

export type TrackerCtx = { data: ProfileData | null; dataEn: ProfileData | null; candidateName: string; phone: string; email: string };

/** Eigene Bewerbungs-Adresse: im Profil hinterlegt, sonst Login-Mail */
export const applicationEmailOf = (c: { applicationEmail: string | null; user: { email: string | null } }) =>
  (isEmail(c.applicationEmail) ? c.applicationEmail.trim() : isEmail(c.user.email) ? c.user.email.trim() : "");

/** Mappe-Daten mit der eigenen Bewerbungs-Adresse, damit sie in Anschreiben und Lebenslauf steht */
const withEmail = (d: ProfileData, email: string): ProfileData => (email ? { ...d, email } : d);

/** Vorschlag für Betreff und Mailtext einer Stelle */
export function draftFor(j: SavedJob, p: TrackerCtx, lang: DocLang) {
  const d = lang === "en" ? p.dataEn ?? p.data : p.data;
  const name = (d ? `${d.firstName} ${d.lastName}`.trim() : "") || p.candidateName;
  const subject = subjectLine({ title: j.title, company: j.company, ref: j.source === "BA" ? j.sourceRef : null }, lang);
  const body = coverMail({ lang, title: j.title, salutation: salutation(j.contactName, lang), name, phone: d?.phone || p.phone, email: p.email || d?.email });
  return { subject, body };
}

const meta = (j: SavedJob) => { try { return JSON.parse(j.meta || "{}") as { germanRequired?: string | null }; } catch { return {}; } };

export function toItem(j: SavedJob, p: TrackerCtx): TrackerItem {
  const lang = (j.letterLang === "en" ? "en" : "de") as DocLang;
  const draft = draftFor(j, p, lang);
  return {
    id: j.id, source: j.source, title: j.title, company: j.company, city: j.city, url: isHttpUrl(j.url) ? j.url : null, applyUrl: isHttpUrl(j.applyUrl) ? j.applyUrl : null,
    email: isEmail(j.email) ? j.email : null, status: j.status as TrackerStatus, appliedAt: j.appliedAt?.toISOString() ?? null, repliedAt: j.repliedAt?.toISOString() ?? null,
    interviewAt: j.interviewAt?.toISOString() ?? null, notes: j.notes ?? "", coverLetter: j.coverLetter, letterLang: lang, hasEnglish: !!p.dataEn,
    germanRequired: meta(j).germanRequired ?? null, createdAt: j.createdAt.toISOString(),
    mailTo: j.mailTo ?? (isEmail(j.email) ? j.email : ""), mailSubject: j.mailSubject ?? draft.subject, mailBody: j.mailBody ?? draft.body,
    draftEdited: j.mailSubject !== null || j.mailBody !== null, followUpAt: j.followUpAt?.toISOString() ?? null,
  };
}

export async function trackerItems(candidateId: string) {
  const [jobs, p] = await Promise.all([
    prisma.savedJob.findMany({ where: { candidateId }, orderBy: [{ updatedAt: "desc" }] }),
    profileForCandidate(candidateId),
  ]);
  const ctx: TrackerCtx = { data: p.data, dataEn: p.dataEn, candidateName: [p.candidate.firstName, p.candidate.lastName].filter(Boolean).join(" "), phone: p.candidate.whatsappNumber || p.candidate.user.phone || "", email: applicationEmailOf(p.candidate) };
  const ownCv = !!(p.booking?.profile?.useOwnCv && p.booking.profile.ownCvFile);
  return { items: jobs.map((j) => toItem(j, ctx)), ctx, ownCv };
}

/** Eintrag der Person laden (fremde Einträge gibt es für sie nicht) */
export async function ownJob(candidateId: string, id: string) {
  const j = await prisma.savedJob.findUnique({ where: { id } });
  return j && j.candidateId === candidateId ? j : null;
}

/** Anschreiben für eine gemerkte Stelle erstellen (KI, wenn eingerichtet, sonst sachliche Vorlage) */
export async function generateLetter(candidateId: string, id: string, lang: DocLang) {
  const j = await ownJob(candidateId, id);
  if (!j) throw new Error("Nicht gefunden");
  const p = await profileForCandidate(candidateId);
  const d = lang === "en" ? p.dataEn ?? p.data : p.data;
  if (!d) throw new Error("Bitte fülle zuerst deine Bewerbungsmappe aus. Daraus entsteht das Anschreiben.");
  const letter = await letterForJob(d, { title: j.title, company: j.company, city: j.city, ref: j.source === "BA" ? j.sourceRef : null, contactName: j.contactName, description: j.description }, lang);
  return prisma.savedJob.update({ where: { id }, data: { coverLetter: letter.text, letterLang: lang } });
}

/** Anschreiben einer gemerkten Stelle als PDF oder Word */
export async function letterFile(candidateId: string, id: string, format: "pdf" | "docx") {
  const j = await ownJob(candidateId, id);
  if (!j || !j.coverLetter) return null;
  const p = await profileForCandidate(candidateId);
  const lang = (j.letterLang === "en" ? "en" : "de") as DocLang, en = lang === "en";
  const d0 = (en ? p.dataEn ?? p.data : p.data);
  if (!d0) return null;
  const d = withEmail(d0, applicationEmailOf(p.candidate));
  const name = safeFilename(`${d.firstName}_${d.lastName}`) || "Bewerbung";
  const recipient = [j.company, j.contactName ? `${en ? "Attn." : "z. Hd."} ${j.contactName}` : en ? "Human Resources" : "Personalabteilung", j.city ?? ""];
  const subject = subjectLine({ title: j.title, company: j.company, ref: j.source === "BA" ? j.sourceRef : null }, lang);
  const base = `${en ? "Cover_letter" : "Anschreiben"}_${name}_${safeFilename(j.company).slice(0, 40)}`;
  if (format === "pdf") return { body: await letterPdf(d, recipient, subject, j.coverLetter, lang), file: `${base}.pdf`, type: "application/pdf" };
  const fullName = `${d.firstName} ${d.lastName}`.trim();
  const sender = [fullName, d.street, d.zipCity, d.phone, d.email].filter(Boolean).join("  ·  ");
  const today = new Date().toLocaleDateString(en ? "en-GB" : "de-DE");
  const paras: DocPara[] = [
    { text: sender, size: 9, align: "right", color: "5C5C5C", spaceAfter: 480 },
    { text: recipient.filter(Boolean).join("\n"), spaceAfter: 480 },
    { text: `${d.zipCity.replace(/^\d{4,5}\s*/, "") || ""}${d.zipCity ? ", " : ""}${today}`, align: "right", spaceAfter: 360 },
    { text: subject, bold: true, spaceAfter: 320 },
    ...j.coverLetter.split(/\n\s*\n/).map((x) => ({ text: x.trim(), spaceAfter: 200 })),
    { text: en ? "Enclosure: CV" : "Anlage: Lebenslauf", size: 9, color: "5C5C5C" },
  ];
  return { body: docx(paras, subject), file: `${base}.docx`, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
}

// ---------- Selbstversand: Unterlagen und fertige E-Mail ----------
// Alles wird nur für die Person selbst erzeugt und heruntergeladen. WoYou verschickt nichts.

/** Anschreiben (PDF), Lebenslauf (PDF) und beides zusammen, mit der eigenen Bewerbungs-Adresse */
export async function sendFiles(candidateId: string, id: string) {
  const j = await ownJob(candidateId, id);
  if (!j || !j.coverLetter) return null;
  const p = await profileForCandidate(candidateId);
  const lang = (j.letterLang === "en" ? "en" : "de") as DocLang, en = lang === "en";
  const d0 = en ? p.dataEn ?? p.data : p.data;
  if (!d0 || !p.booking?.profile) return null;
  const email = applicationEmailOf(p.candidate);
  const d = withEmail(d0, email);
  const prof = p.booking.profile;
  const photo = await readPhoto(candidateId, prof.photoFile);
  const own = prof.useOwnCv ? await readOwnCv(p.candidate, prof.ownCvFile) : null;
  const recipient = [j.company, j.contactName ? `${en ? "Attn." : "z. Hd."} ${j.contactName}` : en ? "Human Resources" : "Personalabteilung", j.city ?? ""];
  const subject = subjectLine({ title: j.title, company: j.company, ref: j.source === "BA" ? j.sourceRef : null }, lang);
  const name = safeFilename(`${d.firstName}_${d.lastName}`) || "Bewerbung";
  const firm = safeFilename(j.company).slice(0, 40).replace(/_+$/, "");
  const [letter, cv] = await Promise.all([letterPdf(d, recipient, subject, j.coverLetter, lang), own ? Promise.resolve(own) : cvPdf(d, photo, lang)]);
  // Eigener, hochgeladener Lebenslauf lässt sich ohne Zusatzpaket nicht mit dem Anschreiben zusammenführen: dann zwei Dateien
  const bundle = own ? null : await bundlePdf(d, photo, recipient, subject, j.coverLetter, lang);
  const ctx: TrackerCtx = { data: p.data, dataEn: p.dataEn, candidateName: `${d.firstName} ${d.lastName}`.trim(), phone: p.candidate.whatsappNumber || p.candidate.user.phone || "", email };
  return {
    job: j, ctx, email, fullName: `${d.firstName} ${d.lastName}`.trim(),
    letter: { body: letter, file: `${en ? "Cover_letter" : "Anschreiben"}_${name}_${firm}.pdf` },
    cv: { body: cv, file: `${en ? "CV" : "Lebenslauf"}_${name}.pdf` },
    bundle: bundle ? { body: bundle, file: `${en ? "Application" : "Bewerbung"}_${name}_${firm}.pdf` } : null,
  };
}

/** Fertige E-Mail als .eml (Entwurf mit Anhängen) für Outlook, Apple Mail, Thunderbird */
export async function emlFile(candidateId: string, id: string) {
  const f = await sendFiles(candidateId, id);
  if (!f) return null;
  const item = toItem(f.job, f.ctx);
  const text = buildEml({
    from: f.email ? { name: f.fullName, email: f.email } : null,
    to: item.mailTo, subject: item.mailSubject, body: item.mailBody,
    attachments: [
      { filename: f.letter.file, type: "application/pdf", data: f.letter.body },
      { filename: f.cv.file, type: "application/pdf", data: f.cv.body },
    ],
  });
  return { body: Buffer.from(text, "utf8"), file: `${f.letter.file.replace(/^(Anschreiben|Cover_letter)/, f.job.letterLang === "en" ? "Email" : "E-Mail").replace(/\.pdf$/, "")}.eml` };
}
