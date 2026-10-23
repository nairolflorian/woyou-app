// Texte im Kundenbereich („Mein Bereich“), je Sprache. Seit 23.10.2026 ohne Verlängerung und Abo.
// Weg 1: kein Guthaben je Bewerbung mehr, sondern Unterlagen plus Bewerbungswerkzeug mit Laufzeit.
// Deutsch, Englisch, Französisch, Arabisch, Hindi; andere Sprachen bekommen Englisch.
// Platzhalter in {geschweiften Klammern} mit fill() ersetzen.
type T = {
  payAborted: string;
  packageTitle: string; legacyPackage: string; myMappe: string; mappeState: string; mappe: Record<"NONE" | "DRAFT" | "SUBMITTED" | "APPROVED", string>;
  toolTitle: string; toolLead: string; toolActive: string; toolExpired: string; toolInactive: string; toolInactiveLead: string;
  /** Laufzeit ehrlich erklärt: {months} Monate inklusive, danach Ende ohne Verlängerung/Abo, Unterlagen bleiben */
  toolIncluded: string; toolExpiredLead: string; myLetters: string;
  openSearch: string; openTracker: string; counts: string;
  booking: Record<"REQUESTED" | "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "DONE" | "CANCELLED", string>;
  docsLead: string; noBookingTitle: string;
};

const de: T = {
  payAborted: "Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.",
  packageTitle: "Dein Startpaket", legacyPackage: "Dein Paket (vor der Umstellung gebucht)", myMappe: "Meine Bewerbungsmappe", mappeState: "Unterlagen",
  mappe: { NONE: "noch nicht begonnen", DRAFT: "du füllst sie aus", SUBMITTED: "abgeschickt, wir prüfen sie", APPROVED: "fertig, zum Herunterladen" },
  toolTitle: "Dein Bewerbungswerkzeug", toolLead: "Stellen suchen, Anschreiben je Stelle erstellen und deine Bewerbungen im Blick behalten. Du bewirbst dich selbst und bekommst alle Antworten direkt.",
  toolActive: "freigeschaltet bis {date}", toolExpired: "abgelaufen am {date}", toolInactive: "noch nicht freigeschaltet",
  toolInactiveLead: "Das Werkzeug wird freigeschaltet, sobald deine Zahlung da ist.",
  toolIncluded: "Im Startpaket sind {months} Monate Werkzeug enthalten. Danach endet der Zugang von selbst. Es gibt keine Verlängerung und kein Abo, du musst also nichts kündigen. Deine Unterlagen behältst du.",
  toolExpiredLead: "Deine {months} Monate mit dem Werkzeug sind vorbei. Stellensuche und „Meine Bewerbungen“ sind jetzt gesperrt. Deine Unterlagen gehören dir: Lebenslauf, Anschreiben-Vorlage und die Anschreiben zu deinen Stellen kannst du weiter herunterladen.", myLetters: "Meine Anschreiben herunterladen",
  openSearch: "Stellensuche öffnen", openTracker: "Meine Bewerbungen", counts: "{saved} gemerkt · {applied} beworben",
  booking: { REQUESTED: "Angefragt", PENDING_PAYMENT: "Zahlung offen", PAID: "Bezahlt", IN_PROGRESS: "In Arbeit", DONE: "Abgeschlossen", CANCELLED: "Storniert" },
  docsLead: "Zeugnisse, Nachweise und Zertifikate. Lade sie hier hoch, dann hast du sie für deine Bewerbungen griffbereit.",
  noBookingTitle: "Bewerbungsunterlagen und Bewerbungswerkzeug",
};

