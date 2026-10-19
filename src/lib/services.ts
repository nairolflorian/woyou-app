// Zusatz-Services, die Bewerber:innen buchen können. Preis/Umfang zentral hier ändern –
// Angebotsseite, Buchung, Stripe-Checkout und Mails lesen alles von hier.

export type ServiceKey = "bewerbung-25";

export const SERVICES: Record<ServiceKey, { priceCents: number; applications: number; deliveryWeeks: number }> = {
  "bewerbung-25": { priceCents: 19900, applications: 25, deliveryWeeks: 4 },
};

// Nachkauf und Abo (Guthaben, siehe src/lib/credits.ts)
export type CreditKind = "PACK_25" | "SUBSCRIPTION";
export const CREDIT_PRODUCTS: Record<CreditKind, { name: string; priceCents: number; credits: number }> = {
  PACK_25: { name: "25 weitere Bewerbungen", priceCents: 14900, credits: 25 },
  SUBSCRIPTION: { name: "Unbegrenzt bewerben (Abo)", priceCents: 5000, credits: 0 },
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

export function formatPrice(cents: number, locale = "de") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

// ---------- Texte der Angebotsseite (DE/FR/EN/AR; ES/RU/UK fallen auf EN zurück) ----------
type Copy = {
  badge: string; title: string; lead: string; priceNote: string; cta: string; ctaLogin: string;
  includedTitle: string; included: string[];
  stepsTitle: string; steps: { t: string; d: string }[];
  goodTitle: string; good: string[];
  faqTitle: string; faq: { q: string; a: string }[];
  bookTitle: string; bookLead: string; phone: string; jobs: string; regions: string; notes: string;
  terms: string; waiver: string; consent: string; submit: string; submitNoPay: string; summary: string;
  thanksTitle: string; thanksPaid: string; thanksRequested: string; toProfile: string;
};

export const SERVICE_COPY: Record<"de" | "fr" | "en" | "ar" | "hi", Copy> = {
  de: {
    badge: "BEWERBUNGS-SERVICE",
    title: "Wir bewerben dich in Deutschland. Ehrlich, für 199 €.",
    lead: "Wir bringen deinen Lebenslauf auf deutschen Standard, suchen 25 Stellen, die zu dir passen können, und schicken die Bewerbungen in deinem Namen ab. Ob dich ein Arbeitgeber einlädt, entscheidet er. Nicht wir.",
    priceNote: "einmalig · danach 25 weitere für 149 € oder unbegrenzt für 50 € im Monat",
    cta: "Jetzt buchen", ctaLogin: "Anmelden und buchen",
    includedTitle: "Das ist enthalten",
    included: [
      "Persönliches Erstgespräch per Telefon, WhatsApp oder Video",
      "Dein Lebenslauf nach deutschem Standard, auf Deutsch",
      "Ein passendes Anschreiben für jede Stelle",
      "Wir suchen 25 realistische Stellen für dich",
      "Wir verschicken alle 25 Bewerbungen in deinem Namen",
      "Übersicht in deinem Profil: wann, an wen, welcher Stand",
      "Hilfe bei Antworten und Einladungen zum Vorstellungsgespräch",
    ],
    stepsTitle: "So läuft es ab",
    steps: [
      { t: "Buchen", d: "Du buchst den Service in deinem WoYou-Profil und bezahlst sicher online." },
      { t: "Erstgespräch", d: "Wir sprechen über deinen Beruf, deine Erfahrung und wo du arbeiten möchtest." },
      { t: "Bewerbungen", d: "Wir erstellen deine Unterlagen und verschicken 25 Bewerbungen innerhalb von 4 Wochen." },
      { t: "Antworten", d: "Du siehst jeden Stand in deinem Profil. Bei Rückmeldungen helfen wir dir weiter." },
    ],
    goodTitle: "Gut zu wissen",
    good: [
      "Wir können keine Zusage garantieren. Die Entscheidung trifft immer der Arbeitgeber.",
      "Je besser dein Deutsch und je vollständiger dein Profil, desto mehr Stellen kommen in Frage.",
      "Bitte lade deine Zeugnisse und Nachweise in deinem Profil hoch.",
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Kommen noch weitere Kosten dazu?", a: "Das Startpaket kostet einmalig 199 € und enthält 25 Bewerbungen. Danach entscheidest du selbst: 25 weitere für 149 € oder unbegrenzt für 50 € im Monat, jederzeit zum Monatsende kündbar. Versteckte Gebühren gibt es nicht." },
      { q: "Was ist, wenn es keine 25 realistischen Stellen gibt?", a: "Dann melden wir uns bei dir und besprechen gemeinsam, wie wir die Suche erweitern." },
      { q: "In welchen Berufen bewerbt ihr mich?", a: "In den Berufen, die du im Erstgespräch mit uns festlegst, passend zu deiner Ausbildung und Erfahrung." },
      { q: "Wie bezahle ich?", a: "Sicher online mit Karte über unseren Zahlungsanbieter Stripe." },
    ],
    bookTitle: "Bewerbungs-Service buchen", bookLead: "Prüfe kurz deine Angaben. Im Erstgespräch klären wir alles Weitere.",
    phone: "Telefon / WhatsApp für das Erstgespräch", jobs: "Gewünschte Berufe", regions: "Wunschregion in Deutschland (optional)", notes: "Was sollen wir noch wissen? (optional)",
    terms: "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.",
    waiver: "Ich möchte, dass WoYou sofort mit der Leistung beginnt. Mir ist bekannt, dass mein Widerrufsrecht erlischt, sobald die Leistung vollständig erbracht ist.",
    consent: "Ich bevollmächtige WoYou, in meinem Namen Bewerbungen per E-Mail an Arbeitgeber zu senden. Ich bekomme von jeder Bewerbung eine Kopie.",
    submit: "Zahlungspflichtig buchen", submitNoPay: "Verbindlich anfragen", summary: "Bewerbungs-Service · 25 Bewerbungen",
    thanksTitle: "Danke für deine Buchung!",
    thanksPaid: "Deine Zahlung ist eingegangen. Wir melden uns in den nächsten 2 Werktagen für das Erstgespräch.",
    thanksRequested: "Deine Anfrage ist bei uns. Wir melden uns in den nächsten 2 Werktagen und schicken dir den Zahlungslink.",
    toProfile: "Zu meinem Profil",
  },
  fr: {
    badge: "SERVICE CANDIDATURES",
    title: "Nous postulons pour vous en Allemagne. Honnêtement, pour 199 €.",
    lead: "Nous mettons votre CV aux normes allemandes, cherchons 25 offres qui peuvent vous correspondre et envoyons les candidatures en votre nom. C'est l'employeur qui décide de vous inviter, pas nous.",
    priceNote: "paiement unique · ensuite 25 de plus pour 149 € ou illimité pour 50 € par mois",
    cta: "Réserver maintenant", ctaLogin: "Se connecter et réserver",
    includedTitle: "Ce qui est inclus",
    included: [
      "Un premier entretien personnel par téléphone, WhatsApp ou vidéo",
      "Votre CV au format allemand, en allemand",
      "Une lettre de motivation adaptée à chaque offre",
      "Nous trouvons 25 offres qui vous correspondent",
      "Nous envoyons les 25 candidatures en votre nom",
      "Un suivi dans votre profil : quand, à qui, quel statut",
      "De l'aide pour les réponses et les invitations à un entretien",
    ],
    stepsTitle: "Comment ça marche",
    steps: [
      { t: "Réserver", d: "Vous réservez le service dans votre profil WoYou et payez en ligne en toute sécurité." },
      { t: "Premier entretien", d: "Nous parlons de votre métier, de votre expérience et de la région où vous voulez travailler." },
      { t: "Candidatures", d: "Nous préparons vos documents et envoyons 25 candidatures en 4 semaines." },
      { t: "Réponses", d: "Vous suivez chaque étape dans votre profil. Nous vous aidons pour la suite." },
    ],
    goodTitle: "Bon à savoir",
    good: [
      "Nous ne pouvons pas garantir une embauche. La décision appartient toujours à l'employeur.",
      "Plus votre allemand est bon et votre profil complet, plus il y a d'offres possibles.",
      "Merci de télécharger vos diplômes et attestations dans votre profil.",
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Y a-t-il d'autres frais ?", a: "Le pack de départ coûte 199 € une seule fois et comprend 25 candidatures. Ensuite, vous choisissez : 25 de plus pour 149 € ou illimité pour 50 € par mois, résiliable à la fin de chaque mois. Aucun frais caché." },
      { q: "Et s'il n'y a pas 25 offres adaptées ?", a: "Nous vous contactons et décidons ensemble comment élargir la recherche." },
      { q: "Pour quels métiers postulez-vous ?", a: "Pour les métiers que nous définissons ensemble lors du premier entretien, selon votre formation et votre expérience." },
      { q: "Comment payer ?", a: "En ligne par carte, de façon sécurisée, via notre prestataire de paiement Stripe." },
    ],
    bookTitle: "Réserver le service candidatures", bookLead: "Vérifiez vos informations. Nous voyons le reste lors du premier entretien.",
    phone: "Téléphone / WhatsApp pour le premier entretien", jobs: "Métiers souhaités", regions: "Région souhaitée en Allemagne (facultatif)", notes: "Autre chose à nous dire ? (facultatif)",
    terms: "J'accepte les CGV et j'ai lu la politique de confidentialité.",
    waiver: "Je souhaite que WoYou commence la prestation immédiatement. Je sais que mon droit de rétractation prend fin dès que la prestation est entièrement réalisée.",
    consent: "J'autorise WoYou à envoyer des candidatures par e-mail aux employeurs en mon nom. Je reçois une copie de chaque candidature.",
    submit: "Réserver avec obligation de paiement", submitNoPay: "Envoyer la demande", summary: "Service candidatures · 25 candidatures",
    thanksTitle: "Merci pour votre réservation !",
    thanksPaid: "Votre paiement est bien reçu. Nous vous contactons dans les 2 jours ouvrés pour le premier entretien.",
    thanksRequested: "Votre demande est bien reçue. Nous vous contactons dans les 2 jours ouvrés et vous envoyons le lien de paiement.",
    toProfile: "Vers mon profil",
  },
  en: {
    badge: "APPLICATION SERVICE",
    title: "We apply for jobs in Germany for you. Honestly, for €199.",
    lead: "We bring your CV up to German standards, look for 25 jobs that could suit you and send the applications in your name. Whether an employer invites you is their decision, not ours.",
    priceNote: "one-time · then 25 more for €149 or unlimited for €50 a month",
    cta: "Book now", ctaLogin: "Log in and book",
    includedTitle: "What's included",
    included: [
      "Personal first call by phone, WhatsApp or video",
      "Your CV in German format, in German",
      "A matching cover letter for every job",
      "We find 25 jobs that fit you",
      "We send all 25 applications in your name",
      "Overview in your profile: when, to whom, which status",
      "Help with replies and interview invitations",
    ],
    stepsTitle: "How it works",
    steps: [
      { t: "Book", d: "Book the service in your WoYou profile and pay securely online." },
      { t: "First call", d: "We talk about your job, your experience and where you want to work." },
      { t: "Applications", d: "We prepare your documents and send 25 applications within 4 weeks." },
      { t: "Replies", d: "You see every step in your profile. We help you with the next steps." },
    ],
    goodTitle: "Good to know",
    good: [
      "We cannot guarantee a job offer. The employer always decides.",
      "The better your German and the more complete your profile, the more jobs are possible.",
      "Please upload your certificates and documents to your profile.",
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "Are there any extra costs?", a: "The starter package costs €199 once and includes 25 applications. After that you decide: 25 more for €149 or unlimited for €50 a month, cancellable at the end of any month. No hidden fees." },
      { q: "What if there are not 25 matching jobs?", a: "We contact you and decide together how to widen the search." },
      { q: "For which jobs do you apply?", a: "For the jobs we agree on in the first call, based on your training and experience." },
      { q: "How do I pay?", a: "Securely online by card through our payment provider Stripe." },
    ],
    bookTitle: "Book the application service", bookLead: "Please check your details. We clarify everything else in the first call.",
    phone: "Phone / WhatsApp for the first call", jobs: "Desired jobs", regions: "Preferred region in Germany (optional)", notes: "Anything else we should know? (optional)",
    terms: "I accept the terms and conditions and have read the privacy policy.",
    waiver: "I want WoYou to start the service immediately. I know that my right of withdrawal ends once the service has been fully provided.",
    consent: "I authorise WoYou to send applications to employers by email in my name. I receive a copy of every application.",
    submit: "Book with obligation to pay", submitNoPay: "Send request", summary: "Application service · 25 applications",
    thanksTitle: "Thank you for your booking!",
    thanksPaid: "We received your payment. We will contact you within 2 working days for the first call.",
    thanksRequested: "We received your request. We will contact you within 2 working days and send you the payment link.",
    toProfile: "Go to my profile",
  },
  ar: {
    badge: "خدمة التقديم",
    title: "نقدّم طلباتك للعمل في ألمانيا. بصدق، مقابل 199 €.",
    lead: "نجهّز سيرتك الذاتية بالمعايير الألمانية، ونبحث عن 25 وظيفة قد تناسبك، ونرسل الطلبات باسمك. أما دعوتك للمقابلة فقرار صاحب العمل، وليس قرارنا.",
    priceNote: "دفعة واحدة · بعدها 25 طلبًا إضافيًا مقابل 149 € أو عدد غير محدود مقابل 50 € شهريًا",
    cta: "احجز الآن", ctaLogin: "سجّل الدخول واحجز",
    includedTitle: "ما يشمله العرض",
    included: [
      "مكالمة أولى شخصية عبر الهاتف أو واتساب أو الفيديو",
      "سيرتك الذاتية بالنموذج الألماني وباللغة الألمانية",
      "رسالة تحفيزية مناسبة لكل وظيفة",
      "نبحث لك عن 25 وظيفة مناسبة",
      "نرسل الطلبات الـ25 باسمك",
      "متابعة في ملفك الشخصي: متى، لمن، وما هي الحالة",
      "مساعدة في الردود ودعوات المقابلات",
    ],
    stepsTitle: "كيف تسير العملية",
    steps: [
      { t: "الحجز", d: "تحجز الخدمة من ملفك في WoYou وتدفع عبر الإنترنت بأمان." },
      { t: "المكالمة الأولى", d: "نتحدث عن مهنتك وخبرتك والمكان الذي تريد العمل فيه." },
      { t: "الطلبات", d: "نجهّز ملفاتك ونرسل 25 طلبًا خلال 4 أسابيع." },
      { t: "الردود", d: "ترى كل مرحلة في ملفك الشخصي، ونساعدك في الخطوات التالية." },
    ],
    goodTitle: "معلومات مهمة",
    good: [
      "لا يمكننا ضمان القبول، فالقرار دائمًا لصاحب العمل.",
      "كلما كانت لغتك الألمانية أفضل وملفك مكتملًا، زادت الوظائف المناسبة.",
      "يرجى رفع شهاداتك ووثائقك في ملفك الشخصي.",
    ],
    faqTitle: "أسئلة شائعة",
    faq: [
      { q: "هل هناك تكاليف إضافية؟", a: "باقة البداية بـ 199 € مرة واحدة وتشمل 25 طلبًا. بعدها تختار: 25 طلبًا إضافيًا مقابل 149 € أو عددًا غير محدود مقابل 50 € شهريًا، مع إمكانية الإلغاء في نهاية كل شهر. لا توجد رسوم مخفية." },
      { q: "ماذا لو لم توجد 25 وظيفة مناسبة؟", a: "نتواصل معك ونقرر معًا كيف نوسّع البحث." },
      { q: "في أي مهن تقدّمون عني؟", a: "في المهن التي نحددها معًا في المكالمة الأولى حسب تكوينك وخبرتك." },
      { q: "كيف أدفع؟", a: "عبر الإنترنت بالبطاقة وبشكل آمن من خلال مزوّد الدفع Stripe." },
    ],
    bookTitle: "حجز خدمة التقديم", bookLead: "تحقّق من بياناتك. نوضح الباقي في المكالمة الأولى.",
    phone: "الهاتف / واتساب للمكالمة الأولى", jobs: "المهن المرغوبة", regions: "المنطقة المفضلة في ألمانيا (اختياري)", notes: "هل هناك شيء آخر يجب أن نعرفه؟ (اختياري)",
    terms: "أوافق على الشروط العامة وقرأت سياسة الخصوصية.",
    waiver: "أريد أن تبدأ WoYou الخدمة فورًا. أعلم أن حقي في الانسحاب ينتهي بمجرد تقديم الخدمة بالكامل.",
    consent: "أفوّض WoYou بإرسال طلبات التوظيف باسمي إلى أصحاب العمل عبر البريد الإلكتروني. أتلقى نسخة من كل طلب.",
    submit: "احجز مع الالتزام بالدفع", submitNoPay: "أرسل الطلب", summary: "خدمة التقديم · 25 طلبًا",
    thanksTitle: "شكرًا على حجزك!",
    thanksPaid: "وصلنا دفعك. سنتواصل معك خلال يومي عمل للمكالمة الأولى.",
    thanksRequested: "وصلنا طلبك. سنتواصل معك خلال يومي عمل ونرسل لك رابط الدفع.",
    toProfile: "إلى ملفي الشخصي",
  },
  hi: {
    badge: "आवेदन सेवा",
    title: "हम जर्मनी में आपके लिए आवेदन करते हैं। ईमानदारी से, 199 € में।",
    lead: "हम आपका बायोडाटा जर्मन मानक के अनुसार तैयार करते हैं, आपके लिए उपयुक्त हो सकने वाली 25 नौकरियाँ खोजते हैं और आपके नाम से आवेदन भेजते हैं। इंटरव्यू के लिए बुलाना है या नहीं, यह नियोक्ता तय करता है, हम नहीं।",
    priceNote: "एक बार · उसके बाद 25 और आवेदन 149 € में या असीमित 50 € प्रति माह",
    cta: "अभी बुक करें", ctaLogin: "लॉग इन करें और बुक करें",
    includedTitle: "इसमें शामिल है",
    included: ["फ़ोन, WhatsApp या वीडियो पर पहली बातचीत", "जर्मन मानक के अनुसार जर्मन में आपका बायोडाटा", "हर नौकरी के लिए अलग कवर लेटर", "आपके लिए 25 वास्तविक नौकरियाँ", "आपके नाम से सभी 25 आवेदन भेजना", "आपकी प्रोफ़ाइल में पूरी जानकारी: कब, किसे, क्या स्थिति"],
    stepsTitle: "प्रक्रिया कैसे चलती है",
    steps: [
      { t: "बुकिंग", d: "आप अपनी WoYou प्रोफ़ाइल में सेवा बुक करते हैं और ऑनलाइन सुरक्षित भुगतान करते हैं।" },
      { t: "पहली बातचीत", d: "हम आपके पेशे, अनुभव और काम करने की जगह के बारे में बात करते हैं।" },
      { t: "आवेदन", d: "हम आपके दस्तावेज़ तैयार करते हैं और 4 सप्ताह में 25 आवेदन भेजते हैं।" },
      { t: "जवाब", d: "आप अपनी प्रोफ़ाइल में हर स्थिति देख सकते हैं।" },
    ],
    goodTitle: "ध्यान रखें",
    good: ["हम नौकरी की गारंटी नहीं दे सकते। फ़ैसला हमेशा नियोक्ता करता है।", "आपकी जर्मन जितनी अच्छी और प्रोफ़ाइल जितनी पूरी होगी, उतनी ज़्यादा नौकरियाँ संभव हैं।", "कृपया अपने प्रमाणपत्र और दस्तावेज़ प्रोफ़ाइल में अपलोड करें।"],
    faqTitle: "सामान्य प्रश्न",
    faq: [
      { q: "क्या कोई और लागत है?", a: "शुरुआती पैकेज एक बार 199 € का है और इसमें 25 आवेदन शामिल हैं। उसके बाद 25 और आवेदन 149 € में या असीमित 50 € प्रति माह, जिसे हर महीने के अंत में रद्द किया जा सकता है।" },
      { q: "भुगतान कैसे करूँ?", a: "हमारे भुगतान प्रदाता Stripe के ज़रिए कार्ड से, ऑनलाइन और सुरक्षित।" },
    ],
    bookTitle: "आवेदन सेवा बुक करें", bookLead: "कृपया अपनी जानकारी जाँच लें। बाकी सब हम पहली बातचीत में तय करेंगे।",
    phone: "पहली बातचीत के लिए फ़ोन / WhatsApp", jobs: "इच्छित पेशे", regions: "जर्मनी में पसंदीदा क्षेत्र (वैकल्पिक)", notes: "हमें और क्या जानना चाहिए? (वैकल्पिक)",
    terms: "मैं नियम और शर्तें स्वीकार करता/करती हूँ और गोपनीयता नीति पढ़ ली है।",
    waiver: "मैं चाहता/चाहती हूँ कि WoYou सेवा तुरंत शुरू करे। मुझे पता है कि सेवा पूरी होने पर मेरा वापसी का अधिकार समाप्त हो जाता है।",
    consent: "मैं WoYou को अपने नाम से नियोक्ताओं को ईमेल द्वारा आवेदन भेजने की अनुमति देता/देती हूँ। हर आवेदन की एक प्रति मुझे मिलती है।",
    submit: "भुगतान के साथ बुक करें", submitNoPay: "अनुरोध भेजें", summary: "आवेदन सेवा · 25 आवेदन",
    thanksTitle: "बुकिंग के लिए धन्यवाद!",
    thanksPaid: "आपका भुगतान मिल गया है। पहली बातचीत के लिए हम 2 कार्यदिवसों में आपसे संपर्क करेंगे।",
    thanksRequested: "आपका अनुरोध मिल गया है। हम 2 कार्यदिवसों में संपर्क करेंगे और भुगतान का लिंक भेजेंगे।",
    toProfile: "मेरी प्रोफ़ाइल पर जाएँ",
  },
};

export function serviceCopy(locale: string): Copy {
  if (locale === "de" || locale === "fr" || locale === "ar" || locale === "hi") return SERVICE_COPY[locale];
  return SERVICE_COPY.en;
}
