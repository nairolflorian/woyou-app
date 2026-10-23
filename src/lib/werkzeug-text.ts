// Texte für das Bewerbungswerkzeug (Stellensuche, Meine Bewerbungen) und die zugehörigen Mails.
// Deutsch, Englisch, Französisch, Arabisch (rechts nach links), Hindi; alle anderen Sprachen bekommen Englisch.
// Textregeln: ehrlich, kein Jobversprechen, keine langen Gedankenstriche, du-Form, menschlich.
// Keine Server-Importe: wird auch in Client-Komponenten verwendet.

export type WLang = "de" | "en" | "fr" | "ar" | "hi";
export const wLang = (locale?: string | null): WLang => (locale === "de" || locale === "fr" || locale === "ar" || locale === "hi" ? locale : locale ? "en" : "de");
// ar-MA und hi-IN schreiben Datum und Preise mit lateinischen Ziffern (wie in Marokko bzw. Indien üblich)
export const dateLocaleOf = (l: WLang) => (l === "de" ? "de-DE" : l === "fr" ? "fr-FR" : l === "ar" ? "ar-MA" : l === "hi" ? "hi-IN" : "en-GB");
/** Schreibrichtung, z. B. für Mails */
export const dirOf = (l: WLang): "rtl" | "ltr" => (l === "ar" ? "rtl" : "ltr");
/** Arabisch: „3 أشهر“, „شهرين“ usw. (Zahl + Monat in der richtigen Form) */
export const arMonths = (n: number) => (n === 1 ? "شهر واحد" : n === 2 ? "شهرين" : n <= 10 ? `${n} أشهر` : `${n} شهرًا`);
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
  // nach Ablauf: Anschreiben je Stelle bleiben herunterladbar
  lettersTitle: string; lettersLead: string; noLetters: string;
  // Tracker
  trackerTitle: string; trackerLead: string; empty: string; toSearch: string; toTracker: string; all: string;
  status: Record<TrackerStatus, string>; statusLabel: string; appliedOn: string; repliedOn: string; interviewOn: string;
  notes: string; notesPh: string; saveNotes: string; savedOk: string; remove: string; removeAsk: string;
  letterTitle: string; letterHint: string; generate: string; regenerate: string; generating: string; letterLang: string;
  pdf: string; word: string; cv: string; mail: string; mailHint: string; noEmail: string; employer: string; markApplied: string;
  addOwn: string; addOwnLead: string; ownTitle: string; ownCompany: string; ownCity: string; ownUrl: string; ownEmail: string; add: string;
  failed: string; readOnly: string; back: string; navSearch: string; navTracker: string; navMappe: string;
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
  expiredTitle: "Dein Bewerbungswerkzeug ist abgelaufen", expiredLead: "Die Monate mit dem Werkzeug aus deinem Startpaket sind vorbei. Stellensuche und „Meine Bewerbungen“ sind jetzt gesperrt. Deine Unterlagen gehören dir: Lebenslauf, Anschreiben-Vorlage und die Anschreiben zu deinen Stellen kannst du weiter herunterladen.", expiredCta: "Zu meinen Unterlagen",
  lettersTitle: "Deine Anschreiben zum Herunterladen", lettersLead: "Für jede Stelle, zu der du ein Anschreiben erstellt hast, kannst du es hier weiter als PDF oder Word laden, dazu deinen Lebenslauf.", noLetters: "Du hast zu keiner Stelle ein Anschreiben erstellt. Deinen Lebenslauf und die Anschreiben-Vorlage findest du in deinem Bereich.",
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
  failed: "Das hat nicht geklappt.", readOnly: "Dein Werkzeug ist abgelaufen. Deine Anschreiben kannst du weiter herunterladen.", back: "Mein Bereich", navSearch: "Stellensuche", navTracker: "Meine Bewerbungen", navMappe: "Bewerbungsmappe",
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
  expiredTitle: "Your application tool has expired", expiredLead: "The months with the tool from your starter package are over. Job search and “My applications” are now locked. Your documents belong to you: you can still download your CV, your cover letter template and the cover letters for your jobs.", expiredCta: "Go to my documents",
  lettersTitle: "Your cover letters to download", lettersLead: "For every job you created a cover letter for, you can still download it here as PDF or Word, together with your CV.", noLetters: "You haven't created a cover letter for a job. Your CV and the cover letter template are in your area.",
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
  failed: "That didn't work.", readOnly: "Your tool has expired. You can still download your cover letters.", back: "My area", navSearch: "Job search", navTracker: "My applications", navMappe: "Application folder",
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
  expiredTitle: "Votre outil de candidature a expiré", expiredLead: "Les mois d'outil compris dans votre pack de départ sont terminés. La recherche d'emploi et « Mes candidatures » sont maintenant fermées. Vos documents vous appartiennent : vous pouvez toujours télécharger votre CV, votre modèle de lettre et les lettres créées pour vos offres.", expiredCta: "Vers mes documents",
  lettersTitle: "Vos lettres à télécharger", lettersLead: "Pour chaque offre pour laquelle vous avez créé une lettre, vous pouvez toujours la télécharger ici en PDF ou en Word, avec votre CV.", noLetters: "Vous n'avez créé de lettre pour aucune offre. Votre CV et le modèle de lettre se trouvent dans votre espace.",
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
  failed: "Cela n'a pas fonctionné.", readOnly: "Votre outil a expiré. Vous pouvez toujours télécharger vos lettres.", back: "Mon espace", navSearch: "Recherche", navTracker: "Mes candidatures", navMappe: "Dossier",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Arabisch, Hocharabisch für Marokko)
