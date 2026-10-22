// Texte im Kundenbereich („Mein Bereich“) und beim Verlängern des Werkzeugs, je Sprache.
// Weg 1: kein Guthaben je Bewerbung mehr, sondern Unterlagen plus Bewerbungswerkzeug mit Laufzeit.
// Deutsch, Englisch, Französisch, Arabisch, Hindi; andere Sprachen bekommen Englisch.
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

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Arabisch, Hocharabisch für Marokko)
const ar: T = {
  paidThanks: "شكرًا على الشراء! بمجرد تأكيد الدفع يتم تمديد أداتك.",
  payAborted: "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى في أي وقت.",
  packageTitle: "باقة البداية الخاصة بك", legacyPackage: "باقتك (حُجزت قبل التغيير)", myMappe: "ملف التقديم الخاص بي", mappeState: "المستندات",
  mappe: { NONE: "لم تبدأ بعد", DRAFT: "أنت تملؤه الآن", SUBMITTED: "تم الإرسال، ونحن نراجعه", APPROVED: "جاهز للتحميل" },
  toolTitle: "أداة التقديم الخاصة بك", toolLead: "ابحث عن وظائف، وأنشئ رسالة تحفيز لكل وظيفة، وتابع طلباتك. أنت تتقدّم بنفسك وتصلك كل الردود مباشرة.",
  toolActive: "مفعّلة حتى {date}", toolExpired: "انتهت في {date}", toolInactive: "لم تُفعّل بعد",
  toolInactiveLead: "تُفعَّل الأداة بمجرد وصول دفعك.", toolAbo: "الاشتراك فعّال ويتجدد شهريًا", toolAboCancelling: "تم إلغاء الاشتراك، وينتهي في {date}",
  openSearch: "فتح البحث عن وظيفة", openTracker: "طلباتي", counts: "{saved} محفوظة · {applied} تم التقديم عليها",
  booking: { REQUESTED: "مطلوب", PENDING_PAYMENT: "الدفع معلق", PAID: "مدفوع", IN_PROGRESS: "قيد التنفيذ", DONE: "مكتمل", CANCELLED: "ملغى" },
  extendTitle: "تمديد الأداة", extendLead: "شهر إضافي مرة واحدة، أو اشتراك يمكن إلغاؤه كل شهر. بدون تمديد ينتهي الوصول ببساطة، ويمكنك الاستمرار في تحميل مستنداتك.",
  month: "شهر إضافي", abo: "اشتراك شهري", perMonth: "شهريًا",
  monthTitle: "شهر واحد من أداة التقديم مقابل {price} (مرة واحدة، ينتهي تلقائيًا)", aboTitle: "اشتراك شهري مقابل {price} شهريًا. يبدأ عندما تنتهي مدتك المدفوعة، ويمكن إلغاؤه في نهاية أي شهر.",
  terms: ["أوافق على ", "الشروط العامة", " وقرأت ", "سياسة الخصوصية", "."],
  waiver: "أريد أن تستمر الأداة فورًا. أعلم أنني إذا انسحبت أدفع بشكل نسبي مقابل ما قُدّم حتى ذلك الحين.",
  order: "طلب ملزم بالدفع", orderNoPay: "طلب ملزم بالدفع (سيصلك رابط الدفع)", cancel: "إلغاء",
  ordered: "شكرًا! استلمنا طلبك وسنرسل لك رابط الدفع.", failed: "لم ينجح ذلك.",
  cancelAsk: "هل تريد فعلًا إلغاء الاشتراك؟ تبقى الأداة متاحة حتى {date}.", cancelNow: "إلغاء الآن", no: "لا", cancelBtn: "إلغاء الاشتراك من هنا",
  cancelled: "تم إلغاء اشتراكك. يمكنك استخدام الأداة حتى {date}.", cancelling: "تم إلغاء الاشتراك، والأداة متاحة حتى {date}.",
  docsLead: "الشهادات والإثباتات. ارفعها هنا لتكون في متناولك عند التقديم.",
  noBookingTitle: "مستندات التقديم وأداة التقديم",
};

