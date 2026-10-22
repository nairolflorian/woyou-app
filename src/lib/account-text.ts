// Texte im Kundenbereich („Mein Bereich“) und beim Verlängern des Werkzeugs, je Sprache.
// Weg 1: kein Guthaben je Bewerbung mehr, sondern Unterlagen plus Bewerbungswerkzeug mit Laufzeit.
// Deutsch, Englisch, Französisch; andere Sprachen bekommen Englisch, bis eine geprüfte Übersetzung da ist.
// Platzhalter in {geschweiften Klammern} mit fill() ersetzen.
type T = {
  paidThanks: string; payAborted: string;
  packageTitle: string; legacyPackage: string; myMappe: string; mappeState: string; mappe: Record<"NONE" | "DRAFT" | "SUBMITTED" | "APPROVED", string>;
  toolTitle: string; toolLead: string; toolActive: string; toolExpired: string; toolInactive: string; toolInactiveLead: string; toolAbo: string; toolAboCancelling: string;
  openSearch: string; openTracker: string; counts: string;
  booking: Record<"REQUESTED" | "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "DONE" | "CANCELLED", string>;
  extendTitle: string; extendLead: string; month: string; abo: string; perMonth: string; monthTitle: string; aboTitle: string;
  terms: [string, string, string, string, string]; waiver: string; order: string; orderNoPay: string; cancel: string;
  ordered: string; failed: string; cancelAsk: string; cancelNow: string; no: string; cancelBtn: string; cancelled: string; cancelling: string;
  docsLead: string; noBookingTitle: string;
};

const de: T = {
  paidThanks: "Danke für deinen Kauf! Sobald die Zahlung bestätigt ist, ist dein Werkzeug verlängert.",
  payAborted: "Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.",
  packageTitle: "Dein Startpaket", legacyPackage: "Dein Paket (vor der Umstellung gebucht)", myMappe: "Meine Bewerbungsmappe", mappeState: "Unterlagen",
  mappe: { NONE: "noch nicht begonnen", DRAFT: "du füllst sie aus", SUBMITTED: "abgeschickt, wir prüfen sie", APPROVED: "fertig, zum Herunterladen" },
  toolTitle: "Dein Bewerbungswerkzeug", toolLead: "Stellen suchen, Anschreiben je Stelle erstellen und deine Bewerbungen im Blick behalten. Du bewirbst dich selbst und bekommst alle Antworten direkt.",
  toolActive: "freigeschaltet bis {date}", toolExpired: "abgelaufen am {date}", toolInactive: "noch nicht freigeschaltet",
  toolInactiveLead: "Das Werkzeug wird freigeschaltet, sobald deine Zahlung da ist.", toolAbo: "Abo aktiv, verlängert sich monatlich", toolAboCancelling: "Abo gekündigt, endet am {date}",
  openSearch: "Stellensuche öffnen", openTracker: "Meine Bewerbungen", counts: "{saved} gemerkt · {applied} beworben",
  booking: { REQUESTED: "Angefragt", PENDING_PAYMENT: "Zahlung offen", PAID: "Bezahlt", IN_PROGRESS: "In Arbeit", DONE: "Abgeschlossen", CANCELLED: "Storniert" },
  extendTitle: "Werkzeug verlängern", extendLead: "Einmalig einen Monat dazu oder ein Abo, das monatlich kündbar ist. Ohne Verlängerung endet der Zugang einfach, deine Unterlagen kannst du weiter herunterladen.",
  month: "1 Monat dazu", abo: "Monatsabo", perMonth: "im Monat",
  monthTitle: "1 Monat Bewerbungswerkzeug für {price} (einmalig, endet automatisch)", aboTitle: "Monatsabo für {price} im Monat. Es beginnt, wenn dein bezahlter Zeitraum endet, und ist jederzeit zum Monatsende kündbar.",
  terms: ["Ich akzeptiere die ", "AGB", " und habe die ", "Datenschutzerklärung", " gelesen."],
  waiver: "Ich möchte, dass das Werkzeug sofort weiterläuft. Mir ist bekannt, dass ich bei einem Widerruf die bis dahin erbrachte Leistung anteilig bezahle.",
  order: "Zahlungspflichtig bestellen", orderNoPay: "Zahlungspflichtig bestellen (Zahlungslink folgt)", cancel: "Abbrechen",
  ordered: "Danke! Wir haben deine Bestellung erhalten und schicken dir den Link zur Zahlung.", failed: "Das hat nicht geklappt.",
  cancelAsk: "Abo wirklich kündigen? Das Werkzeug läuft noch bis {date}.", cancelNow: "Jetzt kündigen", no: "Nein", cancelBtn: "Abo hier kündigen",
  cancelled: "Dein Abo ist gekündigt. Du kannst das Werkzeug noch bis {date} nutzen.", cancelling: "Abo gekündigt, das Werkzeug läuft bis {date}.",
  docsLead: "Zeugnisse, Nachweise und Zertifikate. Lade sie hier hoch, dann hast du sie für deine Bewerbungen griffbereit.",
  noBookingTitle: "Bewerbungsunterlagen und Bewerbungswerkzeug",
};