const ar: UI = {
  searchTitle: "البحث عن وظيفة",
  searchLead: "هنا تجد وظائف حالية من منصة الوظائف التابعة للوكالة الاتحادية الألمانية للتشغيل ومن منصات وظائف عامة أخرى. البحث يبدأ ببياناتك. أنت من يقرر أي وظائف تحفظها وأين تتقدّم بطلبك.",
  was: "المهنة", wasPh: "مثلًا: Pflegefachkraft", wo: "المدينة أو الرمز البريدي", woPh: "فارغ = كل ألمانيا", radius: "نطاق البحث",
  hours: "وقت العمل", hoursAll: "لا يهم", fulltime: "دوام كامل", parttime: "دوام جزئي", myGerman: "مستواي في الألمانية", germanUnknown: "غير محدد",
  onlyFitting: "فقط الوظائف التي يناسبني فيها مستوى الألمانية المطلوب أو التي لا تذكر أي مستوى",
  search: "بحث", searching: "جارٍ البحث …", fromProfile: "اقتراحات من ملفك:", results: "{n} نتيجة", noResults: "لا توجد نتائج. جرّب مهنة أعمّ أو نطاق بحث أوسع.", more: "عرض المزيد من النتائج",
  save: "حفظ", saved: "محفوظة", openAd: "عرض الإعلان", viaEmployerSite: "التقديم عبر موقع صاحب العمل", withEmail: "التقديم بالبريد الإلكتروني ممكن",
  germanOk: "مطلوب ألمانية {req}، وهذا يناسب مستواك", germanClose: "مطلوب ألمانية {req}، قريب من مستواك", germanHigh: "مطلوب ألمانية {req}، أعلى من مستواك", germanReq: "مطلوب ألمانية {req}", germanNone: "لم نجد معلومة عن مستوى الألمانية المطلوب",
  published: "منذ {date}", km: "{n} كم", source: "المصدر: {src}",
  alsoSearch: "ابحث بنفسك هناك أيضًا:", alsoHint: "تُفتح هذه المواقع في نافذة جديدة. لا نقرأ منها شيئًا ولا ننقل منها شيئًا تلقائيًا.",
  searchError: "لم ينجح البحث الآن. يرجى المحاولة مرة أخرى بعد قليل.",
  lockedTitle: "البحث عن وظيفة جزء من باقة البداية", lockedLead: "مع باقة البداية تحصل على مستندات التقديم بالمعايير الألمانية وعلى أداة التقديم: البحث عن وظائف، ورسالة تحفيز لكل وظيفة، ونظرة عامة خاصة بك.", lockedCta: "عرض باقة البداية",
  expiredTitle: "انتهت مدة أداة التقديم", expiredLead: "انتهت أشهر الأداة المشمولة في باقة البداية. البحث عن وظيفة و«طلباتي» مغلقان الآن. مستنداتك ملك لك: يمكنك الاستمرار في تحميل سيرتك الذاتية ونموذج رسالة التحفيز ورسائل التحفيز الخاصة بوظائفك.", expiredCta: "إلى مستنداتي",
  lettersTitle: "رسائل التحفيز الخاصة بك للتحميل", lettersLead: "لكل وظيفة أنشأت لها رسالة تحفيز، يمكنك الاستمرار في تحميلها هنا بصيغة PDF أو Word، مع سيرتك الذاتية.", noLetters: "لم تُنشئ رسالة تحفيز لأي وظيفة. تجد سيرتك الذاتية ونموذج رسالة التحفيز في حسابك.",
  trackerTitle: "طلباتي", trackerLead: "وظائفك المحفوظة وأين وصلت في كل واحدة منها. أنت وحدك من يدير هذه القائمة. نحن لا نراسل الشركات ولا نقرأ الردود.",
  empty: "لم تحفظ أي وظيفة بعد. في البحث عن وظيفة تجد عروضًا مناسبة.", toSearch: "إلى البحث عن وظيفة", toTracker: "طلباتي ({n})", all: "الكل",
  status: { SAVED: "محفوظة", APPLIED: "تم التقديم", REPLY: "وصل رد", INTERVIEW: "مقابلة", REJECTED: "رفض", OFFER: "قبول" },
  statusLabel: "الحالة", appliedOn: "تم التقديم في {date}", repliedOn: "وصل الرد في {date}", interviewOn: "المقابلة في {date}",
  notes: "ملاحظات", notesPh: "مثلًا: الشخص المسؤول، رقم الهاتف، ما كان مهمًا في المقابلة", saveNotes: "حفظ الملاحظة", savedOk: "تم الحفظ.", remove: "حذف من القائمة", removeAsk: "هل تريد فعلًا حذف هذه الوظيفة من قائمتك؟",
  letterTitle: "رسالة التحفيز لهذه الوظيفة", letterHint: "نُعدّ رسالة التحفيز من بياناتك ومن نص الإعلان. اقرأها بهدوء وغيّر ما ليس صحيحًا. أنت من يرسلها بنفسك.",
  generate: "إنشاء رسالة التحفيز", regenerate: "إنشاء من جديد", generating: "جارٍ الإنشاء …", letterLang: "لغة رسالة التحفيز",
  pdf: "رسالة التحفيز (PDF)", word: "رسالة التحفيز (Word)", cv: "السيرة الذاتية (PDF)",
  mail: "فتح في برنامج البريد الخاص بي", mailHint: "يُفتح برنامج بريدك مع المستلم والموضوع ونص قصير. حمّل رسالة التحفيز والسيرة الذاتية أولًا ثم أرفقهما بنفسك بصيغة PDF. تصلك الردود مباشرة في بريدك.",
  noEmail: "لا يوجد عنوان بريد إلكتروني في الإعلان. قدّم طلبك عبر موقع صاحب العمل.", employer: "إلى صفحة التقديم لدى صاحب العمل", markApplied: "لقد قدّمت طلبي",
  addOwn: "أضف وظيفة بنفسك", addOwnLead: "وجدت وظيفة في مكان آخر، مثلًا على منصة وظائف أو موقع شركة؟ أضفها هنا ليكون كل شيء في مكان واحد.",
  ownTitle: "المسمى الوظيفي", ownCompany: "الشركة", ownCity: "المدينة (اختياري)", ownUrl: "رابط الإعلان (اختياري)", ownEmail: "بريد التقديم (اختياري)", add: "إضافة",
  failed: "لم ينجح ذلك.", readOnly: "انتهت مدة أداتك. يمكنك الاستمرار في تحميل رسائل التحفيز الخاصة بك.", back: "حسابي", navSearch: "البحث عن وظيفة", navTracker: "طلباتي", navMappe: "ملف التقديم",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Hindi)