const en: T = {
  payAborted: "The payment was cancelled. You can try again at any time.",
  packageTitle: "Your starter package", legacyPackage: "Your package (booked before the change)", myMappe: "My application folder", mappeState: "Documents",
  mappe: { NONE: "not started yet", DRAFT: "you are filling it in", SUBMITTED: "sent, we are checking it", APPROVED: "ready to download" },
  toolTitle: "Your application tool", toolLead: "Search for jobs, create a cover letter for each job and keep track of your applications. You apply yourself and every reply comes straight to you.",
  toolActive: "unlocked until {date}", toolExpired: "expired on {date}", toolInactive: "not unlocked yet",
  toolInactiveLead: "The tool is unlocked as soon as your payment has arrived.",
  toolIncluded: "The starter package includes {months} months of the tool. After that, access simply ends. There is no extension and no subscription, so there is nothing to cancel. You keep your documents.",
  toolExpiredLead: "Your {months} months with the tool are over. Job search and “My applications” are now locked. Your documents belong to you: you can still download your CV, your cover letter template and the cover letters for your jobs.", myLetters: "Download my cover letters",
  openSearch: "Open job search", openTracker: "My applications", counts: "{saved} saved · {applied} applied",
  booking: { REQUESTED: "Requested", PENDING_PAYMENT: "Payment open", PAID: "Paid", IN_PROGRESS: "In progress", DONE: "Completed", CANCELLED: "Cancelled" },
  docsLead: "Certificates and proof of qualifications. Upload them here so you have them at hand for your applications.",
  noBookingTitle: "Application documents and application tool",
};

const fr: T = {
  payAborted: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.",
  packageTitle: "Votre pack de départ", legacyPackage: "Votre pack (réservé avant le changement)", myMappe: "Mon dossier de candidature", mappeState: "Documents",
  mappe: { NONE: "pas encore commencé", DRAFT: "vous le remplissez", SUBMITTED: "envoyé, nous le vérifions", APPROVED: "prêt à télécharger" },
  toolTitle: "Votre outil de candidature", toolLead: "Chercher des offres, créer une lettre pour chaque offre et suivre vos candidatures. Vous postulez vous-même et recevez toutes les réponses directement.",
  toolActive: "activé jusqu'au {date}", toolExpired: "expiré le {date}", toolInactive: "pas encore activé",
  toolInactiveLead: "L'outil est activé dès réception de votre paiement.",
  toolIncluded: "Le pack de départ comprend {months} mois d'outil. Ensuite, l'accès s'arrête de lui-même. Il n'y a ni prolongation ni abonnement, vous n'avez donc rien à résilier. Vous gardez vos documents.",
  toolExpiredLead: "Vos {months} mois d'outil sont terminés. La recherche d'emploi et « Mes candidatures » sont maintenant fermées. Vos documents vous appartiennent : vous pouvez toujours télécharger votre CV, votre modèle de lettre et les lettres créées pour vos offres.", myLetters: "Télécharger mes lettres",
  openSearch: "Ouvrir la recherche", openTracker: "Mes candidatures", counts: "{saved} gardées · {applied} envoyées",
  booking: { REQUESTED: "Demandé", PENDING_PAYMENT: "Paiement en attente", PAID: "Payé", IN_PROGRESS: "En cours", DONE: "Terminé", CANCELLED: "Annulé" },
  docsLead: "Diplômes, attestations et certificats. Téléchargez-les ici pour les avoir sous la main pour vos candidatures.",
  noBookingTitle: "Dossier de candidature et outil de candidature",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Arabisch, Hocharabisch für Marokko)
