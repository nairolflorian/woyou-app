// Texte für das Bewerbungswerkzeug (Stellensuche, Meine Bewerbungen) und die zugehörigen Mails.
// Deutsch, Englisch, Französisch; alle anderen Sprachen bekommen Englisch, bis eine geprüfte Übersetzung da ist.
// Textregeln: ehrlich, kein Jobversprechen, keine langen Gedankenstriche, du-Form, menschlich.
// Keine Server-Importe: wird auch in Client-Komponenten verwendet.

export type WLang = "de" | "en" | "fr";
export const wLang = (locale?: string | null): WLang => (locale === "de" || locale === "fr" ? locale : locale ? "en" : "de");
export const dateLocaleOf = (l: WLang) => (l === "de" ? "de-DE" : l === "fr" ? "fr-FR" : "en-GB");
export const fillIn = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

export type TrackerStatus = "SAVED" | "APPLIED" | "REPLY" | "INTERVIEW" | "REJECTED" | "OFFER";

type UI = {
  // Stellensuche
  searchTitle: string; searchLead: string; was: string; wasPh: string; wo: string; woPh: string; radius: string;
  hours: string; hoursAll: string; fulltime: string; parttime: string; myGerman: string; germanUnknown: string; onlyFitting: string;
  search: string; searching: string; fromProfile: string; results: string; noResults: string; more: string;
  save: string; saved: string; openAd: string; viaEmployerSite: string; withEmail: string;
  germanOk: string; germanClose: string; germanHigh: string; germanReq: string; germanNone: string;
  published: string; km: string; source: string; alsoSearch: string; alsoHint: string; searchError: string;
  // gesperrt
  lockedTitle: string; lockedLead: string; lockedCta: string; expiredTitle: string; expiredLead: string; expiredCta: string;
  // Tracker
  trackerTitle: string; trackerLead: string; empty: string; toSearch: string; toTracker: string; all: string;
  status: Record<TrackerStatus, string>; statusLabel: string; appliedOn: string; repliedOn: string; interviewOn: string;
  notes: string; notesPh: string; saveNotes: string; savedOk: string; remove: string; removeAsk: string;
  letterTitle: string; letterHint: string; generate: string; regenerate: string; generating: string; letterLang: string;
  pdf: string; word: string; cv: string; mail: string; mailHint: string; noEmail: string; employer: string; markApplied: string;
  addOwn: string; addOwnLead: string; ownTitle: string; ownCompany: string; ownCity: string; ownUrl: string; ownEmail: string; add: string;
  failed: string; readOnly: string;
};

