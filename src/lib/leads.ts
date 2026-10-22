import "server-only";

// ABGESCHALTET (Weg 1, siehe src/lib/weg1.ts): Stellen je Buchung durch das Team übernehmen und versenden.
// Bleibt nur für Altdaten und zum Nachlesen im Repo.
import { prisma } from "@/lib/prisma";
import { jobDetails, jobUrl, extractEmails } from "@/lib/jobs-ba";
import { letterForJob, subjectLine, salutation } from "@/lib/letters";
import { parseProfile } from "@/lib/application";
import { cvPdf, letterPdf, type DocLang } from "@/lib/pdf";
import { readPhoto, readOwnCv, withProfile } from "@/lib/mappe";
import { sendMail, layout, mailEnabled, type Attachment } from "@/lib/mail";
import { aliasAddress } from "@/lib/alias";
import { BOOKING_STATUS } from "@/lib/services";
import { consumeCredit, refundCredit, creditState } from "@/lib/credits";
import { WEG1, Weg1Gesperrt } from "@/lib/weg1";

export const ACTIVE_LEAD = ["SELECTED", "READY", "SENT", "APPLIED_MANUALLY"];
export const DONE_LEAD = ["SENT", "APPLIED_MANUALLY"];

// Daten für die gewünschte Sprache: englische Fassung, falls gepflegt, sonst die deutsche Mappe
export function profileFor(profile: { data: string; dataEn: string | null } | null, lang: string) {
  const de = parseProfile(profile?.data);
  return lang === "en" && profile?.dataEn ? { ...parseProfile(profile.dataEn), design: de.design } : de; // Design gilt für beide Sprachen
}

// Mappe wird bei Bedarf angelegt (vorausgefüllt aus dem Kundenprofil), damit Unterlagen nie ohne Namen entstehen
async function bookingWithProfile(bookingId: string) {
  await withProfile(bookingId);
  return prisma.serviceBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { profile: true, candidate: { include: { user: true } } } });
}

export async function addLead(bookingId: string, job: { ref?: string | null; title: string; company: string; city?: string | null; url?: string | null; applyUrl?: string | null; email?: string | null; source?: string; description?: string | null }) {
  if (!WEG1.teamStellenauswahl) throw new Weg1Gesperrt("Die Stellenauswahl durch das Team");
  // Stelle steht schon als Vorschlag in der Liste? Dann diesen übernehmen
  if (job.ref) {
    const existing = await prisma.jobLead.findFirst({ where: { bookingId, sourceRef: job.ref, status: { in: ["SUGGESTED", "HIDDEN"] } } });
    if (existing) return selectSuggestion(existing.id);
  }
  const b = await bookingWithProfile(bookingId);

  let description: string | null = job.description?.trim() || null, email = job.email ?? (description ? extractEmails(description)[0] ?? null : null);
  if ((job.source ?? "BA") === "BA" && job.ref) {
    const det = await jobDetails(job.ref);
    if (det) { description = det.description.slice(0, 20000) || null; email = email || det.emails[0] || null; }
  }
  const data = parseProfile(b.profile?.data);
  const letter = await letterForJob(data, { title: job.title, company: job.company, city: job.city, ref: job.ref, description });
  return prisma.jobLead.create({
    data: {
      bookingId, source: job.source ?? "BA", sourceRef: job.ref ?? null, title: job.title.slice(0, 200), company: job.company.slice(0, 200), city: job.city ?? null,
      url: job.url ?? (job.ref && (job.source ?? "BA") === "BA" ? jobUrl(job.ref) : null), applyUrl: job.applyUrl ?? null, email, description, coverLetter: letter.text,
    },
  });
}

// Vorschlag übernehmen: zählt dann zu den 25, Anschreiben wird mit der Ausschreibung erstellt
export async function selectSuggestion(leadId: string) {
  if (!WEG1.teamStellenauswahl) throw new Weg1Gesperrt("Die Stellenauswahl durch das Team");
  const l = await prisma.jobLead.findUniqueOrThrow({ where: { id: leadId } });
  if (ACTIVE_LEAD.includes(l.status)) return l;
  const b = await bookingWithProfile(l.bookingId);
  const lang = l.lang as DocLang;
  const letter = await letterForJob(profileFor(b.profile, lang), { title: l.title, company: l.company, city: l.city, ref: l.sourceRef, contactName: l.contactName, description: l.description }, lang);
  return prisma.jobLead.update({ where: { id: leadId }, data: { status: "SELECTED", coverLetter: letter.text } });
}