const ar: T = {
  payAborted: "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى في أي وقت.",
  packageTitle: "باقة البداية الخاصة بك", legacyPackage: "باقتك (حُجزت قبل التغيير)", myMappe: "ملف التقديم الخاص بي", mappeState: "المستندات",
  mappe: { NONE: "لم تبدأ بعد", DRAFT: "أنت تملؤه الآن", SUBMITTED: "تم الإرسال، ونحن نراجعه", APPROVED: "جاهز للتحميل" },
  toolTitle: "أداة التقديم الخاصة بك", toolLead: "ابحث عن وظائف، وأنشئ رسالة تحفيز لكل وظيفة، وتابع طلباتك. أنت تتقدّم بنفسك وتصلك كل الردود مباشرة.",
  toolActive: "مفعّلة حتى {date}", toolExpired: "انتهت في {date}", toolInactive: "لم تُفعّل بعد",
  toolInactiveLead: "تُفعَّل الأداة بمجرد وصول دفعك.",
  toolIncluded: "تشمل باقة البداية {months} من أداة التقديم. بعد ذلك ينتهي الوصول تلقائيًا. لا يوجد تمديد ولا اشتراك، لذلك لا حاجة لإلغاء أي شيء. مستنداتك تبقى لك.",
  toolExpiredLead: "انتهت مدة أداة التقديم ({months}). البحث عن وظيفة و«طلباتي» مغلقان الآن. مستنداتك ملك لك: يمكنك الاستمرار في تحميل سيرتك الذاتية ونموذج رسالة التحفيز ورسائل التحفيز الخاصة بوظائفك.", myLetters: "تحميل رسائل التحفيز الخاصة بي",
  openSearch: "فتح البحث عن وظيفة", openTracker: "طلباتي", counts: "{saved} محفوظة · {applied} تم التقديم عليها",
  booking: { REQUESTED: "مطلوب", PENDING_PAYMENT: "الدفع معلق", PAID: "مدفوع", IN_PROGRESS: "قيد التنفيذ", DONE: "مكتمل", CANCELLED: "ملغى" },
  docsLead: "الشهادات والإثباتات. ارفعها هنا لتكون في متناولك عند التقديم.",
  noBookingTitle: "مستندات التقديم وأداة التقديم",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Hindi)
const hi: T = {
  payAborted: "भुगतान रद्द हो गया। आप कभी भी फिर से कोशिश कर सकते हैं।",
  packageTitle: "आपका स्टार्टर पैकेज", legacyPackage: "आपका पैकेज (बदलाव से पहले बुक किया गया)", myMappe: "मेरी आवेदन फ़ाइल", mappeState: "दस्तावेज़",
  mappe: { NONE: "अभी शुरू नहीं हुई", DRAFT: "आप इसे भर रहे हैं", SUBMITTED: "भेज दी गई, हम जाँच रहे हैं", APPROVED: "तैयार, डाउनलोड के लिए" },
  toolTitle: "आपका आवेदन टूल", toolLead: "नौकरियाँ खोजें, हर नौकरी के लिए कवर लेटर बनाएँ और अपने आवेदनों पर नज़र रखें। आवेदन आप ख़ुद करते हैं और सभी जवाब सीधे आपको मिलते हैं।",
  toolActive: "{date} तक चालू", toolExpired: "{date} को समाप्त", toolInactive: "अभी चालू नहीं",
  toolInactiveLead: "आपका भुगतान मिलते ही टूल चालू हो जाएगा।",
  toolIncluded: "स्टार्टर पैकेज में {months} महीने का टूल शामिल है। उसके बाद पहुँच अपने-आप ख़त्म हो जाती है। न अवधि बढ़ाने का विकल्प है, न सदस्यता, इसलिए कुछ रद्द करने की ज़रूरत नहीं। आपके दस्तावेज़ आपके पास रहते हैं।",
  toolExpiredLead: "टूल के आपके {months} महीने पूरे हो गए हैं। नौकरी खोज और “मेरे आवेदन” अब बंद हैं। आपके दस्तावेज़ आपके अपने हैं: अपना बायोडाटा, कवर लेटर का नमूना और अपनी नौकरियों के कवर लेटर आप अब भी डाउनलोड कर सकते हैं।", myLetters: "मेरे कवर लेटर डाउनलोड करें",
  openSearch: "नौकरी खोज खोलें", openTracker: "मेरे आवेदन", counts: "{saved} सहेजी गईं · {applied} पर आवेदन किया",
  booking: { REQUESTED: "अनुरोध किया", PENDING_PAYMENT: "भुगतान बाकी", PAID: "भुगतान हो गया", IN_PROGRESS: "काम चल रहा है", DONE: "पूरा", CANCELLED: "रद्द" },
  docsLead: "प्रमाणपत्र और योग्यता के दस्तावेज़। इन्हें यहाँ अपलोड करें, ताकि आवेदन के लिए ये आपके पास तैयार रहें।",
  noBookingTitle: "आवेदन दस्तावेज़ और आवेदन टूल",
};

const ALL = { de, en, fr, ar, hi };
export const accountText = (locale: string): T => ALL[(locale in ALL ? locale : "en") as keyof typeof ALL];
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
