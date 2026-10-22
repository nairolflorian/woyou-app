import "server-only";

// Marketingstrecke: automatische Hinweis-Mails entlang des Kundenwegs (Registrierung → Buchung → Mappe → Werkzeug).
// Weg 1 (22.10.2026): keine Versprechen zu Bewerbungen durch WoYou mehr, nur Unterlagen und Werkzeug.
// Die Mails werten den privaten Tracker der Kund:innen bewusst NICHT aus (nur Buchung, Mappe, Werkzeug-Laufzeit).
// Läuft täglich über /api/cron/marketing. Verschickt wird nur, wenn SMTP eingerichtet ist und MARKETING_MAILS nicht "off" ist.
// Jede Person bekommt je Schritt höchstens eine Mail und pro Lauf höchstens eine. Abmeldelink in jeder Mail.
// Deutsch, Englisch, Französisch; alle anderen Sprachen bekommen die englische Fassung.
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail, layout, mailEnabled } from "@/lib/mail";
import { ROLE } from "@/lib/enums";
import { BOOKING_STATUS } from "@/lib/services";
import { ANGEBOT, formatPrice } from "@/lib/angebot";

type Lang = "de" | "en" | "fr";
type Text = { subject: string; title: string; paras: string[]; button: string };
type Step = { key: string; name: string; when: string; path: string; text: Record<Lang, (v: Vars) => Text> };
type Vars = { name: string; price: string; months: number; month: string; abo: string; until: string };