const en: T = {
  paidThanks: "Thank you for your purchase! As soon as the payment is confirmed, your tool is extended.",
  payAborted: "The payment was cancelled. You can try again at any time.",
  packageTitle: "Your starter package", legacyPackage: "Your package (booked before the change)", myMappe: "My application folder", mappeState: "Documents",
  mappe: { NONE: "not started yet", DRAFT: "you are filling it in", SUBMITTED: "sent, we are checking it", APPROVED: "ready to download" },
  toolTitle: "Your application tool", toolLead: "Search for jobs, create a cover letter for each job and keep track of your applications. You apply yourself and every reply comes straight to you.",
  toolActive: "unlocked until {date}", toolExpired: "expired on {date}", toolInactive: "not unlocked yet",
  toolInactiveLead: "The tool is unlocked as soon as your payment has arrived.", toolAbo: "Subscription active, renews monthly", toolAboCancelling: "Subscription cancelled, ends on {date}",
  openSearch: "Open job search", openTracker: "My applications", counts: "{saved} saved · {applied} applied",
  booking: { REQUESTED: "Requested", PENDING_PAYMENT: "Payment open", PAID: "Paid", IN_PROGRESS: "In progress", DONE: "Completed", CANCELLED: "Cancelled" },
  extendTitle: "Extend the tool", extendLead: "Add one month once, or take a subscription you can cancel monthly. Without an extension your access simply ends, and you can still download your documents.",
  month: "Add 1 month", abo: "Monthly subscription", perMonth: "a month",
  monthTitle: "1 month of the application tool for {price} (one-time, ends automatically)", aboTitle: "Monthly subscription for {price} a month. It starts when your paid period ends and can be cancelled at the end of any month.",
  terms: ["I accept the ", "terms and conditions", " and have read the ", "privacy policy", "."],
  waiver: "I want the tool to keep running right away. I know that if I withdraw, I pay proportionally for what has been provided until then.",
  order: "Order with obligation to pay", orderNoPay: "Order with obligation to pay (payment link follows)", cancel: "Cancel",
  ordered: "Thank you! We received your order and will send you the payment link.", failed: "That didn't work.",
  cancelAsk: "Really cancel the subscription? The tool runs until {date}.", cancelNow: "Cancel now", no: "No", cancelBtn: "Cancel subscription here",
  cancelled: "Your subscription is cancelled. You can use the tool until {date}.", cancelling: "Subscription cancelled, the tool runs until {date}.",
  docsLead: "Certificates and proof of qualifications. Upload them here so you have them at hand for your applications.",
  noBookingTitle: "Application documents and application tool",
};

const fr: T = {
  paidThanks: "Merci pour votre achat ! Dès que le paiement est confirmé, votre outil est prolongé.",
  payAborted: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.",
  packageTitle: "Votre pack de départ", legacyPackage: "Votre pack (réservé avant le changement)", myMappe: "Mon dossier de candidature", mappeState: "Documents",
  mappe: { NONE: "pas encore commencé", DRAFT: "vous le remplissez", SUBMITTED: "envoyé, nous le vérifions", APPROVED: "prêt à télécharger" },
  toolTitle: "Votre outil de candidature", toolLead: "Chercher des offres, créer une lettre pour chaque offre et suivre vos candidatures. Vous postulez vous-même et recevez toutes les réponses directement.",
  toolActive: "activé jusqu'au {date}", toolExpired: "expiré le {date}", toolInactive: "pas encore activé",
  toolInactiveLead: "L'outil est activé dès réception de votre paiement.", toolAbo: "Abonnement actif, renouvelé chaque mois", toolAboCancelling: "Abonnement résilié, se termine le {date}",
  openSearch: "Ouvrir la recherche", openTracker: "Mes candidatures", counts: "{saved} gardées · {applied} envoyées",
  booking: { REQUESTED: "Demandé", PENDING_PAYMENT: "Paiement en attente", PAID: "Payé", IN_PROGRESS: "En cours", DONE: "Terminé", CANCELLED: "Annulé" },
  extendTitle: "Prolonger l'outil", extendLead: "Un mois de plus en une fois, ou un abonnement résiliable chaque mois. Sans prolongation, l'accès s'arrête simplement et vous pouvez toujours télécharger vos documents.",
  month: "1 mois de plus", abo: "Abonnement mensuel", perMonth: "par mois",
  monthTitle: "1 mois d'outil de candidature pour {price} (paiement unique, se termine automatiquement)", aboTitle: "Abonnement à {price} par mois. Il commence à la fin de votre période payée et se résilie à la fin de chaque mois.",
  terms: ["J'accepte les ", "CGV", " et j'ai lu la ", "politique de confidentialité", "."],
  waiver: "Je souhaite que l'outil continue immédiatement. Je sais qu'en cas de rétractation, je paie au prorata ce qui a été fourni jusque-là.",
  order: "Commander avec obligation de paiement", orderNoPay: "Commander avec obligation de paiement (lien de paiement à suivre)", cancel: "Annuler",
  ordered: "Merci ! Nous avons reçu votre commande et vous envoyons le lien de paiement.", failed: "Cela n'a pas fonctionné.",
  cancelAsk: "Vraiment résilier l'abonnement ? L'outil reste actif jusqu'au {date}.", cancelNow: "Résilier maintenant", no: "Non", cancelBtn: "Résilier l'abonnement ici",
  cancelled: "Votre abonnement est résilié. Vous pouvez utiliser l'outil jusqu'au {date}.", cancelling: "Abonnement résilié, l'outil reste actif jusqu'au {date}.",
  docsLead: "Diplômes, attestations et certificats. Téléchargez-les ici pour les avoir sous la main pour vos candidatures.",
  noBookingTitle: "Dossier de candidature et outil de candidature",
};

const ALL = { de, en, fr };
export const accountText = (locale: string): T => ALL[(locale === "de" || locale === "fr" ? locale : "en") as keyof typeof ALL];
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