const de: UI = {
  searchTitle: "Stellensuche",
  searchLead: "Hier findest du aktuelle Stellen aus der Jobbörse der Bundesagentur für Arbeit und weiteren öffentlichen Stellenbörsen. Die Suche ist mit deinen Angaben vorbelegt. Welche Stellen du dir merkst und wo du dich bewirbst, entscheidest du.",
  was: "Beruf", wasPh: "z. B. Pflegefachkraft", wo: "Ort oder PLZ", woPh: "leer = ganz Deutschland", radius: "Umkreis",
  hours: "Arbeitszeit", hoursAll: "egal", fulltime: "Vollzeit", parttime: "Teilzeit", myGerman: "Mein Deutsch", germanUnknown: "nicht angegeben",
  onlyFitting: "Nur Stellen, deren Deutsch-Anforderung zu mir passt oder die keine nennen",
  search: "Suchen", searching: "Suche läuft …", fromProfile: "Vorschläge aus deinem Profil:", results: "{n} Treffer", noResults: "Keine Treffer. Versuch es mit einem allgemeineren Beruf oder einem größeren Umkreis.", more: "Weitere Treffer laden",
  save: "Merken", saved: "Gemerkt", openAd: "Anzeige ansehen", viaEmployerSite: "Bewerbung über die Seite des Arbeitgebers", withEmail: "Bewerbung per E-Mail möglich",
  germanOk: "Deutsch {req} verlangt, passt zu dir", germanClose: "Deutsch {req} verlangt, knapp", germanHigh: "Deutsch {req} verlangt, höher als dein Niveau", germanReq: "Deutsch {req} verlangt", germanNone: "keine Angabe zum Deutsch gefunden",
  published: "seit {date}", km: "{n} km", source: "Quelle: {src}",
  alsoSearch: "Auch dort selbst suchen:", alsoHint: "Die Seiten öffnen sich in einem neuen Fenster. Wir lesen dort nichts aus und übernehmen nichts automatisch.",
  searchError: "Die Suche hat gerade nicht geklappt. Bitte versuch es gleich noch einmal.",
  lockedTitle: "Die Stellensuche gehört zum Startpaket", lockedLead: "Mit dem Startpaket bekommst du deine Bewerbungsunterlagen nach deutschem Standard und das Bewerbungswerkzeug: Stellensuche, Anschreiben für jede Stelle und deine eigene Übersicht.", lockedCta: "Startpaket ansehen",
  expiredTitle: "Dein Bewerbungswerkzeug ist abgelaufen", expiredLead: "Deine gemerkten Stellen und Notizen bleiben lesbar, und deine Unterlagen kannst du weiter herunterladen. Für neue Suchen und Anschreiben verlängere das Werkzeug.", expiredCta: "Werkzeug verlängern",
  trackerTitle: "Meine Bewerbungen", trackerLead: "Deine gemerkten Stellen und wie es bei jeder steht. Diese Liste pflegst nur du. Wir schreiben keine Firmen an und lesen keine Antworten mit.",
  empty: "Du hast dir noch keine Stelle gemerkt. In der Stellensuche findest du passende Angebote.", toSearch: "Zur Stellensuche", toTracker: "Meine Bewerbungen ({n})", all: "Alle",
  status: { SAVED: "gemerkt", APPLIED: "beworben", REPLY: "Antwort erhalten", INTERVIEW: "Gespräch", REJECTED: "Absage", OFFER: "Zusage" },
  statusLabel: "Stand", appliedOn: "beworben am {date}", repliedOn: "Antwort am {date}", interviewOn: "Gespräch am {date}",
  notes: "Notizen", notesPh: "z. B. Ansprechperson, Telefonnummer, was im Gespräch wichtig war", saveNotes: "Notiz speichern", savedOk: "Gespeichert.", remove: "Aus der Liste entfernen", removeAsk: "Diese Stelle wirklich aus deiner Liste entfernen?",
  letterTitle: "Anschreiben für diese Stelle", letterHint: "Wir setzen das Anschreiben aus deinen Angaben und der Anzeige zusammen. Lies es in Ruhe und ändere, was nicht stimmt. Du verschickst es selbst.",
  generate: "Anschreiben erstellen", regenerate: "Neu erstellen", generating: "Wird erstellt …", letterLang: "Sprache des Anschreibens",
  pdf: "Anschreiben (PDF)", word: "Anschreiben (Word)", cv: "Lebenslauf (PDF)",
  mail: "In meinem E-Mail-Programm öffnen", mailHint: "Dein E-Mail-Programm öffnet sich mit Empfänger, Betreff und einem kurzen Text. Anschreiben und Lebenslauf lädst du vorher herunter und hängst sie selbst als PDF an. Antworten kommen direkt in dein Postfach.",
  noEmail: "In der Anzeige steht keine E-Mail-Adresse. Bewirb dich über die Seite des Arbeitgebers.", employer: "Zur Bewerbungsseite des Arbeitgebers", markApplied: "Ich habe mich beworben",
  addOwn: "Stelle selbst eintragen", addOwnLead: "Du hast eine Stelle woanders gefunden, z. B. auf einem Portal oder einer Firmenseite? Trag sie hier ein, dann hast du alles an einem Ort.",
  ownTitle: "Stellenbezeichnung", ownCompany: "Firma", ownCity: "Ort (optional)", ownUrl: "Link zur Anzeige (optional)", ownEmail: "Bewerbungs-E-Mail (optional)", add: "Eintragen",
  failed: "Das hat nicht geklappt.", readOnly: "Nur lesbar, solange dein Werkzeug nicht verlängert ist.",
};