const hi: UI = {
  searchTitle: "नौकरी खोज",
  searchLead: "यहाँ आपको जर्मनी की संघीय रोज़गार एजेंसी (Bundesagentur für Arbeit) के जॉब बोर्ड और दूसरे सार्वजनिक जॉब बोर्ड से ताज़ा नौकरियाँ मिलती हैं। खोज में आपकी जानकारी पहले से भरी होती है। कौन-सी नौकरियाँ सहेजनी हैं और कहाँ आवेदन करना है, यह आप तय करते हैं।",
  was: "पेशा", wasPh: "जैसे Pflegefachkraft", wo: "शहर या पिन कोड", woPh: "ख़ाली = पूरा जर्मनी", radius: "दायरा",
  hours: "काम का समय", hoursAll: "कोई भी", fulltime: "फ़ुल-टाइम", parttime: "पार्ट-टाइम", myGerman: "मेरी जर्मन", germanUnknown: "नहीं बताया",
  onlyFitting: "सिर्फ़ वे नौकरियाँ जिनकी जर्मन की माँग मेरे स्तर से मेल खाती है या जिनमें कोई माँग नहीं लिखी है",
  search: "खोजें", searching: "खोज जारी है …", fromProfile: "आपकी प्रोफ़ाइल से सुझाव:", results: "{n} नतीजे", noResults: "कोई नतीजा नहीं मिला। कोई सामान्य पेशा या बड़ा दायरा आज़माएँ।", more: "और नतीजे दिखाएँ",
  save: "सहेजें", saved: "सहेजी गई", openAd: "विज्ञापन देखें", viaEmployerSite: "नियोक्ता की वेबसाइट से आवेदन", withEmail: "ईमेल से आवेदन संभव",
  germanOk: "जर्मन {req} चाहिए, आपके स्तर से मेल खाता है", germanClose: "जर्मन {req} चाहिए, आपके स्तर के क़रीब", germanHigh: "जर्मन {req} चाहिए, आपके स्तर से ऊपर", germanReq: "जर्मन {req} चाहिए", germanNone: "जर्मन के बारे में कोई जानकारी नहीं मिली",
  published: "{date} से", km: "{n} किमी", source: "स्रोत: {src}",
  alsoSearch: "वहाँ भी ख़ुद खोजें:", alsoHint: "ये वेबसाइटें नई विंडो में खुलती हैं। हम वहाँ से कुछ नहीं पढ़ते और अपने-आप कुछ नहीं लेते।",
  searchError: "अभी खोज नहीं हो पाई। कृपया थोड़ी देर में फिर कोशिश करें।",
  lockedTitle: "नौकरी खोज स्टार्टर पैकेज का हिस्सा है", lockedLead: "स्टार्टर पैकेज में आपको जर्मन मानक के अनुसार आवेदन दस्तावेज़ और आवेदन टूल मिलता है: नौकरी खोज, हर नौकरी के लिए कवर लेटर और आपकी अपनी सूची।", lockedCta: "स्टार्टर पैकेज देखें",
  expiredTitle: "आपका आवेदन टूल समाप्त हो गया है", expiredLead: "स्टार्टर पैकेज में शामिल टूल के महीने पूरे हो गए हैं। नौकरी खोज और “मेरे आवेदन” अब बंद हैं। आपके दस्तावेज़ आपके अपने हैं: अपना बायोडाटा, कवर लेटर का नमूना और अपनी नौकरियों के कवर लेटर आप अब भी डाउनलोड कर सकते हैं।", expiredCta: "मेरे दस्तावेज़ों पर जाएँ",
  lettersTitle: "डाउनलोड के लिए आपके कवर लेटर", lettersLead: "जिस भी नौकरी के लिए आपने कवर लेटर बनाया है, उसे आप यहाँ अब भी PDF या Word में डाउनलोड कर सकते हैं, साथ में अपना बायोडाटा भी।", noLetters: "आपने किसी नौकरी के लिए कवर लेटर नहीं बनाया है। आपका बायोडाटा और कवर लेटर का नमूना आपके खाते में है।",
  trackerTitle: "मेरे आवेदन", trackerLead: "आपकी सहेजी गई नौकरियाँ और हर एक में आप कहाँ तक पहुँचे। यह सूची सिर्फ़ आप रखते हैं। हम कंपनियों से संपर्क नहीं करते और जवाब नहीं पढ़ते।",
  empty: "आपने अभी तक कोई नौकरी नहीं सहेजी है। नौकरी खोज में आपको उपयुक्त नौकरियाँ मिलेंगी।", toSearch: "नौकरी खोज पर जाएँ", toTracker: "मेरे आवेदन ({n})", all: "सभी",
  status: { SAVED: "सहेजी गई", APPLIED: "आवेदन किया", REPLY: "जवाब आया", INTERVIEW: "इंटरव्यू", REJECTED: "अस्वीकार", OFFER: "नौकरी का प्रस्ताव" },
  statusLabel: "स्थिति", appliedOn: "{date} को आवेदन किया", repliedOn: "{date} को जवाब आया", interviewOn: "{date} को इंटरव्यू",
  notes: "नोट्स", notesPh: "जैसे संपर्क व्यक्ति, फ़ोन नंबर, इंटरव्यू में क्या ज़रूरी था", saveNotes: "नोट सहेजें", savedOk: "सहेजा गया।", remove: "सूची से हटाएँ", removeAsk: "क्या सच में इस नौकरी को अपनी सूची से हटाना है?",
  letterTitle: "इस नौकरी के लिए कवर लेटर", letterHint: "हम आपकी जानकारी और नौकरी के विज्ञापन से कवर लेटर तैयार करते हैं। इसे आराम से पढ़ें और जो सही न हो, उसे बदलें। इसे आप ख़ुद भेजते हैं।",
  generate: "कवर लेटर बनाएँ", regenerate: "फिर से बनाएँ", generating: "बन रहा है …", letterLang: "कवर लेटर की भाषा",
  pdf: "कवर लेटर (PDF)", word: "कवर लेटर (Word)", cv: "बायोडाटा (PDF)",
  mail: "मेरे ईमेल प्रोग्राम में खोलें", mailHint: "आपका ईमेल प्रोग्राम प्राप्तकर्ता, विषय और एक छोटे संदेश के साथ खुलेगा। कवर लेटर और बायोडाटा पहले डाउनलोड करें और ख़ुद PDF के रूप में जोड़ें। जवाब सीधे आपके इनबॉक्स में आते हैं।",
  noEmail: "विज्ञापन में कोई ईमेल पता नहीं है। नियोक्ता की वेबसाइट से आवेदन करें।", employer: "नियोक्ता के आवेदन पेज पर जाएँ", markApplied: "मैंने आवेदन कर दिया",
  addOwn: "ख़ुद नौकरी जोड़ें", addOwnLead: "आपको कहीं और नौकरी मिली, जैसे किसी जॉब पोर्टल या कंपनी की वेबसाइट पर? उसे यहाँ जोड़ें, ताकि सब कुछ एक जगह रहे।",
  ownTitle: "पद का नाम", ownCompany: "कंपनी", ownCity: "शहर (वैकल्पिक)", ownUrl: "विज्ञापन का लिंक (वैकल्पिक)", ownEmail: "आवेदन का ईमेल (वैकल्पिक)", add: "जोड़ें",
  failed: "यह काम नहीं किया।", readOnly: "आपका टूल समाप्त हो गया है। अपने कवर लेटर आप अब भी डाउनलोड कर सकते हैं।", back: "मेरा खाता", navSearch: "नौकरी खोज", navTracker: "मेरे आवेदन", navMappe: "आवेदन फ़ाइल",
};

