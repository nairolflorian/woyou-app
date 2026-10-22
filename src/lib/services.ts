// Pakete, die Bewerber:innen buchen können. Preise und Laufzeiten stehen zentral in src/lib/angebot.ts.
// Weg 1 (22.10.2026): verkauft werden Bewerbungsunterlagen plus Bewerbungswerkzeug, keine Bewerbungen.
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export { formatPrice };

// "startpaket" = aktuelles Angebot. "bewerbung-25" = ALT (vor Weg 1), nur noch für bestehende Buchungen.
export type ServiceKey = "startpaket" | "bewerbung-25";
export const CURRENT_SERVICE = "startpaket" as const satisfies ServiceKey;
export const SERVICE_KEYS: ServiceKey[] = ["startpaket", "bewerbung-25"];

export const SERVICES: Record<ServiceKey, { priceCents: number; toolMonths: number; applications: number }> = {
  startpaket: { priceCents: ANGEBOT.startpaket.priceCents, toolMonths: ANGEBOT.startpaket.toolMonths, applications: 0 },
  "bewerbung-25": { priceCents: 19900, toolMonths: 0, applications: 25 },
};

// ALT (vor Weg 1): Nachkauf und Abo für Bewerbungsguthaben, nur noch für Altdaten (src/lib/credits.ts)
export type CreditKind = "PACK_25" | "SUBSCRIPTION";
export const CREDIT_PRODUCTS: Record<CreditKind, { name: string; priceCents: number; credits: number }> = {
  PACK_25: { name: "25 weitere Bewerbungen (alt)", priceCents: 14900, credits: 25 },
  SUBSCRIPTION: { name: "Unbegrenzt bewerben (Abo, alt)", priceCents: 5000, credits: 0 },
};