const en: UI = {
  searchTitle: "Job search",
  searchLead: "Here you find current jobs from the job board of the German Federal Employment Agency and other public job boards. The search starts with your details. You decide which jobs you save and where you apply.",
  was: "Job", wasPh: "e.g. nurse", wo: "City or postcode", woPh: "empty = all of Germany", radius: "Radius",
  hours: "Working hours", hoursAll: "any", fulltime: "Full-time", parttime: "Part-time", myGerman: "My German", germanUnknown: "not given",
  onlyFitting: "Only jobs whose German requirement fits me or that don't state one",
  search: "Search", searching: "Searching …", fromProfile: "Suggestions from your profile:", results: "{n} results", noResults: "No results. Try a more general job title or a larger radius.", more: "Load more results",
  save: "Save", saved: "Saved", openAd: "View advert", viaEmployerSite: "Apply via the employer's website", withEmail: "Apply by email possible",
  germanOk: "German {req} required, fits you", germanClose: "German {req} required, close", germanHigh: "German {req} required, above your level", germanReq: "German {req} required", germanNone: "no German requirement found",
  published: "since {date}", km: "{n} km", source: "Source: {src}",
  alsoSearch: "Also search there yourself:", alsoHint: "These sites open in a new window. We don't read anything there or copy anything automatically.",
  searchError: "The search didn't work just now. Please try again in a moment.",
  lockedTitle: "Job search is part of the starter package", lockedLead: "With the starter package you get your application documents to German standards and the application tool: job search, a cover letter for every job and your own overview.", lockedCta: "See the starter package",
  expiredTitle: "Your application tool has expired", expiredLead: "Your saved jobs and notes stay readable, and you can still download your documents. To search and create new cover letters, extend the tool.", expiredCta: "Extend the tool",
  trackerTitle: "My applications", trackerLead: "Your saved jobs and where you stand with each one. Only you keep this list. We don't contact companies and don't read replies.",
  empty: "You haven't saved a job yet. The job search shows you suitable offers.", toSearch: "Go to job search", toTracker: "My applications ({n})", all: "All",
  status: { SAVED: "saved", APPLIED: "applied", REPLY: "reply received", INTERVIEW: "interview", REJECTED: "rejection", OFFER: "offer" },
  statusLabel: "Status", appliedOn: "applied on {date}", repliedOn: "reply on {date}", interviewOn: "interview on {date}",
  notes: "Notes", notesPh: "e.g. contact person, phone number, what mattered in the interview", saveNotes: "Save note", savedOk: "Saved.", remove: "Remove from list", removeAsk: "Really remove this job from your list?",
  letterTitle: "Cover letter for this job", letterHint: "We put the cover letter together from your details and the job advert. Read it calmly and change anything that isn't right. You send it yourself.",
  generate: "Create cover letter", regenerate: "Create again", generating: "Creating …", letterLang: "Language of the cover letter",
  pdf: "Cover letter (PDF)", word: "Cover letter (Word)", cv: "CV (PDF)",
  mail: "Open in my email program", mailHint: "Your email program opens with recipient, subject and a short text. Download your cover letter and CV first and attach them yourself as PDF. Replies come straight to your inbox.",
  noEmail: "The advert doesn't give an email address. Apply via the employer's website.", employer: "Go to the employer's application page", markApplied: "I have applied",
  addOwn: "Add a job yourself", addOwnLead: "Found a job somewhere else, e.g. on a job portal or a company website? Add it here to keep everything in one place.",
  ownTitle: "Job title", ownCompany: "Company", ownCity: "City (optional)", ownUrl: "Link to the advert (optional)", ownEmail: "Application email (optional)", add: "Add",
  failed: "That didn't work.", readOnly: "Read only until you extend your tool.",
};