export async function regenerateLetter(leadId: string) {
  const l = await prisma.jobLead.findUniqueOrThrow({ where: { id: leadId } });
  const b = await bookingWithProfile(l.bookingId);
  const lang = l.lang as DocLang;
  const letter = await letterForJob(profileFor(b.profile, lang), { title: l.title, company: l.company, city: l.city, ref: l.sourceRef, contactName: l.contactName, description: l.description }, lang);
  return prisma.jobLead.update({ where: { id: leadId }, data: { coverLetter: letter.text } });
}

export async function recount(bookingId: string) {
  const sent = await prisma.jobLead.count({ where: { bookingId, status: { in: DONE_LEAD } } });
  const b = await prisma.serviceBooking.findUniqueOrThrow({ where: { id: bookingId } });
  const status = sent > 0 && (b.status === BOOKING_STATUS.PAID || b.status === BOOKING_STATUS.REQUESTED) ? BOOKING_STATUS.IN_PROGRESS : b.status;
  await prisma.serviceBooking.update({ where: { id: bookingId }, data: { applicationsSent: sent, status } });
  return sent;
}

// PDFs für eine Stelle: Anschreiben + Lebenslauf (eigener oder erzeugter)
export async function leadDocuments(leadId: string) {
  const l = await prisma.jobLead.findUniqueOrThrow({ where: { id: leadId } });
  const b = await bookingWithProfile(l.bookingId);
  const lang = l.lang as DocLang, en = lang === "en";
  const d = profileFor(b.profile, lang);
  const name = `${d.firstName}_${d.lastName}`.replace(/[^A-Za-z0-9_-]+/g, "") || "Bewerbung";
  const recipient = [l.company, l.contactName ? `${en ? "Attn." : "z. Hd."} ${l.contactName}` : en ? "Human Resources" : "Personalabteilung", l.city ?? ""];
  const letter = await letterPdf(d, recipient, subjectLine({ title: l.title, company: l.company, ref: l.sourceRef }, lang), l.coverLetter || "", lang);
  const own = b.profile?.useOwnCv ? await readOwnCv(b.candidate, b.profile.ownCvFile) : null;
  const cv = own ?? (await cvPdf(d, await readPhoto(b.candidateId, b.profile?.photoFile ?? null), lang));
  return { lead: l, booking: b, data: d, lang, files: [
    { filename: `${en ? "Cover_letter" : "Anschreiben"}_${name}.pdf`, content: letter, contentType: "application/pdf" },
    { filename: `${en ? "CV" : "Lebenslauf"}_${name}.pdf`, content: cv, contentType: "application/pdf" },
  ] as Attachment[] };
}