export const BOOKING_STATUS = {
  REQUESTED: "REQUESTED", // gebucht, Zahlung noch nicht möglich (kein Stripe-Konto hinterlegt)
  PENDING_PAYMENT: "PENDING_PAYMENT", // Stripe-Checkout gestartet
  PAID: "PAID",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, { de: string; color: string }> = {
  REQUESTED: { de: "Angefragt", color: "bg-amber-100 text-amber-800" },
  PENDING_PAYMENT: { de: "Zahlung offen", color: "bg-amber-100 text-amber-800" },
  PAID: { de: "Bezahlt", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { de: "In Arbeit", color: "bg-indigo-100 text-indigo-800" },
  DONE: { de: "Abgeschlossen", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { de: "Storniert", color: "bg-slate-200 text-slate-700" },
};

// ---------- Texte zu Paket, Buchung und Danke-Seite (DE/EN/FR; andere Sprachen auf Englisch) ----------
// Textregeln: ehrlich, kein Jobversprechen, keine langen Gedankenstriche, du-Form.
type Copy = {
  badge: string; title: string; lead: string; priceNote: string; cta: string; ctaLogin: string;
  bookTitle: string; bookLead: string; phone: string; jobs: string; regions: string; notes: string;
  terms: string; waiver: string; submit: string; submitNoPay: string; summary: string;
  thanksTitle: string; thanksPaid: string; thanksRequested: string; thanksMappe: string; toMappe: string; toProfile: string; failed: string; alreadyBooked: string;
};

function build(lang: "de" | "en" | "fr"): Copy {
  const f = (c: number) => formatPrice(c, lang);
  const start = f(ANGEBOT.startpaket.priceCents), months = ANGEBOT.startpaket.toolMonths;
  const month = f(ANGEBOT.verlaengerung.priceCents), abo = f(ANGEBOT.abo.priceCents);
  if (lang === "en") return {
    badge: "APPLICATION DOCUMENTS AND TOOL",
    title: "Your application documents to German standards. And a tool to apply yourself.",
    lead: "We create your application documents to German standards and give you a tool to find suitable jobs and apply yourself. You decide where you apply, and every reply comes straight to you.",
    priceNote: `one-time · includes ${months} months of the application tool · then ${month} per month or ${abo} a month as a subscription`,
    cta: "Book now", ctaLogin: "Log in and book",
    bookTitle: "Book the starter package", bookLead: "Please check your details. We use your desired jobs and region as a suggestion for your job search.",
    phone: "Phone / WhatsApp for questions about your documents", jobs: "Desired jobs", regions: "Preferred region in Germany (optional)", notes: "Anything else we should know? (optional)",
    terms: "I accept the terms and conditions and have read the privacy policy.",
    waiver: "I want WoYou to start right away and unlock the tool immediately. I know that if I withdraw, I pay proportionally for what has been provided until then, and that my right of withdrawal ends once the service has been fully provided.",
    submit: "Book with obligation to pay", submitNoPay: "Send binding request", summary: `Starter package · documents and ${months} months of the tool`,
    thanksTitle: "Thank you for your booking!",
    thanksPaid: "We received your payment. Your application tool is unlocked.",
    thanksRequested: "We received your request. We will contact you within 2 working days and send you the payment link.",
    thanksMappe: "Best start with your application folder: upload your CV or fill in your details. We check everything and let you know when your documents are ready.",
    toMappe: "Go to my application folder", toProfile: "Go to my area", failed: "The booking didn't work. Please try again.", alreadyBooked: "You have already booked the starter package.",
  };
  if (lang === "fr") return {
    badge: "DOSSIER DE CANDIDATURE ET OUTIL",
    title: "Votre dossier de candidature aux normes allemandes. Et un outil pour postuler vous-même.",
    lead: "Nous créons votre dossier de candidature aux normes allemandes et vous donnons un outil pour trouver des offres adaptées et postuler vous-même. Vous décidez où vous postulez et vous recevez toutes les réponses directement.",
    priceNote: `paiement unique · ${months} mois d'outil inclus · ensuite ${month} par mois ou ${abo} par mois en abonnement`,
    cta: "Réserver", ctaLogin: "Se connecter et réserver",
    bookTitle: "Réserver le pack de départ", bookLead: "Vérifiez vos informations. Vos métiers et votre région servent de suggestion pour votre recherche d'emploi.",
    phone: "Téléphone / WhatsApp pour les questions sur votre dossier", jobs: "Métiers souhaités", regions: "Région souhaitée en Allemagne (facultatif)", notes: "Autre chose à nous dire ? (facultatif)",
    terms: "J'accepte les CGV et j'ai lu la politique de confidentialité.",
    waiver: "Je souhaite que WoYou commence tout de suite et active l'outil immédiatement. Je sais qu'en cas de rétractation, je paie au prorata ce qui a été fourni jusque-là, et que mon droit de rétractation prend fin une fois la prestation entièrement fournie.",
    submit: "Réserver avec obligation de paiement", submitNoPay: "Envoyer la demande", summary: `Pack de départ · dossier et ${months} mois d'outil`,
    thanksTitle: "Merci pour votre réservation !",
    thanksPaid: "Votre paiement est bien reçu. Votre outil de candidature est activé.",
    thanksRequested: "Votre demande est bien reçue. Nous vous contactons dans les 2 jours ouvrés et vous envoyons le lien de paiement.",
    thanksMappe: "Commencez par votre dossier : téléchargez votre CV ou remplissez vos informations. Nous vérifions tout et vous prévenons quand vos documents sont prêts.",
    toMappe: "Vers mon dossier", toProfile: "Vers mon espace", failed: "La réservation n'a pas fonctionné. Merci de réessayer.", alreadyBooked: "Vous avez déjà réservé le pack de départ.",
  };
  return {
    badge: "BEWERBUNGSUNTERLAGEN UND WERKZEUG",
    title: "Deine Bewerbungsunterlagen nach deutschem Standard. Und ein Werkzeug, mit dem du dich selbst bewirbst.",
    lead: "Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Du entscheidest, wo du dich bewirbst, und bekommst alle Antworten direkt.",
    priceNote: `einmalig · inklusive ${months} Monate Bewerbungswerkzeug · danach ${month} je Monat oder ${abo} im Monat im Abo`,
    cta: "Jetzt buchen", ctaLogin: "Anmelden und buchen",
    bookTitle: "Startpaket buchen", bookLead: "Prüfe kurz deine Angaben. Deine Wunschberufe und deine Region nutzen wir als Vorschlag für deine Stellensuche.",
    phone: "Telefon / WhatsApp für Rückfragen zu deinen Unterlagen", jobs: "Gewünschte Berufe", regions: "Wunschregion in Deutschland (optional)", notes: "Was sollen wir noch wissen? (optional)",
    terms: "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.",
    waiver: "Ich möchte, dass WoYou sofort beginnt und das Werkzeug gleich freischaltet. Mir ist bekannt, dass ich bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahle und dass mein Widerrufsrecht erlischt, sobald die Leistung vollständig erbracht ist.",
    submit: "Zahlungspflichtig buchen", submitNoPay: "Verbindlich anfragen", summary: `Startpaket · Unterlagen und ${months} Monate Werkzeug`,
    thanksTitle: "Danke für deine Buchung!",
    thanksPaid: "Deine Zahlung ist eingegangen. Dein Bewerbungswerkzeug ist freigeschaltet.",
    thanksRequested: "Deine Anfrage ist bei uns. Wir melden uns in den nächsten 2 Werktagen und schicken dir den Link zur Zahlung.",
    thanksMappe: "Fang am besten mit deiner Bewerbungsmappe an: Lebenslauf hochladen oder Angaben ausfüllen. Wir prüfen alles und sagen dir Bescheid, wenn deine Unterlagen fertig sind.",
    toMappe: "Zur Bewerbungsmappe", toProfile: "Zu meinem Bereich", failed: "Die Buchung hat nicht geklappt. Bitte versuch es noch einmal.", alreadyBooked: "Du hast das Startpaket bereits gebucht.",
  };
}

export function serviceCopy(locale: string): Copy {
  return build(locale === "de" || locale === "fr" ? locale : "en");
}