const fr: UI = {
  searchTitle: "Recherche d'emploi",
  searchLead: "Vous trouvez ici des offres actuelles de la bourse de l'emploi de l'Agence fédérale allemande pour l'emploi et d'autres bourses publiques. La recherche reprend vos informations. Vous décidez quelles offres vous gardez et où vous postulez.",
  was: "Métier", wasPh: "p. ex. Pflegefachkraft", wo: "Ville ou code postal", woPh: "vide = toute l'Allemagne", radius: "Rayon",
  hours: "Temps de travail", hoursAll: "peu importe", fulltime: "Temps plein", parttime: "Temps partiel", myGerman: "Mon allemand", germanUnknown: "non indiqué",
  onlyFitting: "Seulement les offres dont le niveau d'allemand me convient ou qui n'en indiquent pas",
  search: "Rechercher", searching: "Recherche en cours …", fromProfile: "Suggestions d'après votre profil :", results: "{n} résultats", noResults: "Aucun résultat. Essayez un métier plus général ou un rayon plus grand.", more: "Afficher plus",
  save: "Garder", saved: "Gardée", openAd: "Voir l'annonce", viaEmployerSite: "Candidature sur le site de l'employeur", withEmail: "Candidature par e-mail possible",
  germanOk: "Allemand {req} demandé, cela vous convient", germanClose: "Allemand {req} demandé, de justesse", germanHigh: "Allemand {req} demandé, au-dessus de votre niveau", germanReq: "Allemand {req} demandé", germanNone: "pas d'exigence d'allemand trouvée",
  published: "depuis le {date}", km: "{n} km", source: "Source : {src}",
  alsoSearch: "Cherchez aussi vous-même ici :", alsoHint: "Ces sites s'ouvrent dans une nouvelle fenêtre. Nous n'y lisons rien et ne reprenons rien automatiquement.",
  searchError: "La recherche n'a pas fonctionné. Merci de réessayer dans un instant.",
  lockedTitle: "La recherche d'emploi fait partie du pack de départ", lockedLead: "Avec le pack de départ, vous recevez votre dossier de candidature aux normes allemandes et l'outil de candidature : recherche d'emploi, une lettre pour chaque offre et votre propre suivi.", lockedCta: "Voir le pack de départ",
  expiredTitle: "Votre outil de candidature a expiré", expiredLead: "Vos offres gardées et vos notes restent lisibles, et vous pouvez toujours télécharger vos documents. Pour de nouvelles recherches et lettres, prolongez l'outil.", expiredCta: "Prolonger l'outil",
  trackerTitle: "Mes candidatures", trackerLead: "Vos offres gardées et où vous en êtes pour chacune. Vous seul tenez cette liste. Nous ne contactons pas d'entreprises et ne lisons pas les réponses.",
  empty: "Vous n'avez encore gardé aucune offre. La recherche d'emploi vous montre des offres adaptées.", toSearch: "Vers la recherche", toTracker: "Mes candidatures ({n})", all: "Toutes",
  status: { SAVED: "gardée", APPLIED: "candidature envoyée", REPLY: "réponse reçue", INTERVIEW: "entretien", REJECTED: "refus", OFFER: "offre reçue" },
  statusLabel: "État", appliedOn: "candidature le {date}", repliedOn: "réponse le {date}", interviewOn: "entretien le {date}",
  notes: "Notes", notesPh: "p. ex. interlocuteur, numéro de téléphone, points importants de l'entretien", saveNotes: "Enregistrer la note", savedOk: "Enregistré.", remove: "Retirer de la liste", removeAsk: "Vraiment retirer cette offre de votre liste ?",
  letterTitle: "Lettre de motivation pour cette offre", letterHint: "Nous composons la lettre à partir de vos informations et de l'annonce. Lisez-la tranquillement et changez ce qui ne va pas. C'est vous qui l'envoyez.",
  generate: "Créer la lettre", regenerate: "Recréer", generating: "Création …", letterLang: "Langue de la lettre",
  pdf: "Lettre (PDF)", word: "Lettre (Word)", cv: "CV (PDF)",
  mail: "Ouvrir dans ma messagerie", mailHint: "Votre messagerie s'ouvre avec le destinataire, l'objet et un court texte. Téléchargez d'abord la lettre et le CV, puis joignez-les vous-même en PDF. Les réponses arrivent directement dans votre boîte.",
  noEmail: "L'annonce n'indique pas d'adresse e-mail. Postulez sur le site de l'employeur.", employer: "Vers la page de candidature de l'employeur", markApplied: "J'ai postulé",
  addOwn: "Ajouter une offre vous-même", addOwnLead: "Vous avez trouvé une offre ailleurs, p. ex. sur un portail ou le site d'une entreprise ? Ajoutez-la ici pour tout garder au même endroit.",
  ownTitle: "Intitulé du poste", ownCompany: "Entreprise", ownCity: "Ville (facultatif)", ownUrl: "Lien vers l'annonce (facultatif)", ownEmail: "E-mail de candidature (facultatif)", add: "Ajouter",
  failed: "Cela n'a pas fonctionné.", readOnly: "Lecture seule tant que l'outil n'est pas prolongé.",
};