const UI_ALL: Record<WLang, UI> = { de, en, fr, ar, hi };
export const werkzeugText = (locale?: string | null): UI => UI_ALL[wLang(locale)];

// ---------- Mails ----------
// ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
const SIGN: Record<WLang, string> = { de: "Viele Grüße\nDein WoYou-Team", en: "Best regards\nYour WoYou team", fr: "Bien cordialement\nL'équipe WoYou", ar: "مع أطيب التحيات\nفريق WoYou", hi: "शुभकामनाओं के साथ\nआपकी WoYou टीम" };
const HELLO: Record<WLang, string> = { de: "Hallo", en: "Hi", fr: "Bonjour", ar: "مرحبًا", hi: "नमस्ते" };
const hello = (l: WLang) => (name?: string | null) => `${HELLO[l]}${name ? ` ${name}` : ""}${l === "ar" ? "،" : ","}`;

/** Mail an die Kundin bzw. den Kunden, wenn das Team die Mappe freigegeben hat */
export function mappeMail(locale?: string | null) {
  const l = wLang(locale);
  // Übersetzung bitte von Muttersprachler:in prüfen lassen (ar, hi)
  if (l === "ar") return { dir: dirOf(l), subject: "مستندات التقديم الخاصة بك جاهزة", hello: hello(l), button: "فتح البحث عن وظيفة", paras: ["راجعنا ملف التقديم الخاص بك. سيرتك الذاتية ونموذج رسالة التحفيز جاهزان، ويمكنك تحميلهما في أي وقت من حسابك.", "الآن يمكنك أن تبدأ: في البحث عن وظيفة تجد وظائف مناسبة، وتحفظ ما يعجبك منها، وتُنشئ لكل واحدة رسالة تحفيز. أنت تتقدّم بنفسك، من بريدك الإلكتروني أو عبر موقع صاحب العمل، وتصلك الردود مباشرة.", SIGN.ar] };
  if (l === "hi") return { dir: dirOf(l), subject: "आपके आवेदन दस्तावेज़ तैयार हैं", hello: hello(l), button: "नौकरी खोज खोलें", paras: ["हमने आपकी आवेदन फ़ाइल जाँच ली है। आपका बायोडाटा और कवर लेटर का नमूना तैयार है, आप इन्हें अपने खाते में कभी भी डाउनलोड कर सकते हैं।", "अब आप शुरू कर सकते हैं: नौकरी खोज में आपको उपयुक्त नौकरियाँ मिलेंगी। जो पसंद आएँ, उन्हें सहेजें और हर एक के लिए कवर लेटर बनाएँ। आवेदन आप ख़ुद करते हैं, अपने ईमेल से या नियोक्ता की वेबसाइट से, और जवाब सीधे आपको मिलते हैं।", SIGN.hi] };
  if (l === "en") return { dir: dirOf(l), subject: "Your application documents are ready", hello: hello(l), button: "Open job search", paras: ["we have checked your application folder. Your CV and your cover letter template are ready, and you can download them in your area at any time.", "Now you can start: in the job search you find suitable jobs, save the ones you like and create a cover letter for each. You apply yourself, from your own email address or via the employer's website, and replies come straight to you.", SIGN.en] };
  if (l === "fr") return { dir: dirOf(l), subject: "Votre dossier de candidature est prêt", hello: hello(l), button: "Ouvrir la recherche", paras: ["nous avons vérifié votre dossier. Votre CV et votre modèle de lettre sont prêts, vous pouvez les télécharger à tout moment dans votre espace.", "Vous pouvez commencer : dans la recherche d'emploi, vous trouvez des offres adaptées, gardez celles qui vous plaisent et créez une lettre pour chacune. Vous postulez vous-même, depuis votre propre adresse e-mail ou sur le site de l'employeur, et les réponses vous arrivent directement.", SIGN.fr] };
  return { dir: dirOf(l), subject: "Deine Bewerbungsunterlagen sind fertig", hello: hello(l), button: "Stellensuche öffnen", paras: ["wir haben deine Bewerbungsmappe geprüft. Dein Lebenslauf und deine Anschreiben-Vorlage sind fertig, du kannst sie jederzeit in deinem Bereich herunterladen.", "Jetzt kannst du loslegen: In der Stellensuche findest du passende Stellen, merkst dir die, die dir gefallen, und erstellst für jede ein Anschreiben. Du bewirbst dich selbst, aus deinem eigenen E-Mail-Postfach oder über die Seite des Arbeitgebers, und bekommst die Antworten direkt.", SIGN.de] };
}

