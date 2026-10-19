// Startseite nach dem Konzept „Ehrlichkeit als Verkaufsargument“ (Entwurf v2, 18.10.2026):
// Versprechen und Grenze im selben Blick, „Bitte beachte“ direkt beim Preis, realistische Erwartung, Selbstcheck.
export type Lang = "de" | "en" | "fr" | "ar";

type Landing = {
  badge: string; h1: string; sub: string; ctaStart: string; ctaCheck: string; trust: string[]; trustNote: string;
  priceTitle: string; priceNote: string; ctaLogin: string; register: string;
  careTitle: string; care: string[]; careStrong: string;
  doTitle: string; doYes: string; doNo: string; yes: string[]; no: string[];
  realTitle: string; real: { n: string; t: string; d: string }[];
  checkTitle: string; checkLead: string; checkBtn: string;
  sampleTitle: string; sampleLead: string; sampleCv: string; sampleLetter: string; sampleNote: string;
  stepsTitle: string; steps: { t: string; d: string }[];
  faqTitle: string; faq: { q: string; a: string }[];
  facts: string[];
  jobs: string[];
};

export const LANDING: Record<Lang, Landing> = {
  de: {
    badge: "BEWERBUNG",
    h1: "Wir bewerben dich in Deutschland – ehrlich, für 199 €",
    sub: "Lebenslauf nach deutschem Standard, 25 realistische Stellen, Versand in deinem Namen. Ob ein Arbeitgeber dich einlädt, entscheidet er – nicht wir.",
    ctaStart: "Jetzt starten · 199 €", ctaCheck: "Erst Selbstcheck",
    trust: ["Keine Vermittlung", "Keine Garantie", "Keine versteckten Kosten"],
    trustNote: "Keine Jobgarantie – aber ein ehrlicher Start.",
    priceTitle: "Bewerbungs-Service · 25 Bewerbungen", priceNote: "einmalig · danach 25 weitere für 149 € oder unbegrenzt für 50 € im Monat",
    ctaLogin: "Anmelden und buchen", register: "Noch kein Konto? Kostenlos registrieren",
    careTitle: "Bitte beachte trotzdem",
    care: [
      "Für eine Beschäftigung in Deutschland sind anerkannte Qualifikationen und Sprachkenntnisse nötig. Darum kümmern wir uns nicht.",
      "Wir sorgen dafür, dass du dich bestmöglich präsentierst – ob ein Arbeitgeber dich einstellt, entscheidet er allein.",
      "Die Statistik sagt: 2 von 20 Bewerbenden aus dem Ausland bekommen eine Stelle. Du weißt das jetzt – vor der Buchung.",
    ],
    careStrong: "Wenn dir das zu unsicher ist: Buche nicht. Das ist in Ordnung.",
    doTitle: "Klar, was du bekommst – und was nicht", doYes: "Das machen wir", doNo: "Das machen wir nicht",
    yes: [
      "Wir prüfen deine Unterlagen und bringen sie auf deutschen Standard",
      "Wir schreiben Lebenslauf und Anschreiben auf Deutsch",
      "Wir recherchieren 25 aktuelle, realistische Stellen zu deinem Profil",
      "Wir verschicken die Bewerbungen in deinem Namen",
      "Wir zeigen dir die Quellen, damit du dich danach selbst bewerben kannst",
      "Wir sagen dir ehrlich, wenn dein Profil aktuell keine Chance hat",
    ],
    no: [
      "Wir vermitteln keine Jobs",
      "Wir sind keine Vermittlungsagentur und kein Makler",
      "Wir garantieren keine Stelle, kein Gespräch, keine Antwort",
      "Wir beschaffen kein Visum und keine Berufsanerkennung",
      "Wir beeinflussen keine Entscheidung von Arbeitgeber oder Behörde",
    ],
    realTitle: "Was du realistisch bekommst",
    real: [
      { n: "25", t: "echte Stellen statt leerer Versprechen", d: "Aktuell, zu deinem Beruf, mit Quelle." },
      { n: "1", t: "Bewerbung, die nicht sofort aussortiert wird", d: "Deutscher Standard, auf Deutsch, pro Stelle angepasst." },
      { n: "4", t: "Wochen bis Klarheit", d: "Statt Hoffnung über Monate: Du siehst jeden Stand." },
      { n: "∞", t: "Wissen, wo und wie man sich bewirbt", d: "Du kennst danach die Portale und kannst selbst weitermachen. Deine Unterlagen kannst du jederzeit herunterladen." },
    ],
    checkTitle: "Passt WoYou zu dir?", checkLead: "60 Sekunden, kostenlos. Wir sagen dir vorher ehrlich, ob sich eine Buchung für dein Profil lohnt.", checkBtn: "Zum Selbstcheck",
    sampleTitle: "So sieht deine Bewerbung aus", sampleLead: "Ruhig, sachlich, nach deutschem Standard. Kein Schnickschnack, keine Floskeln.", sampleCv: "Muster-Lebenslauf", sampleLetter: "Muster-Anschreiben", sampleNote: "Muster mit erfundener Person",
    stepsTitle: "So läuft es ab",
    steps: [
      { t: "Selbstcheck", d: "kostenlos, 60 Sekunden" },
      { t: "Buchen", d: "199 €, online" },
      { t: "Erstgespräch", d: "per Telefon oder Video" },
      { t: "Bewerbungen", d: "25 in 4 Wochen" },
      { t: "Antworten", d: "Stand in deinem Profil" },
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Wie hoch ist meine Chance auf eine Stelle?", a: "Die Statistik sagt: 2 von 20 Bewerbenden aus dem Ausland bekommen eine Stelle. Wir erhöhen die Qualität deiner Bewerbung – die Kriterien der Arbeitgeber bleiben." },
      { q: "Warum gebt ihr keine Garantie?", a: "Weil niemand sie geben kann. Wer dir eine Stelle garantiert, verkauft Hoffnung. Wir verkaufen Arbeit, die wir wirklich leisten." },
      { q: "Bekomme ich mein Geld zurück, wenn es nicht klappt?", a: "Nein. Du bezahlst für 25 recherchierte und versendete Bewerbungen – die bekommst du immer. Finden wir keine 25 Stellen, erstatten wir anteilig." },
      { q: "Kommen noch weitere Kosten dazu?", a: "Das Startpaket kostet einmalig 199 € und enthält 25 Bewerbungen. Danach entscheidest du selbst: 25 weitere für 149 € oder unbegrenzt für 50 € im Monat, jederzeit zum Monatsende kündbar. Versteckte Gebühren gibt es nicht." },
      { q: "In welchen Berufen bewerbt ihr mich?", a: "In den Berufen, die du im Erstgespräch mit uns festlegst, passend zu deiner Ausbildung und Erfahrung." },
      { q: "Darf ich meine Unterlagen selbst nutzen?", a: "Ja. Lebenslauf und Anschreiben-Vorlage kannst du jederzeit herunterladen und auch für eigene Bewerbungen verwenden." },
      { q: "Wie bezahle ich?", a: "Sicher online mit Karte über unseren Zahlungsanbieter Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Server in Deutschland", "Zahlung über Stripe", "Persönliche Ansprechperson"],
    jobs: ["Pflege", "Gastronomie", "Handwerk", "Büro", "Technik"],
  },
  en: {
    badge: "APPLICATION",
    h1: "We apply for you in Germany – honestly, for €199",
    sub: "A CV to German standards, 25 realistic jobs, applications sent in your name. Whether an employer invites you is their decision – not ours.",
    ctaStart: "Start now · €199", ctaCheck: "Self-check first",
    trust: ["No placement", "No guarantee", "No hidden costs"],
    trustNote: "No job guarantee – but an honest start.",
    priceTitle: "Application service · 25 applications", priceNote: "one-time · then 25 more for €149 or unlimited for €50 a month",
    ctaLogin: "Log in and book", register: "No account yet? Register for free",
    careTitle: "Please note",
    care: [
      "To work in Germany you need recognised qualifications and language skills. We do not take care of that.",
      "We make sure you present yourself as well as possible – whether an employer hires you is their decision alone.",
      "The statistics say: 2 out of 20 applicants from abroad get a job. Now you know – before you book.",
    ],
    careStrong: "If that feels too uncertain: don't book. That's okay.",
    doTitle: "Clear about what you get – and what you don't", doYes: "What we do", doNo: "What we don't do",
    yes: [
      "We check your documents and bring them up to German standards",
      "We write your CV and cover letter in German",
      "We research 25 current, realistic jobs for your profile",
      "We send the applications in your name",
      "We show you the sources so you can keep applying yourself",
      "We tell you honestly if your profile has no chance right now",
    ],
    no: [
      "We do not place you in jobs",
      "We are not a placement agency or broker",
      "We do not guarantee a job, an interview or a reply",
      "We do not obtain visas or recognition of qualifications",
      "We do not influence decisions of employers or authorities",
    ],
    realTitle: "What you realistically get",
    real: [
      { n: "25", t: "real jobs instead of empty promises", d: "Current, in your field, with source." },
      { n: "1", t: "application that is not rejected straight away", d: "German standard, in German, adapted for each job." },
      { n: "4", t: "weeks to clarity", d: "Instead of hoping for months: you see every step." },
      { n: "∞", t: "knowing where and how to apply", d: "You learn the job portals and can carry on yourself. You can download your documents at any time." },
    ],
    checkTitle: "Is WoYou right for you?", checkLead: "60 seconds, free. We tell you honestly beforehand whether booking makes sense for your profile.", checkBtn: "Go to self-check",
    sampleTitle: "This is what your application looks like", sampleLead: "Calm, factual, German standard. No frills, no empty phrases.", sampleCv: "Sample CV", sampleLetter: "Sample cover letter", sampleNote: "Sample with a fictional person",
    stepsTitle: "How it works",
    steps: [
      { t: "Self-check", d: "free, 60 seconds" },
      { t: "Book", d: "€199, online" },
      { t: "First call", d: "by phone or video" },
      { t: "Applications", d: "25 in 4 weeks" },
      { t: "Replies", d: "status in your profile" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "How good is my chance of getting a job?", a: "The statistics say: 2 out of 20 applicants from abroad get a job. We raise the quality of your application – employers' criteria stay the same." },
      { q: "Why don't you give a guarantee?", a: "Because nobody can. Whoever guarantees you a job is selling hope. We sell work we actually do." },
      { q: "Do I get my money back if it doesn't work out?", a: "No. You pay for 25 researched and sent applications – you always get those. If we cannot find 25 jobs, we refund proportionally." },
      { q: "Are there any extra costs?", a: "The starter package costs €199 once and includes 25 applications. After that you decide: 25 more for €149 or unlimited for €50 a month, cancellable at the end of any month. No hidden fees." },
      { q: "For which jobs do you apply?", a: "For the jobs we agree on in the first call, based on your training and experience." },
      { q: "May I use my documents myself?", a: "Yes. You can download your CV and cover letter template at any time and use them for your own applications too." },
      { q: "How do I pay?", a: "Securely online by card through our payment provider Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Servers in Germany", "Payment via Stripe", "Personal contact person"],
    jobs: ["Care", "Hospitality", "Trades", "Office", "Technical"],
  },
  fr: {
    badge: "CANDIDATURE",
    h1: "Nous postulons pour vous en Allemagne – honnêtement, pour 199 €",
    sub: "Un CV aux normes allemandes, 25 offres réalistes, des candidatures envoyées en votre nom. Que l'employeur vous invite, c'est lui qui décide – pas nous.",
    ctaStart: "Commencer · 199 €", ctaCheck: "D'abord l'auto-test",
    trust: ["Pas de placement", "Pas de garantie", "Pas de frais cachés"],
    trustNote: "Pas de garantie d'emploi – mais un départ honnête.",
    priceTitle: "Service de candidature · 25 candidatures", priceNote: "paiement unique · ensuite 25 de plus pour 149 € ou illimité pour 50 € par mois",
    ctaLogin: "Se connecter et réserver", register: "Pas encore de compte ? Inscription gratuite",
    careTitle: "À noter malgré tout",
    care: [
      "Pour travailler en Allemagne, il faut des qualifications reconnues et des connaissances linguistiques. Nous ne nous en occupons pas.",
      "Nous veillons à ce que vous vous présentiez au mieux – c'est l'employeur seul qui décide de vous embaucher.",
      "Les statistiques disent : 2 candidats sur 20 venant de l'étranger obtiennent un poste. Vous le savez maintenant – avant de réserver.",
    ],
    careStrong: "Si c'est trop incertain pour vous : ne réservez pas. C'est tout à fait correct.",
    doTitle: "Clair sur ce que vous obtenez – et ce que vous n'obtenez pas", doYes: "Ce que nous faisons", doNo: "Ce que nous ne faisons pas",
    yes: [
      "Nous vérifions vos documents et les mettons aux normes allemandes",
      "Nous rédigeons CV et lettre de motivation en allemand",
      "Nous recherchons 25 offres actuelles et réalistes pour votre profil",
      "Nous envoyons les candidatures en votre nom",
      "Nous vous montrons les sources pour que vous puissiez continuer seul",
      "Nous vous disons honnêtement si votre profil n'a pas de chance actuellement",
    ],
    no: [
      "Nous ne plaçons pas de candidats",
      "Nous ne sommes ni agence de placement ni intermédiaire",
      "Nous ne garantissons ni poste, ni entretien, ni réponse",
      "Nous ne nous occupons ni de visa ni de reconnaissance des diplômes",
      "Nous n'influençons aucune décision d'employeur ou d'administration",
    ],
    realTitle: "Ce que vous obtenez réellement",
    real: [
      { n: "25", t: "vraies offres au lieu de promesses vides", d: "Actuelles, dans votre métier, avec la source." },
      { n: "1", t: "candidature qui n'est pas écartée d'emblée", d: "Normes allemandes, en allemand, adaptée à chaque offre." },
      { n: "4", t: "semaines pour y voir clair", d: "Au lieu d'espérer pendant des mois : vous voyez chaque étape." },
      { n: "∞", t: "savoir où et comment postuler", d: "Vous connaissez ensuite les portails et pouvez continuer seul. Vos documents sont téléchargeables à tout moment." },
    ],
    checkTitle: "WoYou vous convient-il ?", checkLead: "60 secondes, gratuit. Nous vous disons honnêtement à l'avance si une réservation vaut la peine pour votre profil.", checkBtn: "Faire l'auto-test",
    sampleTitle: "Voici à quoi ressemble votre candidature", sampleLead: "Sobre, factuelle, aux normes allemandes. Sans fioritures ni formules creuses.", sampleCv: "CV modèle", sampleLetter: "Lettre modèle", sampleNote: "Modèle avec une personne fictive",
    stepsTitle: "Déroulement",
    steps: [
      { t: "Auto-test", d: "gratuit, 60 secondes" },
      { t: "Réserver", d: "199 €, en ligne" },
      { t: "Premier entretien", d: "par téléphone ou vidéo" },
      { t: "Candidatures", d: "25 en 4 semaines" },
      { t: "Réponses", d: "suivi dans votre profil" },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Quelle est ma chance d'obtenir un poste ?", a: "Les statistiques disent : 2 candidats sur 20 venant de l'étranger obtiennent un poste. Nous améliorons la qualité de votre candidature – les critères des employeurs restent les mêmes." },
      { q: "Pourquoi ne donnez-vous pas de garantie ?", a: "Parce que personne ne peut la donner. Celui qui vous garantit un poste vend de l'espoir. Nous vendons un travail que nous faisons vraiment." },
      { q: "Suis-je remboursé si cela ne marche pas ?", a: "Non. Vous payez pour 25 candidatures recherchées et envoyées – vous les recevez toujours. Si nous ne trouvons pas 25 offres, nous remboursons au prorata." },
      { q: "Y a-t-il d'autres frais ?", a: "Le pack de départ coûte 199 € une seule fois et comprend 25 candidatures. Ensuite, vous choisissez : 25 de plus pour 149 € ou illimité pour 50 € par mois, résiliable à la fin de chaque mois. Aucun frais caché." },
      { q: "Pour quels métiers postulez-vous ?", a: "Pour les métiers que nous définissons ensemble lors du premier entretien, selon votre formation et votre expérience." },
      { q: "Puis-je utiliser mes documents moi-même ?", a: "Oui. Vous pouvez télécharger votre CV et le modèle de lettre à tout moment et les utiliser pour vos propres candidatures." },
      { q: "Comment payer ?", a: "En ligne par carte, de façon sécurisée, via notre prestataire de paiement Stripe." },
    ],
    facts: ["KarriereKind GmbH, Düsseldorf", "Serveurs en Allemagne", "Paiement via Stripe", "Interlocuteur personnel"],
    jobs: ["Soins", "Restauration", "Artisanat", "Bureau", "Technique"],
  },
  ar: {
    badge: "التقديم",
    h1: "نقدّم طلباتك في ألمانيا – بصدق، مقابل 199 €",
    sub: "سيرة ذاتية بالمعايير الألمانية، 25 وظيفة واقعية، وإرسال الطلبات باسمك. أما دعوتك للمقابلة فقرار صاحب العمل – لا قرارنا.",
    ctaStart: "ابدأ الآن · 199 €", ctaCheck: "الاختبار الذاتي أولًا",
    trust: ["لا وساطة توظيف", "لا ضمان", "لا تكاليف مخفية"],
    trustNote: "لا ضمان للوظيفة – لكن بداية صادقة.",
    priceTitle: "خدمة التقديم · 25 طلبًا", priceNote: "دفعة واحدة · بعدها 25 طلبًا إضافيًا مقابل 149 € أو عدد غير محدود مقابل 50 € شهريًا",
    ctaLogin: "سجّل الدخول واحجز", register: "ليس لديك حساب؟ سجّل مجانًا",
    careTitle: "يرجى الانتباه",
    care: [
      "للعمل في ألمانيا تحتاج إلى مؤهلات معترف بها ومعرفة باللغة. نحن لا نتولى ذلك.",
      "نحرص على أن تقدّم نفسك بأفضل صورة – أما التوظيف فقرار صاحب العمل وحده.",
      "تقول الإحصاءات: 2 من كل 20 متقدمًا من الخارج يحصلون على وظيفة. الآن تعرف ذلك – قبل الحجز.",
    ],
    careStrong: "إذا كان ذلك غير مؤكد بالنسبة لك: لا تحجز. لا بأس بذلك.",
    doTitle: "بوضوح: ما تحصل عليه وما لا تحصل عليه", doYes: "ما نقوم به", doNo: "ما لا نقوم به",
    yes: [
      "نراجع مستنداتك ونرفعها إلى المعايير الألمانية",
      "نكتب السيرة الذاتية ورسالة التحفيز بالألمانية",
      "نبحث عن 25 وظيفة حالية وواقعية تناسب ملفك",
      "نرسل الطلبات باسمك",
      "نريك المصادر لتتمكن بعدها من التقديم بنفسك",
      "نخبرك بصدق إذا لم تكن لملفك فرصة حاليًا",
    ],
    no: [
      "لا نتوسط في التوظيف",
      "لسنا وكالة توظيف ولا وسيطًا",
      "لا نضمن وظيفة ولا مقابلة ولا ردًا",
      "لا نستخرج تأشيرات ولا معادلة شهادات",
      "لا نؤثر في قرارات أصحاب العمل أو الجهات الرسمية",
    ],
    realTitle: "ما تحصل عليه واقعيًا",
    real: [
      { n: "25", t: "وظيفة حقيقية بدل وعود فارغة", d: "حالية، في مجالك، مع المصدر." },
      { n: "1", t: "طلب لا يُستبعد فورًا", d: "بالمعايير الألمانية، بالألمانية، ومعدّل لكل وظيفة." },
      { n: "4", t: "أسابيع حتى تتضح الصورة", d: "بدل الانتظار لأشهر: ترى كل مرحلة." },
      { n: "∞", t: "معرفة أين وكيف تتقدم", d: "تتعرف على المنصات وتستطيع المتابعة بنفسك. يمكنك تحميل مستنداتك في أي وقت." },
    ],
    checkTitle: "هل تناسبك WoYou؟", checkLead: "60 ثانية، مجانًا. نخبرك بصدق مسبقًا إن كان الحجز مفيدًا لملفك.", checkBtn: "إلى الاختبار الذاتي",
    sampleTitle: "هكذا يبدو طلبك", sampleLead: "هادئ وموضوعي وبالمعايير الألمانية. بلا زخرفة ولا عبارات فارغة.", sampleCv: "نموذج سيرة ذاتية", sampleLetter: "نموذج رسالة تحفيز", sampleNote: "نموذج لشخص خيالي",
    stepsTitle: "طريقة العمل",
    steps: [
      { t: "الاختبار الذاتي", d: "مجانًا، 60 ثانية" },
      { t: "الحجز", d: "199 €، عبر الإنترنت" },
      { t: "المكالمة الأولى", d: "بالهاتف أو الفيديو" },
      { t: "الطلبات", d: "25 خلال 4 أسابيع" },
      { t: "الردود", d: "المتابعة في ملفك" },
    ],
    faqTitle: "أسئلة شائعة",
    faq: [
      { q: "ما فرصتي في الحصول على وظيفة؟", a: "تقول الإحصاءات: 2 من كل 20 متقدمًا من الخارج يحصلون على وظيفة. نحن نرفع جودة طلبك – أما معايير أصحاب العمل فتبقى كما هي." },
      { q: "لماذا لا تقدمون ضمانًا؟", a: "لأن أحدًا لا يستطيع ذلك. من يضمن لك وظيفة يبيعك الأمل. نحن نبيع عملًا نقوم به فعلًا." },
      { q: "هل أسترد أموالي إذا لم ينجح الأمر؟", a: "لا. أنت تدفع مقابل 25 طلبًا مبحوثًا ومرسلًا – وتحصل عليها دائمًا. إذا لم نجد 25 وظيفة، نعيد المبلغ بشكل نسبي." },
      { q: "هل هناك تكاليف إضافية؟", a: "باقة البداية بـ 199 € مرة واحدة وتشمل 25 طلبًا. بعدها تختار: 25 طلبًا إضافيًا مقابل 149 € أو عددًا غير محدود مقابل 50 € شهريًا، مع إمكانية الإلغاء في نهاية كل شهر. لا توجد رسوم مخفية." },
      { q: "في أي مهن تقدّمون عني؟", a: "في المهن التي نحددها معًا في المكالمة الأولى حسب تكوينك وخبرتك." },
      { q: "هل يمكنني استخدام مستنداتي بنفسي؟", a: "نعم. يمكنك تحميل سيرتك الذاتية ونموذج رسالة التحفيز في أي وقت واستخدامهما في طلباتك الخاصة." },
      { q: "كيف أدفع؟", a: "عبر الإنترنت بالبطاقة وبشكل آمن من خلال مزوّد الدفع Stripe." },
    ],
    facts: ["KarriereKind GmbH، دوسلدورف", "خوادم في ألمانيا", "الدفع عبر Stripe", "شخص مسؤول عنك"],
    jobs: ["الرعاية", "المطاعم", "الحِرف", "المكتب", "التقنية"],
  },
};

export const landingCopy = (locale: string) => LANDING[(locale in LANDING ? locale : "en") as Lang];

// Bildwelt (siehe BILDWELT.md): echte Menschen bei der Arbeit, fünf Berufe im Wechsel, freie Unsplash-Lizenz
const U = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;
export const IMAGES = {
  hero: [
    U("photo-1765896387387-0538bc9f997e"), // Pflege: Pflegekraft mit älterer Dame
    U("photo-1577219491135-ce391730fb2c"), // Gastronomie: Koch in der Küche
    U("photo-1646640381839-02748ae8ddf0"), // Handwerk: Handwerker mit Bohrmaschine
    U("photo-1758876202618-7197443c717f"), // Büro: Kollegin am Arbeitsplatz
    U("photo-1621905251189-08b45d6a269e"), // Technik: Elektriker mit Helm
  ],
  talk: U("photo-1573497620053-ea5300f94f21", 900), // Erstgespräch
  papers: U("photo-1698047681432-006d2449c631", 900), // Unterlagen in der Hand
};