const UI_ALL: Record<WLang, UI> = { de, en, fr };
export const werkzeugText = (locale?: string | null): UI => UI_ALL[wLang(locale)];

// ---------- Mails ----------
const SIGN: Record<WLang, string> = { de: "Viele Grüße\nDein WoYou-Team", en: "Best regards\nYour WoYou team", fr: "Bien cordialement\nL'équipe WoYou" };
const hello = (l: WLang) => (name?: string | null) => (l === "de" ? `Hallo${name ? ` ${name}` : ""},` : l === "fr" ? `Bonjour${name ? ` ${name}` : ""},` : `Hi${name ? ` ${name}` : ""},`);

/** Mail an die Kundin bzw. den Kunden, wenn das Team die Mappe freigegeben hat */
export function mappeMail(locale?: string | null) {
  const l = wLang(locale);
  if (l === "en") return { subject: "Your application documents are ready", hello: hello(l), button: "Open job search", paras: ["we have checked your application folder. Your CV and your cover letter template are ready, and you can download them in your area at any time.", "Now you can start: in the job search you find suitable jobs, save the ones you like and create a cover letter for each. You apply yourself, from your own email address or via the employer's website, and replies come straight to you.", SIGN.en] };
  if (l === "fr") return { subject: "Votre dossier de candidature est prêt", hello: hello(l), button: "Ouvrir la recherche", paras: ["nous avons vérifié votre dossier. Votre CV et votre modèle de lettre sont prêts, vous pouvez les télécharger à tout moment dans votre espace.", "Vous pouvez commencer : dans la recherche d'emploi, vous trouvez des offres adaptées, gardez celles qui vous plaisent et créez une lettre pour chacune. Vous postulez vous-même, depuis votre propre adresse e-mail ou sur le site de l'employeur, et les réponses vous arrivent directement.", SIGN.fr] };
  return { subject: "Deine Bewerbungsunterlagen sind fertig", hello: hello(l), button: "Stellensuche öffnen", paras: ["wir haben deine Bewerbungsmappe geprüft. Dein Lebenslauf und deine Anschreiben-Vorlage sind fertig, du kannst sie jederzeit in deinem Bereich herunterladen.", "Jetzt kannst du loslegen: In der Stellensuche findest du passende Stellen, merkst dir die, die dir gefallen, und erstellst für jede ein Anschreiben. Du bewirbst dich selbst, aus deinem eigenen E-Mail-Postfach oder über die Seite des Arbeitgebers, und bekommst die Antworten direkt.", SIGN.de] };
}