export async function sendApplication(leadId: string) {
  if (!WEG1.teamVersand) throw new Weg1Gesperrt("Der Versand von Bewerbungen durch WoYou");
  const { lead, booking, data, files, lang } = await leadDocuments(leadId);
  if (!mailEnabled()) throw new Error("Mailversand ist noch nicht eingerichtet (SMTP fehlt). Bitte vorerst manuell bewerben und als „beworben“ markieren.");
  if (!booking.consentSendAt) throw new Error("Für diese Buchung liegt keine Vollmacht zum Versand vor.");
  if (booking.profile?.status !== "APPROVED") throw new Error("Bitte zuerst die Bewerbungsmappe freigeben.");
  if (!lead.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) throw new Error("Bitte eine gültige Bewerbungs-E-Mail eintragen.");
  if (!lead.coverLetter || lead.coverLetter.length < 200) throw new Error("Das Anschreiben fehlt oder ist zu kurz.");
  // Guthaben: 1 Bewerbung abbuchen (mit Abo 0); schlägt der Versand fehl, wird zurückgebucht
  await consumeCredit(booking.candidateId, lead.id, booking.id, `${lead.title} · ${lead.company}`);

  const name = `${data.firstName} ${data.lastName}`.trim();
  const alias = aliasAddress(booking.aliasLocal);
  const customer = data.email || booking.candidate.user.email || "";
  // Absender: Name der Kund:in mit der WoYou-Versandadresse (MAIL_FROM, Domain woyou.de mit SPF/DKIM bei IONOS).
  // Antworten (Reply-To) gehen an die persönliche Adresse auf MAIL_ALIAS_DOMAIN (nur Empfang, Brevo leitet weiter),
  // ohne Alias direkt an die echte Adresse der Kund:in. Siehe deploy/MAIL-DNS.md.
  const fromBase = (process.env.MAIL_FROM || "WoYou <no-reply@woyou.de>").match(/<([^>]+)>/)?.[1] || process.env.MAIL_FROM || "no-reply@woyou.de";
  const from = `"${name.replace(/"/g, "")} (über WoYou)" <${fromBase}>`;
  const replyTo = alias || customer || undefined;
  const subject = subjectLine({ title: lead.title, company: lead.company, ref: lead.sourceRef }, lang);
  const body = (lang === "en"
    ? [salutation(lead.contactName, "en"), "", `Please find attached my application for the position of ${lead.title}, including my cover letter and CV.`, "", "I look forward to hearing from you.", "", "Kind regards", name, data.phone]
    : [salutation(lead.contactName), "", `anbei sende ich Ihnen meine Bewerbung als ${lead.title}. Mein Anschreiben und meinen Lebenslauf finden Sie im Anhang.`, "", "Ich freue mich auf Ihre Rückmeldung.", "", "Mit freundlichen Grüßen", name, data.phone]).filter((x) => x !== undefined).join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1f1f1f">${body.split("\n").map((x) => (x ? x.replace(/[<>&]/g, "") : "<br>")).join("<br>")}</div>`;

  const r = await sendMail({ to: lead.email, from, replyTo, subject, text: body, html, attachments: files, template: "application", bookingId: booking.id });
  if (r.status !== "SENT") await refundCredit(lead.id);
  if (r.status !== "SENT") throw new Error(`Versand fehlgeschlagen${"error" in r && r.error ? `: ${r.error}` : ""}`);

  await prisma.jobLead.update({ where: { id: lead.id }, data: { status: "SENT", sentAt: new Date() } });
  const sent = await recount(booking.id);
  await prisma.notification.create({ data: { userId: booking.candidate.userId, type: "APPLICATION_SENT", title: `Bewerbung an ${lead.company} verschickt`, body: `${sent} Bewerbungen verschickt`, link: "/profil" } }).catch(() => {});

  if (customer) {
    const cs = await creditState(booking.candidateId);
    const left = cs.unlimited ? "Du hast unbegrenzte Bewerbungen im Abo." : `Du hast noch ${cs.balance} Bewerbungen übrig.`;
    const paras = [`Hallo ${data.firstName},`, `wir haben deine Bewerbung als ${lead.title} an ${lead.company}${lead.city ? ` in ${lead.city}` : ""} verschickt. ${left}`, "Im Anhang findest du die Unterlagen, wie sie verschickt wurden. Wenn die Firma antwortet, bekommst du die Antwort direkt.", "Viele Grüße", "Dein WoYou-Team"];
    await sendMail({ to: customer, subject: `Kopie: Bewerbung an ${lead.company}`, text: paras.join("\n\n"), html: layout("Deine Bewerbung ist raus", paras), attachments: files, template: "application_copy", bookingId: booking.id });
  }
  return sent;
}

// „Jetzt bewerben“: alle freigegebenen Stellen (READY) mit E-Mail nacheinander verschicken, solange Guthaben reicht
export async function applyApproved(bookingId: string) {
  if (!WEG1.teamVersand) throw new Weg1Gesperrt("Der Versand von Bewerbungen durch WoYou");
  const leads = await prisma.jobLead.findMany({ where: { bookingId, status: "READY" }, orderBy: [{ score: "desc" }, { createdAt: "asc" }] });
  const result = { sent: 0, noEmail: [] as string[], failed: [] as { title: string; error: string }[], stoppedNoCredit: false };
  for (const l of leads) {
    if (!l.email) { result.noEmail.push(`${l.title} · ${l.company}`); continue; }
    try { await sendApplication(l.id); result.sent++; }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Kein Guthaben/.test(msg)) { result.stoppedNoCredit = true; break; }
      result.failed.push({ title: `${l.title} · ${l.company}`, error: msg });
      if (/SMTP|Vollmacht|Mappe/.test(msg)) break; // betrifft alle weiteren genauso
    }
  }
  return result;
}