// Übersetzung bitte von Muttersprachler:in prüfen lassen (Hindi)
const hi: T = {
  paidThanks: "ख़रीदारी के लिए धन्यवाद! भुगतान की पुष्टि होते ही आपके टूल की अवधि बढ़ा दी जाएगी।",
  payAborted: "भुगतान रद्द हो गया। आप कभी भी फिर से कोशिश कर सकते हैं।",
  packageTitle: "आपका स्टार्टर पैकेज", legacyPackage: "आपका पैकेज (बदलाव से पहले बुक किया गया)", myMappe: "मेरी आवेदन फ़ाइल", mappeState: "दस्तावेज़",
  mappe: { NONE: "अभी शुरू नहीं हुई", DRAFT: "आप इसे भर रहे हैं", SUBMITTED: "भेज दी गई, हम जाँच रहे हैं", APPROVED: "तैयार, डाउनलोड के लिए" },
  toolTitle: "आपका आवेदन टूल", toolLead: "नौकरियाँ खोजें, हर नौकरी के लिए कवर लेटर बनाएँ और अपने आवेदनों पर नज़र रखें। आवेदन आप ख़ुद करते हैं और सभी जवाब सीधे आपको मिलते हैं।",
  toolActive: "{date} तक चालू", toolExpired: "{date} को समाप्त", toolInactive: "अभी चालू नहीं",
  toolInactiveLead: "आपका भुगतान मिलते ही टूल चालू हो जाएगा।", toolAbo: "सदस्यता सक्रिय, हर महीने अपने-आप बढ़ती है", toolAboCancelling: "सदस्यता रद्द, {date} को समाप्त होगी",
  openSearch: "नौकरी खोज खोलें", openTracker: "मेरे आवेदन", counts: "{saved} सहेजी गईं · {applied} पर आवेदन किया",
  booking: { REQUESTED: "अनुरोध किया", PENDING_PAYMENT: "भुगतान बाकी", PAID: "भुगतान हो गया", IN_PROGRESS: "काम चल रहा है", DONE: "पूरा", CANCELLED: "रद्द" },
  extendTitle: "टूल की अवधि बढ़ाएँ", extendLead: "एक बार में एक महीना और, या सदस्यता जिसे हर महीने रद्द कर सकते हैं। अवधि न बढ़ाने पर पहुँच बस ख़त्म हो जाती है, और आप अपने दस्तावेज़ फिर भी डाउनलोड कर सकते हैं।",
  month: "1 महीना और", abo: "मासिक सदस्यता", perMonth: "प्रति माह",
  monthTitle: "{price} में 1 महीने का आवेदन टूल (एक बार, अपने-आप ख़त्म होता है)", aboTitle: "{price} प्रति माह की मासिक सदस्यता। यह आपकी भुगतान की गई अवधि ख़त्म होने पर शुरू होती है और किसी भी महीने के अंत में रद्द की जा सकती है।",
  terms: ["मैं ", "नियम और शर्तें", " स्वीकार करता/करती हूँ और मैंने ", "गोपनीयता नीति", " पढ़ ली है।"],
  waiver: "मैं चाहता/चाहती हूँ कि टूल तुरंत चलता रहे। मुझे पता है कि अनुबंध वापस लेने पर मुझे तब तक दी गई सेवा का अनुपात में भुगतान करना होगा।",
  order: "भुगतान के साथ ऑर्डर करें", orderNoPay: "भुगतान के साथ ऑर्डर करें (भुगतान लिंक बाद में आएगा)", cancel: "रद्द करें",
  ordered: "धन्यवाद! हमें आपका ऑर्डर मिल गया है, हम भुगतान का लिंक भेजेंगे।", failed: "यह काम नहीं किया।",
  cancelAsk: "क्या सच में सदस्यता रद्द करनी है? टूल {date} तक चलेगा।", cancelNow: "अभी रद्द करें", no: "नहीं", cancelBtn: "सदस्यता यहाँ रद्द करें",
  cancelled: "आपकी सदस्यता रद्द हो गई है। आप {date} तक टूल इस्तेमाल कर सकते हैं।", cancelling: "सदस्यता रद्द, टूल {date} तक चलेगा।",
  docsLead: "प्रमाणपत्र और योग्यता के दस्तावेज़। इन्हें यहाँ अपलोड करें, ताकि आवेदन के लिए ये आपके पास तैयार रहें।",
  noBookingTitle: "आवेदन दस्तावेज़ और आवेदन टूल",
};

const ALL = { de, en, fr, ar, hi };
export const accountText = (locale: string): T => ALL[(locale in ALL ? locale : "en") as keyof typeof ALL];
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