/** Mails zu Verlängerung und Abo */
export function purchaseMail(locale?: string | null) {
  const l = wLang(locale);
  const base = { lang: l, dateLocale: dateLocaleOf(l), hello: hello(l), sign: SIGN[l] };
  if (l === "en") return { ...base, button: "Go to my area", aboName: (p: string) => `the monthly subscription for the application tool (${p} a month)`, monthName: (n: number, p: string) => `${n} more month${n === 1 ? "" : "s"} of the application tool (${p})`,
    paidSubject: "Thank you, your tool is extended", requestedSubject: "We received your order", cancelledSubject: "Cancellation confirmed",
    paid: (w: string) => `thank you! We have unlocked ${w}.`, requested: (w: string) => `thank you for your order: ${w}. We will send you the payment link shortly.`,
    cancelled: (d: string) => `your subscription is cancelled. You can keep using the application tool until ${d}. After that, nothing more will be charged.` };
  if (l === "fr") return { ...base, button: "Vers mon espace", aboName: (p: string) => `l'abonnement mensuel à l'outil de candidature (${p} par mois)`, monthName: (n: number, p: string) => `${n} mois supplémentaire${n === 1 ? "" : "s"} d'outil de candidature (${p})`,
    paidSubject: "Merci, votre outil est prolongé", requestedSubject: "Nous avons reçu votre commande", cancelledSubject: "Résiliation confirmée",
    paid: (w: string) => `merci ! Nous avons activé ${w}.`, requested: (w: string) => `merci pour votre commande : ${w}. Nous vous envoyons bientôt le lien de paiement.`,
    cancelled: (d: string) => `votre abonnement est résilié. Vous pouvez utiliser l'outil jusqu'au ${d}. Ensuite, plus rien ne sera prélevé.` };
  return { ...base, button: "Zu meinem Bereich", aboName: (p: string) => `das Monatsabo für das Bewerbungswerkzeug (${p} im Monat)`, monthName: (n: number, p: string) => `${n} weiteren Monat Bewerbungswerkzeug (${p})`,
    paidSubject: "Danke, dein Werkzeug ist verlängert", requestedSubject: "Wir haben deine Bestellung erhalten", cancelledSubject: "Kündigung bestätigt",
    paid: (w: string) => `vielen Dank! Wir haben ${w} freigeschaltet.`, requested: (w: string) => `danke für deine Bestellung: ${w}. Wir schicken dir in Kürze den Link zur Zahlung.`,
    cancelled: (d: string) => `dein Abo ist gekündigt. Du kannst das Bewerbungswerkzeug noch bis ${d} nutzen. Danach wird nichts mehr abgebucht.` };
}

/** Mails zur Buchung des Startpakets */
export function bookingMail(locale?: string | null) {
  const l = wLang(locale);
  const base = { hello: hello(l), sign: SIGN[l] };
  if (l === "en") return { ...base, button: "Go to my area", paidSubject: "Your booking is confirmed", requestedSubject: "We received your request",
    paid: (price: string, months: number) => [`thank you! We received your payment of ${price} for the starter package.`, `Your application tool is unlocked for ${months} months. Best start with your application folder: upload your CV or fill in your details. We check everything and let you know when your documents are ready.`],
    requested: (price: string) => [`thank you for your request for the starter package (${price}).`, "We will contact you within 2 working days and send you the payment link. You can already start with your application folder."] };
  if (l === "fr") return { ...base, button: "Vers mon espace", paidSubject: "Votre réservation est confirmée", requestedSubject: "Nous avons reçu votre demande",
    paid: (price: string, months: number) => [`merci ! Nous avons bien reçu votre paiement de ${price} pour le pack de départ.`, `Votre outil de candidature est activé pour ${months} mois. Commencez par votre dossier : téléchargez votre CV ou remplissez vos informations. Nous vérifions tout et vous prévenons quand vos documents sont prêts.`],
    requested: (price: string) => [`merci pour votre demande de pack de départ (${price}).`, "Nous vous contactons dans les 2 jours ouvrés et vous envoyons le lien de paiement. Vous pouvez déjà commencer votre dossier."] };
  return { ...base, button: "Zu meinem Bereich", paidSubject: "Deine Buchung ist bestätigt", requestedSubject: "Wir haben deine Anfrage erhalten",
    paid: (price: string, months: number) => [`vielen Dank! Deine Zahlung über ${price} für das Startpaket ist bei uns eingegangen.`, `Dein Bewerbungswerkzeug ist für ${months} Monate freigeschaltet. Fang am besten mit deiner Bewerbungsmappe an: Lebenslauf hochladen oder Angaben ausfüllen. Wir prüfen alles und sagen dir Bescheid, wenn deine Unterlagen fertig sind.`],
    requested: (price: string) => [`danke für deine Anfrage zum Startpaket (${price}).`, "Wir melden uns in den nächsten 2 Werktagen und schicken dir den Link zur Zahlung. Mit deiner Bewerbungsmappe kannst du schon anfangen."] };
}
