import "server-only";

// Weg 1: Bewerbungs-Tracker der Kund:innen (gemerkte Stellen, eigener Stand, Notizen, Anschreiben je Stelle).
// Die Person pflegt alles selbst und verschickt selbst. WoYou versendet nichts und liest keine Antworten.
import type { SavedJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { letterForJob, subjectLine, salutation } from "@/lib/letters";
import { letterPdf, type DocLang } from "@/lib/pdf";
import { docx, type DocPara } from "@/lib/docx";
import type { ProfileData } from "@/lib/application";
import { profileForCandidate } from "@/lib/stellensuche";
import { coverMail, mailtoHref, isEmail, isHttpUrl, type TrackerStatus } from "@/lib/stellensuche-core";

export type TrackerItem = {
  id: string; source: string; title: string; company: string; city: string | null; url: string | null; applyUrl: string | null;
  email: string | null; status: TrackerStatus; appliedAt: string | null; repliedAt: string | null; interviewAt: string | null;
  notes: string; coverLetter: string | null; letterLang: DocLang; hasEnglish: boolean; mailto: string | null; germanRequired: string | null; createdAt: string;
};

const meta = (j: SavedJob) => { try { return JSON.parse(j.meta || "{}") as { germanRequired?: string | null }; } catch { return {}; } };

export function toItem(j: SavedJob, p: { data: ProfileData | null; dataEn: ProfileData | null; candidateName: string; phone: string }): TrackerItem {
  const lang = (j.letterLang === "en" ? "en" : "de") as DocLang;
  const d = lang === "en" ? p.dataEn ?? p.data : p.data;
  const name = d ? `${d.firstName} ${d.lastName}`.trim() : p.candidateName;
  const subject = subjectLine({ title: j.title, company: j.company, ref: j.source === "BA" ? j.sourceRef : null }, lang);
  const body = coverMail({ lang, title: j.title, salutation: salutation(j.contactName, lang), name: name || p.candidateName, phone: d?.phone || p.phone });
  return {
    id: j.id, source: j.source, title: j.title, company: j.company, city: j.city, url: isHttpUrl(j.url) ? j.url : null, applyUrl: isHttpUrl(j.applyUrl) ? j.applyUrl : null,
    email: isEmail(j.email) ? j.email : null, status: j.status as TrackerStatus, appliedAt: j.appliedAt?.toISOString() ?? null, repliedAt: j.repliedAt?.toISOString() ?? null,
    interviewAt: j.interviewAt?.toISOString() ?? null, notes: j.notes ?? "", coverLetter: j.coverLetter, letterLang: lang, hasEnglish: !!p.dataEn,
    mailto: isEmail(j.email) ? mailtoHref(j.email, subject, body) : null, germanRequired: meta(j).germanRequired ?? null, createdAt: j.createdAt.toISOString(),
  };
}

export async function trackerItems(candidateId: string) {
  const [jobs, p] = await Promise.all([
    prisma.savedJob.findMany({ where: { candidateId }, orderBy: [{ updatedAt: "desc" }] }),
    profileForCandidate(candidateId),
  ]);
  const ctx = { data: p.data, dataEn: p.dataEn, candidateName: [p.candidate.firstName, p.candidate.lastName].filter(Boolean).join(" "), phone: p.candidate.whatsappNumber || p.candidate.user.phone || "" };
  return { items: jobs.map((j) => toItem(j, ctx)), ctx };
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
  const d = (en ? p.dataEn ?? p.data : p.data);
  if (!d) return null;
  const name = `${d.firstName}_${d.lastName}`.replace(/[^A-Za-z0-9_-]+/g, "") || "Bewerbung";
  const recipient = [j.company, j.contactName ? `${en ? "Attn." : "z. Hd."} ${j.contactName}` : en ? "Human Resources" : "Personalabteilung", j.city ?? ""];
  const subject = subjectLine({ title: j.title, company: j.company, ref: j.source === "BA" ? j.sourceRef : null }, lang);
  const base = `${en ? "Cover_letter" : "Anschreiben"}_${name}_${j.company.replace(/[^A-Za-z0-9]+/g, "_").slice(0, 40)}`;
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
