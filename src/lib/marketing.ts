import "server-only";

// Marketingstrecke: automatische Hinweis-Mails entlang des Kundenwegs (Registrierung → Buchung → Mappe → Guthaben).
// Läuft täglich über /api/cron/marketing. Verschickt wird nur, wenn SMTP eingerichtet ist und MARKETING_MAILS nicht "off" ist.
// Jede Person bekommt je Schritt höchstens eine Mail und pro Lauf höchstens eine. Abmeldelink in jeder Mail.
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail, layout, mailEnabled } from "@/lib/mail";
import { ROLE } from "@/lib/enums";
import { BOOKING_STATUS, CREDIT_PRODUCTS, SERVICES, formatPrice } from "@/lib/services";
import { creditState } from "@/lib/credits";

type Lang = "de" | "en" | "fr" | "ar";
type Text = { subject: string; title: string; paras: string[]; button: string };
type Step = { key: string; name: string; when: string; path: string; text: Record<Lang, (v: Vars) => Text> };
type Vars = { name: string; price: string; pack: string; abo: string; left: number; sent: number };

const day = 864e5;
const base = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const secret = () => process.env.SESSION_PASSWORD || "woyou-demo-secret-please-change-me-32-characters-long-x";
export const unsubToken = (userId: string) => crypto.createHmac("sha256", secret()).update(`unsub:${userId}`).digest("base64url").slice(0, 32);
export const unsubUrl = (userId: string) => `${base()}/abmelden?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;
export const marketingActive = () => mailEnabled() && process.env.MARKETING_MAILS !== "off";

export const STEPS: Step[] = [
  {
    key: "REG_1", name: "Registriert, noch nicht gebucht (Tag 1)", when: "1 Tag nach Registrierung, keine Buchung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Dein Lebenslauf nach deutschem Standard", title: `Hallo ${v.name},`, paras: ["schön, dass du bei WoYou bist. Viele Bewerbungen aus dem Ausland scheitern an Kleinigkeiten: falsches Format, fehlende Angaben, kein passendes Anschreiben.", `Wir erstellen deinen Lebenslauf nach deutschem Standard und schicken 25 passende Bewerbungen in deinem Namen. Einmalig ${v.price}.`], button: "Jetzt buchen" }),
      en: (v) => ({ subject: "Your CV to German standards", title: `Hi ${v.name},`, paras: ["Great to have you at WoYou. Many applications from abroad fail on small things: the wrong format, missing details, no suitable cover letter.", `We create your CV to German standards and send 25 suitable applications in your name. One-time ${v.price}.`], button: "Book now" }),
      fr: (v) => ({ subject: "Votre CV aux normes allemandes", title: `Bonjour ${v.name},`, paras: ["Ravis de vous compter chez WoYou. Beaucoup de candidatures venant de l'étranger échouent pour des détails : mauvais format, informations manquantes, pas de lettre adaptée.", `Nous créons votre CV aux normes allemandes et envoyons 25 candidatures adaptées en votre nom. ${v.price}, paiement unique.`], button: "Réserver" }),
      ar: (v) => ({ subject: "سيرتك الذاتية بالمعايير الألمانية", title: `مرحبًا ${v.name}،`, paras: ["يسعدنا انضمامك إلى WoYou. كثير من الطلبات من الخارج تفشل بسبب تفاصيل صغيرة: تنسيق خاطئ، معلومات ناقصة، أو غياب رسالة تحفيزية مناسبة.", `نُعدّ سيرتك الذاتية بالمعايير الألمانية ونرسل 25 طلبًا مناسبًا باسمك. ${v.price} مرة واحدة.`], button: "احجز الآن" }),
    },
  },
  {
    key: "REG_3", name: "Registriert, noch nicht gebucht (Tag 3)", when: "3 Tage nach Registrierung, keine Buchung", path: "/#ablauf",
    text: {
      de: (v) => ({ subject: "So bewerben wir dich in Deutschland", title: `Hallo ${v.name},`, paras: ["kurz erklärt, wie es läuft: Du füllst deine Bewerbungsmappe aus oder lädst deinen Lebenslauf hoch. Wir prüfen alles, suchen passende Stellen und schicken die Bewerbungen per E-Mail. Du bekommst von jeder Bewerbung eine Kopie und die Antworten der Firmen direkt.", "Fragen? Antworte einfach auf diese Mail."], button: "Ablauf ansehen" }),
      en: (v) => ({ subject: "How we apply for you in Germany", title: `Hi ${v.name},`, paras: ["Here is how it works: you fill in your application folder or upload your CV. We check everything, find suitable jobs and send the applications by email. You get a copy of every application and the companies' replies go straight to you.", "Questions? Just reply to this email."], button: "See how it works" }),
      fr: (v) => ({ subject: "Comment nous postulons pour vous en Allemagne", title: `Bonjour ${v.name},`, paras: ["En bref : vous remplissez votre dossier ou téléchargez votre CV. Nous vérifions tout, trouvons des offres adaptées et envoyons les candidatures par e-mail. Vous recevez une copie de chaque candidature et les réponses des entreprises directement.", "Des questions ? Répondez simplement à cet e-mail."], button: "Voir le déroulement" }),
      ar: (v) => ({ subject: "هكذا نقدّم طلباتك في ألمانيا", title: `مرحبًا ${v.name}،`, paras: ["باختصار: تملأ ملف التقديم أو ترفع سيرتك الذاتية. نراجع كل شيء، ونبحث عن وظائف مناسبة، ونرسل الطلبات بالبريد الإلكتروني. تصلك نسخة من كل طلب، وردود الشركات تصلك مباشرة.", "لديك سؤال؟ رد على هذه الرسالة."], button: "طريقة العمل" }),
    },
  },
  {
    key: "REG_7", name: "Registriert, noch nicht gebucht (Tag 7)", when: "7 Tage nach Registrierung, keine Buchung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Noch Fragen zum Bewerbungs-Service?", title: `Hallo ${v.name},`, paras: [`wir haben gesehen, dass du dich noch nicht entschieden hast. Das Startpaket kostet einmalig ${v.price} und enthält 25 Bewerbungen. Kein Abo, keine versteckten Kosten.`, "Wenn dir etwas unklar ist, antworte auf diese Mail oder ruf uns an. Das ist unsere letzte Erinnerung."], button: "Jetzt buchen" }),
      en: (v) => ({ subject: "Any questions about the application service?", title: `Hi ${v.name},`, paras: [`We noticed you haven't decided yet. The starter package costs ${v.price} once and includes 25 applications. No subscription, no hidden costs.`, "If anything is unclear, reply to this email or call us. This is our last reminder."], button: "Book now" }),
      fr: (v) => ({ subject: "Des questions sur le service de candidature ?", title: `Bonjour ${v.name},`, paras: [`Vous n'avez pas encore réservé. Le pack de départ coûte ${v.price} une seule fois et comprend 25 candidatures. Sans abonnement, sans frais cachés.`, "Si quelque chose n'est pas clair, répondez à cet e-mail ou appelez-nous. C'est notre dernier rappel."], button: "Réserver" }),
      ar: (v) => ({ subject: "هل لديك أسئلة عن خدمة التقديم؟", title: `مرحبًا ${v.name}،`, paras: [`لاحظنا أنك لم تقرر بعد. باقة البداية بـ ${v.price} مرة واحدة وتشمل 25 طلبًا. بدون اشتراك وبدون تكاليف مخفية.`, "إذا كان هناك ما هو غير واضح، رد على هذه الرسالة أو اتصل بنا. هذا آخر تذكير."], button: "احجز الآن" }),
    },
  },
  {
    key: "PAY_1", name: "Gebucht, Zahlung offen", when: "1 Tag nach Buchung ohne Zahlung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Deine Buchung wartet noch auf die Zahlung", title: `Hallo ${v.name},`, paras: ["du hast den Bewerbungs-Service gebucht, die Zahlung ist aber noch nicht abgeschlossen. Sobald sie da ist, starten wir mit deiner Bewerbungsmappe."], button: "Zahlung abschließen" }),
      en: (v) => ({ subject: "Your booking is waiting for payment", title: `Hi ${v.name},`, paras: ["You booked the application service, but the payment is not complete yet. As soon as it is, we start with your application folder."], button: "Complete payment" }),
      fr: (v) => ({ subject: "Votre réservation attend le paiement", title: `Bonjour ${v.name},`, paras: ["Vous avez réservé le service de candidature, mais le paiement n'est pas encore finalisé. Dès qu'il l'est, nous commençons votre dossier."], button: "Finaliser le paiement" }),
      ar: (v) => ({ subject: "حجزك بانتظار الدفع", title: `مرحبًا ${v.name}،`, paras: ["لقد حجزت خدمة التقديم، لكن الدفع لم يكتمل بعد. بمجرد اكتماله نبدأ بملفك."], button: "إتمام الدفع" }),
    },
  },
  {
    key: "MAPPE_2", name: "Bezahlt, Mappe nicht eingereicht (Tag 2)", when: "2 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Deine Bewerbungsmappe fehlt noch", title: `Hallo ${v.name},`, paras: ["damit wir dich bewerben können, brauchen wir deine Angaben: Berufserfahrung, Ausbildung, Sprachen. Das dauert etwa 15 Minuten. Du kannst auch einfach deinen eigenen Lebenslauf hochladen."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "Your application folder is still missing", title: `Hi ${v.name},`, paras: ["To apply for you, we need your details: work experience, education, languages. It takes about 15 minutes. You can also simply upload your own CV."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Votre dossier de candidature manque encore", title: `Bonjour ${v.name},`, paras: ["Pour postuler pour vous, nous avons besoin de vos informations : expérience, formation, langues. Cela prend environ 15 minutes. Vous pouvez aussi simplement télécharger votre CV."], button: "Remplir le dossier" }),
      ar: (v) => ({ subject: "ملف التقديم ما زال ناقصًا", title: `مرحبًا ${v.name}،`, paras: ["لكي نقدّم عنك نحتاج بياناتك: الخبرة، التكوين، اللغات. يستغرق ذلك حوالي 15 دقيقة. يمكنك أيضًا رفع سيرتك الذاتية مباشرة."], button: "املأ الملف" }),
    },
  },
  {
    key: "MAPPE_5", name: "Bezahlt, Mappe nicht eingereicht (Tag 5)", when: "5 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Wir warten auf deine Angaben", title: `Hallo ${v.name},`, paras: ["deine 25 Bewerbungen sind bezahlt, aber wir können erst starten, wenn deine Mappe da ist. Wenn du Hilfe brauchst, antworte auf diese Mail. Wir rufen dich gern an."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "We are waiting for your details", title: `Hi ${v.name},`, paras: ["Your 25 applications are paid for, but we can only start once your folder is complete. If you need help, reply to this email and we will call you."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Nous attendons vos informations", title: `Bonjour ${v.name},`, paras: ["Vos 25 candidatures sont payées, mais nous ne pouvons commencer qu'avec votre dossier. Besoin d'aide ? Répondez à cet e-mail, nous vous appelons volontiers."], button: "Remplir le dossier" }),
      ar: (v) => ({ subject: "ننتظر بياناتك", title: `مرحبًا ${v.name}،`, paras: ["طلباتك الـ 25 مدفوعة، لكن لا يمكننا البدء قبل اكتمال ملفك. إذا احتجت مساعدة، رد على هذه الرسالة وسنتصل بك."], button: "املأ الملف" }),
    },
  },
  {
    key: "CREDITS_LOW", name: "Guthaben fast aufgebraucht", when: "noch 1 bis 3 Bewerbungen übrig, kein Abo", path: "/profil",
    text: {
      de: (v) => ({ subject: `Noch ${v.left} Bewerbungen übrig`, title: `Hallo ${v.name},`, paras: [`wir haben schon ${v.sent} Bewerbungen für dich verschickt, es sind noch ${v.left} übrig. Damit es ohne Pause weitergeht: 25 weitere für ${v.pack} oder unbegrenzt für ${v.abo} im Monat, monatlich kündbar.`], button: "Mehr Bewerbungen" }),
      en: (v) => ({ subject: `${v.left} applications left`, title: `Hi ${v.name},`, paras: [`We have sent ${v.sent} applications for you, ${v.left} are left. To keep going without a break: 25 more for ${v.pack} or unlimited for ${v.abo} a month, cancel monthly.`], button: "More applications" }),
      fr: (v) => ({ subject: `Plus que ${v.left} candidatures`, title: `Bonjour ${v.name},`, paras: [`Nous avons envoyé ${v.sent} candidatures pour vous, il en reste ${v.left}. Pour continuer sans pause : 25 de plus pour ${v.pack} ou illimité pour ${v.abo} par mois, résiliable chaque mois.`], button: "Plus de candidatures" }),
      ar: (v) => ({ subject: `بقي ${v.left} طلبات`, title: `مرحبًا ${v.name}،`, paras: [`أرسلنا ${v.sent} طلبًا عنك، وبقي ${v.left}. للاستمرار دون توقف: 25 طلبًا إضافيًا مقابل ${v.pack} أو عدد غير محدود مقابل ${v.abo} شهريًا، مع إمكانية الإلغاء شهريًا.`], button: "المزيد من الطلبات" }),
    },
  },
  {
    key: "CREDITS_EMPTY", name: "Guthaben aufgebraucht", when: "0 Bewerbungen übrig, kein Abo", path: "/profil",
    text: {
      de: (v) => ({ subject: "Alle Bewerbungen sind verschickt", title: `Hallo ${v.name},`, paras: [`alle ${v.sent} Bewerbungen sind raus. Antworten der Firmen bekommst du direkt. Wenn du weitere Bewerbungen möchtest: 25 weitere für ${v.pack} oder unbegrenzt für ${v.abo} im Monat.`], button: "Weiter bewerben" }),
      en: (v) => ({ subject: "All applications have been sent", title: `Hi ${v.name},`, paras: [`All ${v.sent} applications are out. Companies reply to you directly. If you want more: 25 more for ${v.pack} or unlimited for ${v.abo} a month.`], button: "Keep applying" }),
      fr: (v) => ({ subject: "Toutes les candidatures sont envoyées", title: `Bonjour ${v.name},`, paras: [`Les ${v.sent} candidatures sont parties. Les entreprises vous répondent directement. Pour continuer : 25 de plus pour ${v.pack} ou illimité pour ${v.abo} par mois.`], button: "Continuer" }),
      ar: (v) => ({ subject: "تم إرسال جميع الطلبات", title: `مرحبًا ${v.name}،`, paras: [`تم إرسال جميع الطلبات الـ ${v.sent}. ستصلك ردود الشركات مباشرة. إذا أردت المزيد: 25 طلبًا إضافيًا مقابل ${v.pack} أو عدد غير محدود مقابل ${v.abo} شهريًا.`], button: "تابع التقديم" }),
    },
  },
  {
    key: "FEEDBACK", name: "Rückmeldung nach 25 Bewerbungen", when: "14 Tage nachdem 25 Bewerbungen verschickt sind", path: "/#kontakt",
    text: {
      de: (v) => ({ subject: "Wie läuft es bei dir?", title: `Hallo ${v.name},`, paras: ["vor zwei Wochen haben wir deine Bewerbungen verschickt. Hast du Einladungen bekommen oder sogar eine Zusage? Wir freuen uns über eine kurze Antwort auf diese Mail. Das hilft uns, besser zu werden."], button: "Kontakt" }),
      en: (v) => ({ subject: "How is it going?", title: `Hi ${v.name},`, paras: ["We sent your applications two weeks ago. Have you had interviews or even an offer? A short reply to this email would mean a lot and helps us improve."], button: "Contact" }),
      fr: (v) => ({ subject: "Comment ça se passe ?", title: `Bonjour ${v.name},`, paras: ["Nous avons envoyé vos candidatures il y a deux semaines. Avez-vous reçu des invitations, voire une offre ? Une courte réponse à cet e-mail nous aiderait beaucoup."], button: "Contact" }),
      ar: (v) => ({ subject: "كيف تسير الأمور؟", title: `مرحبًا ${v.name}،`, paras: ["أرسلنا طلباتك قبل أسبوعين. هل تلقيت دعوات لمقابلات أو حتى عرض عمل؟ رد قصير على هذه الرسالة يساعدنا كثيرًا على التحسن."], button: "اتصل بنا" }),
    },
  },
];

const UNSUB: Record<Lang, string> = {
  de: "Du möchtest keine Hinweise mehr von uns? Hier abmelden:",
  en: "Don't want these emails? Unsubscribe here:",
  fr: "Vous ne souhaitez plus recevoir ces e-mails ? Désinscription :",
  ar: "لا تريد هذه الرسائل؟ إلغاء الاشتراك:",
};

const langOf = (l?: string | null): Lang => (l === "de" || l === "fr" || l === "ar" ? l : l === "en" ? "en" : "de");

export function render(step: Step, lang: Lang, v: Vars, userId: string) {
  const t0 = step.text[lang](v);
  const t = { ...t0, title: t0.title.replace(/\s+([,،])/, "$1") }; // ohne Vornamen: „Hallo,“
  const unsub = `${UNSUB[lang]} ${unsubUrl(userId)}`;
  return {
    subject: `WoYou: ${t.subject}`,
    text: [t.title, ...t.paras, `${t.button}: ${base()}${step.path}`, "", "Dein WoYou-Team", "", unsub].join("\n\n"),
    html: layout(t.title, [...t.paras, "Dein WoYou-Team", unsub], { label: t.button, href: `${base()}${step.path}` }),
  };
}

export function sampleVars(): Vars {
  return { name: "Fatima", price: formatPrice(SERVICES["bewerbung-25"].priceCents), pack: formatPrice(CREDIT_PRODUCTS.PACK_25.priceCents), abo: formatPrice(CREDIT_PRODUCTS.SUBSCRIPTION.priceCents), left: 2, sent: 23 };
}

type Due = { userId: string; email: string; lang: Lang; step: Step; vars: Vars };

// Wer bekommt heute welche Mail? (ohne zu senden – auch für die Vorschau im Admin)
export async function dueMails(limit = 500): Promise<Due[]> {
  const now = Date.now();
  const users = await prisma.user.findMany({
    where: { role: ROLE.CANDIDATE, deletedAt: null, marketingOptOut: false, email: { not: null }, createdAt: { lt: new Date(now - day) } },
    include: { marketingSends: { select: { step: true } }, candidate: { include: { bookings: { where: { status: { not: BOOKING_STATUS.CANCELLED } }, orderBy: { createdAt: "desc" }, take: 1, include: { profile: { select: { status: true } }, leads: { where: { status: { in: ["SENT", "APPLIED_MANUALLY"] } }, orderBy: { sentAt: "desc" }, take: 1, select: { sentAt: true } } } } } } },
    take: 3000,
  });
  const out: Due[] = [];
  const v0 = sampleVars();
  for (const u of users) {
    if (out.length >= limit) break;
    const done = new Set(u.marketingSends.map((x) => x.step));
    const b = u.candidate?.bookings[0];
    const age = now - u.createdAt.getTime();
    const vars: Vars = { ...v0, name: u.candidate?.firstName || "", left: 0, sent: b?.applicationsSent ?? 0 };
    let key: string | null = null;
    if (!b) {
      key = age > 7 * day ? "REG_7" : age > 3 * day ? "REG_3" : "REG_1";
      // ältere Schritte nachholen ist nicht nötig: nur der jeweils aktuelle, wenn noch nicht verschickt
    } else if (!b.paidAt) {
      if (now - b.createdAt.getTime() > day) key = "PAY_1";
    } else {
      const sincePaid = now - b.paidAt.getTime();
      const submitted = b.profile?.status === "SUBMITTED" || b.profile?.status === "APPROVED";
      if (!submitted) key = sincePaid > 5 * day ? "MAPPE_5" : sincePaid > 2 * day ? "MAPPE_2" : null;
      else if (u.candidate) {
        const cs = await creditState(u.candidate.id);
        vars.left = cs.balance;
        const lastSent = b.leads[0]?.sentAt?.getTime() ?? 0;
        if (!cs.unlimited && cs.balance === 0 && vars.sent > 0) key = !done.has("CREDITS_EMPTY") ? "CREDITS_EMPTY" : vars.sent >= 25 && lastSent && now - lastSent > 14 * day ? "FEEDBACK" : null;
        else if (!cs.unlimited && cs.balance > 0 && cs.balance <= 3 && vars.sent > 0) key = "CREDITS_LOW";
      }
    }
    if (!key || done.has(key)) continue;
    const step = STEPS.find((s) => s.key === key)!;
    out.push({ userId: u.id, email: u.email!, lang: langOf(u.locale), step, vars });
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