/** Mails zur Buchung des Startpakets */
export function bookingMail(locale?: string | null) {
  const l = wLang(locale);
  const base = { dir: dirOf(l), hello: hello(l), sign: SIGN[l] };
  // Übersetzung bitte von Muttersprachler:in prüfen lassen (ar, hi)
  if (l === "ar") return { ...base, button: "إلى حسابي", paidSubject: "تم تأكيد حجزك", requestedSubject: "استلمنا طلبك",
    paid: (price: string, months: number) => [`شكرًا جزيلًا! وصلنا دفعك البالغ ${price} مقابل باقة البداية.`, `تم تفعيل أداة التقديم لمدة ${arMonths(months)}. ابدأ بملف التقديم: ارفع سيرتك الذاتية أو املأ بياناتك. نراجع كل شيء ونخبرك عندما تصبح مستنداتك جاهزة.`],
    requested: (price: string) => [`شكرًا على طلبك لباقة البداية (${price}).`, "سنتواصل معك خلال يومَي عمل ونرسل لك رابط الدفع. يمكنك من الآن أن تبدأ في ملف التقديم."] };
  if (l === "hi") return { ...base, button: "मेरे खाते पर जाएँ", paidSubject: "आपकी बुकिंग पक्की हो गई है", requestedSubject: "हमें आपका अनुरोध मिल गया है",
    paid: (price: string, months: number) => [`बहुत धन्यवाद! स्टार्टर पैकेज के लिए आपका ${price} का भुगतान हमें मिल गया है।`, `आपका आवेदन टूल ${months} ${months === 1 ? "महीने" : "महीनों"} के लिए चालू है। सबसे पहले अपनी आवेदन फ़ाइल से शुरू करें: अपना बायोडाटा अपलोड करें या अपनी जानकारी भरें। हम सब कुछ जाँचते हैं और दस्तावेज़ तैयार होने पर आपको बताते हैं।`],
    requested: (price: string) => [`स्टार्टर पैकेज (${price}) के अनुरोध के लिए धन्यवाद।`, "हम अगले 2 कार्यदिवसों में आपसे संपर्क करेंगे और भुगतान का लिंक भेजेंगे। आप अभी से अपनी आवेदन फ़ाइल शुरू कर सकते हैं।"] };
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