const day = 864e5;
const base = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const secret = () => process.env.SESSION_PASSWORD || "woyou-demo-secret-please-change-me-32-characters-long-x";
export const unsubToken = (userId: string) => crypto.createHmac("sha256", secret()).update(`unsub:${userId}`).digest("base64url").slice(0, 32);
export const unsubUrl = (userId: string) => `${base()}/abmelden?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;
export const marketingActive = () => mailEnabled() && process.env.MARKETING_MAILS !== "off";

export const STEPS: Step[] = [
  {
    key: "REG_1", name: "Registriert, noch nicht gebucht (Tag 1)", when: "1 Tag nach Registrierung, keine Buchung", path: "/#angebot",
    text: {
      de: (v) => ({ subject: "Deine Bewerbungsunterlagen nach deutschem Standard", title: `Hallo ${v.name},`, paras: ["schön, dass du bei WoYou bist. Viele Bewerbungen aus dem Ausland scheitern an Kleinigkeiten: falsches Format, fehlende Angaben, kein passendes Anschreiben.", `Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Das Startpaket kostet einmalig ${v.price} und enthält ${v.months} Monate Werkzeug.`], button: "Startpaket ansehen" }),
      en: (v) => ({ subject: "Your application documents to German standards", title: `Hi ${v.name},`, paras: ["Great to have you at WoYou. Many applications from abroad fail on small things: the wrong format, missing details, no suitable cover letter.", `We create your application documents to German standards and give you a tool to find suitable jobs and apply yourself. The starter package costs ${v.price} once and includes ${v.months} months of the tool.`], button: "See the starter package" }),
      fr: (v) => ({ subject: "Votre dossier de candidature aux normes allemandes", title: `Bonjour ${v.name},`, paras: ["Ravis de vous compter chez WoYou. Beaucoup de candidatures venant de l'étranger échouent pour des détails : mauvais format, informations manquantes, pas de lettre adaptée.", `Nous créons votre dossier de candidature aux normes allemandes et vous donnons un outil pour trouver des offres adaptées et postuler vous-même. Le pack de départ coûte ${v.price} une seule fois et comprend ${v.months} mois d'outil.`], button: "Voir le pack de départ" }),
    },
  },
  {
    key: "REG_3", name: "Registriert, noch nicht gebucht (Tag 3)", when: "3 Tage nach Registrierung, keine Buchung", path: "/#ablauf",
    text: {
      de: (v) => ({ subject: "So funktioniert WoYou", title: `Hallo ${v.name},`, paras: ["kurz erklärt: Du füllst deine Bewerbungsmappe aus oder lädst deinen Lebenslauf hoch. Wir prüfen alles und machen deine Unterlagen fertig. Im Werkzeug suchst du dann selbst Stellen, erstellst für jede ein Anschreiben und bewirbst dich aus deinem eigenen Postfach. Die Antworten bekommst du direkt.", "Fragen? Antworte einfach auf diese Mail."], button: "Ablauf ansehen" }),
      en: (v) => ({ subject: "How WoYou works", title: `Hi ${v.name},`, paras: ["In short: you fill in your application folder or upload your CV. We check everything and get your documents ready. In the tool you then search for jobs yourself, create a cover letter for each and apply from your own inbox. Replies come straight to you.", "Questions? Just reply to this email."], button: "See how it works" }),
      fr: (v) => ({ subject: "Comment fonctionne WoYou", title: `Bonjour ${v.name},`, paras: ["En bref : vous remplissez votre dossier ou téléchargez votre CV. Nous vérifions tout et préparons vos documents. Dans l'outil, vous cherchez ensuite vous-même des offres, créez une lettre pour chacune et postulez depuis votre propre boîte e-mail. Les réponses vous arrivent directement.", "Des questions ? Répondez simplement à cet e-mail."], button: "Voir le déroulement" }),
    },
  },
  {
    key: "REG_7", name: "Registriert, noch nicht gebucht (Tag 7)", when: "7 Tage nach Registrierung, keine Buchung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Noch Fragen zu WoYou?", title: `Hallo ${v.name},`, paras: [`wir haben gesehen, dass du dich noch nicht entschieden hast. Das Startpaket kostet einmalig ${v.price} und enthält deine Unterlagen und ${v.months} Monate Bewerbungswerkzeug. Danach verlängerst du nur, wenn du willst. Versteckte Kosten gibt es nicht.`, "Wenn dir etwas unklar ist, antworte auf diese Mail oder ruf uns an. Das ist unsere letzte Erinnerung."], button: "Jetzt buchen" }),
      en: (v) => ({ subject: "Any questions about WoYou?", title: `Hi ${v.name},`, paras: [`We noticed you haven't decided yet. The starter package costs ${v.price} once and includes your documents and ${v.months} months of the application tool. After that you only extend if you want to. No hidden costs.`, "If anything is unclear, reply to this email or call us. This is our last reminder."], button: "Book now" }),
      fr: (v) => ({ subject: "Des questions sur WoYou ?", title: `Bonjour ${v.name},`, paras: [`Vous n'avez pas encore réservé. Le pack de départ coûte ${v.price} une seule fois et comprend votre dossier et ${v.months} mois d'outil de candidature. Ensuite, vous prolongez seulement si vous le souhaitez. Sans frais cachés.`, "Si quelque chose n'est pas clair, répondez à cet e-mail ou appelez-nous. C'est notre dernier rappel."], button: "Réserver" }),
    },
  },
  {
    key: "PAY_1", name: "Gebucht, Zahlung offen", when: "1 Tag nach Buchung ohne Zahlung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Deine Buchung wartet noch auf die Zahlung", title: `Hallo ${v.name},`, paras: ["du hast das Startpaket gebucht, die Zahlung ist aber noch nicht abgeschlossen. Sobald sie da ist, schalten wir dein Bewerbungswerkzeug frei."], button: "Zahlung abschließen" }),
      en: (v) => ({ subject: "Your booking is waiting for payment", title: `Hi ${v.name},`, paras: ["You booked the starter package, but the payment is not complete yet. As soon as it is, we unlock your application tool."], button: "Complete payment" }),
      fr: (v) => ({ subject: "Votre réservation attend le paiement", title: `Bonjour ${v.name},`, paras: ["Vous avez réservé le pack de départ, mais le paiement n'est pas encore finalisé. Dès qu'il l'est, nous activons votre outil de candidature."], button: "Finaliser le paiement" }),
    },
  },
  {
    key: "MAPPE_2", name: "Bezahlt, Mappe nicht eingereicht (Tag 2)", when: "2 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Deine Bewerbungsmappe fehlt noch", title: `Hallo ${v.name},`, paras: ["damit wir deine Unterlagen fertig machen können, brauchen wir deine Angaben: Berufserfahrung, Ausbildung, Sprachen. Das dauert etwa 15 Minuten. Du kannst auch einfach deinen eigenen Lebenslauf hochladen."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "Your application folder is still missing", title: `Hi ${v.name},`, paras: ["To get your documents ready, we need your details: work experience, education, languages. It takes about 15 minutes. You can also simply upload your own CV."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Votre dossier de candidature manque encore", title: `Bonjour ${v.name},`, paras: ["Pour préparer vos documents, nous avons besoin de vos informations : expérience, formation, langues. Cela prend environ 15 minutes. Vous pouvez aussi simplement télécharger votre CV."], button: "Remplir le dossier" }),
    },
  },
  {
    key: "MAPPE_5", name: "Bezahlt, Mappe nicht eingereicht (Tag 5)", when: "5 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Wir warten auf deine Angaben", title: `Hallo ${v.name},`, paras: ["dein Startpaket ist bezahlt, aber wir können deine Unterlagen erst prüfen, wenn deine Mappe da ist. Die Stellensuche kannst du schon nutzen. Wenn du Hilfe brauchst, antworte auf diese Mail. Wir rufen dich gern an."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "We are waiting for your details", title: `Hi ${v.name},`, paras: ["Your starter package is paid, but we can only check your documents once your folder is complete. You can already use the job search. If you need help, reply to this email and we will call you."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Nous attendons vos informations", title: `Bonjour ${v.name},`, paras: ["Votre pack de départ est payé, mais nous ne pouvons vérifier vos documents qu'avec votre dossier. Vous pouvez déjà utiliser la recherche d'emploi. Besoin d'aide ? Répondez à cet e-mail, nous vous appelons volontiers."], button: "Remplir le dossier" }),
    },
  },
  {
    key: "TOOL_START", name: "Unterlagen fertig, Werkzeug kurz vorgestellt", when: "3 Tage nach Freigabe der Mappe", path: "/stellensuche",
    text: {
      de: (v) => ({ subject: "So findest du passende Stellen", title: `Hallo ${v.name},`, paras: ["deine Unterlagen sind fertig. In der Stellensuche findest du aktuelle Stellen zu deinem Profil und siehst gleich, welches Deutsch verlangt wird. Merk dir die Stellen, die dir gefallen. Für jede erstellst du ein passendes Anschreiben und bewirbst dich selbst."], button: "Stellensuche öffnen" }),
      en: (v) => ({ subject: "How to find suitable jobs", title: `Hi ${v.name},`, paras: ["Your documents are ready. In the job search you find current jobs for your profile and see right away which German level is required. Save the jobs you like. For each one you create a matching cover letter and apply yourself."], button: "Open job search" }),
      fr: (v) => ({ subject: "Comment trouver des offres adaptées", title: `Bonjour ${v.name},`, paras: ["Vos documents sont prêts. Dans la recherche d'emploi, vous trouvez des offres actuelles pour votre profil et voyez tout de suite le niveau d'allemand demandé. Gardez les offres qui vous plaisent. Pour chacune, vous créez une lettre adaptée et postulez vous-même."], button: "Ouvrir la recherche" }),
    },
  },
  {
    key: "TOOL_ENDS", name: "Werkzeug läuft bald ab", when: "Werkzeug endet in höchstens 7 Tagen, kein Abo", path: "/profil#verlaengern",
    text: {
      de: (v) => ({ subject: `Dein Bewerbungswerkzeug läuft am ${v.until} ab`, title: `Hallo ${v.name},`, paras: [`dein Bewerbungswerkzeug läuft am ${v.until} ab. Wenn du weiter suchen und Anschreiben erstellen willst, kannst du für ${v.month} einen Monat verlängern oder ein Abo für ${v.abo} im Monat abschließen, monatlich kündbar.`, "Wenn nicht, musst du nichts tun. Der Zugang endet einfach, und deine Unterlagen kannst du weiter herunterladen."], button: "Werkzeug verlängern" }),
      en: (v) => ({ subject: `Your application tool expires on ${v.until}`, title: `Hi ${v.name},`, paras: [`Your application tool expires on ${v.until}. If you want to keep searching and creating cover letters, you can extend by one month for ${v.month} or take a subscription for ${v.abo} a month, cancellable monthly.`, "If not, you don't need to do anything. Your access simply ends, and you can still download your documents."], button: "Extend the tool" }),
      fr: (v) => ({ subject: `Votre outil de candidature expire le ${v.until}`, title: `Bonjour ${v.name},`, paras: [`Votre outil de candidature expire le ${v.until}. Pour continuer à chercher et créer des lettres, vous pouvez prolonger d'un mois pour ${v.month} ou prendre un abonnement à ${v.abo} par mois, résiliable chaque mois.`, "Sinon, vous n'avez rien à faire. L'accès s'arrête simplement et vous pouvez toujours télécharger vos documents."], button: "Prolonger l'outil" }),
    },
  },
  {
    key: "FEEDBACK", name: "Rückmeldung nach einigen Wochen", when: "45 Tage nach Zahlung", path: "/#kontakt",
    text: {
      de: (v) => ({ subject: "Wie läuft es bei dir?", title: `Hallo ${v.name},`, paras: ["vor einigen Wochen hast du mit WoYou angefangen. Hast du Einladungen bekommen oder sogar eine Zusage? Wir freuen uns über eine kurze Antwort auf diese Mail. Und wenn dir am Werkzeug etwas fehlt, sag es uns."], button: "Kontakt" }),
      en: (v) => ({ subject: "How is it going?", title: `Hi ${v.name},`, paras: ["You started with WoYou a few weeks ago. Have you had interviews or even an offer? A short reply to this email would mean a lot. And if something is missing in the tool, let us know."], button: "Contact" }),
      fr: (v) => ({ subject: "Comment ça se passe ?", title: `Bonjour ${v.name},`, paras: ["Vous avez commencé avec WoYou il y a quelques semaines. Avez-vous reçu des invitations, voire une offre ? Une courte réponse à cet e-mail nous ferait plaisir. Et s'il manque quelque chose dans l'outil, dites-le-nous."], button: "Contact" }),
    },
  },
];

const UNSUB: Record<Lang, string> = {
  de: "Du möchtest keine Hinweise mehr von uns? Hier abmelden:",
  en: "Don't want these emails? Unsubscribe here:",
  fr: "Vous ne souhaitez plus recevoir ces e-mails ? Désinscription :",
};

const SIGN: Record<Lang, string> = { de: "Dein WoYou-Team", en: "Your WoYou team", fr: "L'équipe WoYou" };

export const langOf = (l?: string | null): Lang => (l === "de" || l === "fr" ? l : l ? "en" : "de"); // andere Sprachen: Englisch

export function render(step: Step, lang: Lang, v: Vars, userId: string) {
  const t0 = step.text[lang](v);
  const t = { ...t0, title: t0.title.replace(/\s+([,،])/, "$1") }; // ohne Vornamen: „Hallo,“
  const unsub = `${UNSUB[lang]} ${unsubUrl(userId)}`;
  return {
    subject: `WoYou: ${t.subject}`,
    text: [t.title, ...t.paras, `${t.button}: ${base()}${step.path}`, SIGN[lang], unsub].join("\n\n"),
    html: layout(t.title, [...t.paras, SIGN[lang]], { label: t.button, href: `${base()}${step.path}` }, unsub),
  };
}

export function sampleVars(): Vars {
  return { name: "Fatima", price: formatPrice(ANGEBOT.startpaket.priceCents), months: ANGEBOT.startpaket.toolMonths, month: formatPrice(ANGEBOT.verlaengerung.priceCents), abo: formatPrice(ANGEBOT.abo.priceCents), until: new Date(Date.now() + 5 * day).toLocaleDateString("de-DE") };
}

type Due = { userId: string; email: string; lang: Lang; step: Step; vars: Vars };

// Wer bekommt heute welche Mail? (ohne zu senden, auch für die Vorschau im Admin)
export async function dueMails(limit = 500): Promise<Due[]> {
  const now = Date.now();
  const users = await prisma.user.findMany({
    where: { role: ROLE.CANDIDATE, deletedAt: null, marketingOptOut: false, email: { not: null }, createdAt: { lt: new Date(now - day) } },
    include: {
      marketingSends: { select: { step: true } },
      candidate: {
        select: {
          firstName: true, toolAccessUntil: true,
          creditPurchases: { where: { kind: ANGEBOT.abo.kind, status: "ACTIVE" }, select: { id: true }, take: 1 },
          bookings: { where: { status: { not: BOOKING_STATUS.CANCELLED } }, orderBy: { createdAt: "desc" }, take: 1, include: { profile: { select: { status: true, approvedAt: true } } } },
        },
      },
    },
    take: 3000,
  });
  const out: Due[] = [];
  const v0 = sampleVars();
  for (const u of users) {
    if (out.length >= limit) break;
    const done = new Set(u.marketingSends.map((x) => x.step));
    const c = u.candidate;
    const b = c?.bookings[0];
    const age = now - u.createdAt.getTime();
    const lang = langOf(u.locale);
    const dateLocale = lang === "de" ? "de-DE" : lang === "fr" ? "fr-FR" : "en-GB";
    const vars: Vars = { ...v0, name: c?.firstName || "", until: c?.toolAccessUntil?.toLocaleDateString(dateLocale) ?? "" };
    let key: string | null = null;
    if (!b) {
      key = age > 7 * day ? "REG_7" : age > 3 * day ? "REG_3" : "REG_1";
    } else if (!b.paidAt) {
      if (now - b.createdAt.getTime() > day) key = "PAY_1";
    } else {
      const sincePaid = now - b.paidAt.getTime();
      const submitted = b.profile?.status === "SUBMITTED" || b.profile?.status === "APPROVED";
      const until = c?.toolAccessUntil?.getTime() ?? 0;
      const abo = (c?.creditPurchases.length ?? 0) > 0;
      if (!submitted) key = sincePaid > 5 * day ? "MAPPE_5" : sincePaid > 2 * day ? "MAPPE_2" : null;
      else if (until > now && until - now <= 7 * day && !abo && !done.has("TOOL_ENDS")) key = "TOOL_ENDS";
      else if (b.profile?.approvedAt && now - b.profile.approvedAt.getTime() > 3 * day && !done.has("TOOL_START")) key = "TOOL_START";
      else if (sincePaid > 45 * day) key = "FEEDBACK";
    }
    if (!key || done.has(key)) continue;
    const step = STEPS.find((s) => s.key === key)!;
    out.push({ userId: u.id, email: u.email!, lang, step, vars });
  }
  return out;
}

// Täglicher Lauf
export async function runMarketing() {
  if (!marketingActive()) return { active: false, sent: 0, failed: 0 };
  let sent = 0, failed = 0;
  for (const d of await dueMails(300)) {
    const m = render(d.step, d.lang, d.vars, d.userId);
    const r = await sendMail({ to: d.email, subject: m.subject, text: m.text, html: m.html, template: `marketing_${d.step.key}`, headers: { "List-Unsubscribe": `<${unsubUrl(d.userId)}>` } });
    if (r.status === "SENT") { await prisma.marketingSend.create({ data: { userId: d.userId, step: d.step.key } }).catch(() => {}); sent++; } else failed++;
  }
  return { active: true, sent, failed };
}
