// Pakete, die Bewerber:innen buchen können. Preise und Laufzeiten stehen zentral in src/lib/angebot.ts.
// Weg 1 (22.10.2026): verkauft werden Bewerbungsunterlagen plus Bewerbungswerkzeug, keine Bewerbungen.
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { arMonths } from "@/lib/werkzeug-text";

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
  PACK_25: { name: "Nachkauf zum früheren Paket", priceCents: 14900, credits: 25 },
  SUBSCRIPTION: { name: "Abo zum früheren Paket", priceCents: 5000, credits: 0 },
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

// ---------- Texte zu Paket, Buchung und Danke-Seite (DE/EN/FR/AR/HI; andere Sprachen auf Englisch) ----------
// Textregeln: ehrlich, kein Jobversprechen, keine langen Gedankenstriche, du-Form.
type Copy = {
  badge: string; title: string; lead: string; priceNote: string; cta: string; ctaLogin: string;
  bookTitle: string; bookLead: string; phone: string; jobs: string; regions: string; notes: string;
  terms: string; waiver: string; submit: string; submitNoPay: string; summary: string;
  thanksTitle: string; thanksPaid: string; thanksRequested: string; thanksMappe: string; toMappe: string; toProfile: string; failed: string; alreadyBooked: string;
};

function build(lang: "de" | "en" | "fr" | "ar" | "hi"): Copy {
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
  // Übersetzung bitte von Muttersprachler:in prüfen lassen (Arabisch, Hocharabisch für Marokko)
  if (lang === "ar") return {
    badge: "مستندات التقديم والأداة",
    title: "مستندات التقديم بالمعايير الألمانية. وأداة تتقدّم بها بنفسك.",
    lead: "نُعدّ مستندات التقديم الخاصة بك بالمعايير الألمانية، ونعطيك أداة تجد بها وظائف مناسبة وتتقدّم إليها بنفسك. أنت من يقرر أين تتقدّم، وتصلك كل الردود مباشرة.",
    priceNote: `دفعة واحدة · تشمل ${arMonths(months)} من أداة التقديم · بعدها ${month} لكل شهر أو ${abo} شهريًا باشتراك`,
    cta: "احجز الآن", ctaLogin: "سجّل الدخول واحجز",
    bookTitle: "حجز باقة البداية", bookLead: "يرجى التحقق من بياناتك. نستخدم المهن والمنطقة التي تفضّلها كاقتراح للبحث عن وظيفة.",
    phone: "الهاتف / واتساب للأسئلة حول مستنداتك", jobs: "المهن المرغوبة", regions: "المنطقة المفضلة في ألمانيا (اختياري)", notes: "هل هناك شيء آخر يجب أن نعرفه؟ (اختياري)",
    terms: "أوافق على الشروط العامة وقرأت سياسة الخصوصية.",
    waiver: "أريد أن تبدأ WoYou فورًا وأن تُفعّل الأداة مباشرة. أعلم أنني إذا انسحبت أدفع بشكل نسبي مقابل ما قُدّم حتى ذلك الحين، وأن حقي في الانسحاب ينتهي عندما تُقدَّم الخدمة كاملة.",
    submit: "حجز ملزم بالدفع", submitNoPay: "إرسال طلب ملزم", summary: `باقة البداية · المستندات و${arMonths(months)} من الأداة`,
    thanksTitle: "شكرًا على حجزك!",
    thanksPaid: "وصلنا دفعك. تم تفعيل أداة التقديم.",
    thanksRequested: "وصلنا طلبك. سنتواصل معك خلال يومَي عمل ونرسل لك رابط الدفع.",
    thanksMappe: "ابدأ بملف التقديم: ارفع سيرتك الذاتية أو املأ بياناتك. نراجع كل شيء ونخبرك عندما تصبح مستنداتك جاهزة.",
    toMappe: "إلى ملف التقديم", toProfile: "إلى حسابي", failed: "لم ينجح الحجز. يرجى المحاولة مرة أخرى.", alreadyBooked: "لقد حجزت باقة البداية بالفعل.",
  };
  // Übersetzung bitte von Muttersprachler:in prüfen lassen (Hindi)
  if (lang === "hi") return {
    badge: "आवेदन दस्तावेज़ और टूल",
    title: "जर्मन मानक के अनुसार आपके आवेदन दस्तावेज़। और एक टूल, जिससे आप ख़ुद आवेदन करते हैं।",
    lead: "हम जर्मन मानक के अनुसार आपके आवेदन दस्तावेज़ बनाते हैं और आपको एक टूल देते हैं, जिससे आप उपयुक्त नौकरियाँ ढूँढते हैं और ख़ुद आवेदन करते हैं। कहाँ आवेदन करना है, यह आप तय करते हैं, और सभी जवाब सीधे आपको मिलते हैं।",
    priceNote: `एक बार का भुगतान · ${months} महीने का आवेदन टूल शामिल · उसके बाद ${month} प्रति माह या सदस्यता में ${abo} प्रति माह`,
    cta: "अभी बुक करें", ctaLogin: "लॉग इन करें और बुक करें",
    bookTitle: "स्टार्टर पैकेज बुक करें", bookLead: "कृपया अपनी जानकारी जाँच लें। आपके पसंदीदा पेशे और क्षेत्र को हम आपकी नौकरी खोज के सुझाव के रूप में इस्तेमाल करते हैं।",
    phone: "आपके दस्तावेज़ों के बारे में सवालों के लिए फ़ोन / WhatsApp", jobs: "पसंदीदा पेशे", regions: "जर्मनी में पसंदीदा क्षेत्र (वैकल्पिक)", notes: "कुछ और जो हमें जानना चाहिए? (वैकल्पिक)",
    terms: "मैं नियम और शर्तें स्वीकार करता/करती हूँ और मैंने गोपनीयता नीति पढ़ ली है।",
    waiver: "मैं चाहता/चाहती हूँ कि WoYou तुरंत शुरू करे और टूल अभी चालू कर दे। मुझे पता है कि अनुबंध वापस लेने पर मुझे तब तक दी गई सेवाओं का अनुपात में भुगतान करना होगा, और सेवा पूरी तरह दिए जाने पर वापसी का मेरा अधिकार ख़त्म हो जाता है।",
    submit: "भुगतान के साथ बुक करें", submitNoPay: "पक्का अनुरोध भेजें", summary: `स्टार्टर पैकेज · दस्तावेज़ और ${months} महीने का टूल`,
    thanksTitle: "बुकिंग के लिए धन्यवाद!",
    thanksPaid: "आपका भुगतान मिल गया है। आपका आवेदन टूल चालू हो गया है।",
    thanksRequested: "आपका अनुरोध हमें मिल गया है। हम अगले 2 कार्यदिवसों में आपसे संपर्क करेंगे और भुगतान का लिंक भेजेंगे।",
    thanksMappe: "सबसे पहले अपनी आवेदन फ़ाइल से शुरू करें: अपना बायोडाटा अपलोड करें या अपनी जानकारी भरें। हम सब कुछ जाँचते हैं और दस्तावेज़ तैयार होने पर आपको बताते हैं।",
    toMappe: "मेरी आवेदन फ़ाइल पर जाएँ", toProfile: "मेरे खाते पर जाएँ", failed: "बुकिंग नहीं हो पाई। कृपया फिर से कोशिश करें।", alreadyBooked: "आप स्टार्टर पैकेज पहले ही बुक कर चुके हैं।",
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
  return build(locale === "de" || locale === "fr" || locale === "ar" || locale === "hi" ? locale : "en");
}
