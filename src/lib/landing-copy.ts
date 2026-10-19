// Startseite nach dem Konzept „Ehrlichkeit als Verkaufsargument“ (Entwurf v2, 18.10.2026):
// Versprechen und Grenze im selben Blick, „Bitte beachte“ direkt beim Preis, realistische Erwartung, Selbstcheck.
export type Lang = "de" | "en" | "fr" | "ar" | "hi";

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
    h1: "Wir bewerben dich in Deutschland. Ehrlich, für 199 €.",
    sub: "Wir bringen deinen Lebenslauf auf deutschen Standard, suchen 25 Stellen, die zu dir passen können, und schicken die Bewerbungen in deinem Namen ab. Ob dich ein Arbeitgeber einlädt, entscheidet er. Nicht wir.",
    ctaStart: "Jetzt starten · 199 €", ctaCheck: "Erst Selbstcheck",
    trust: ["Keine Vermittlung", "Keine Garantie", "Keine versteckten Kosten"],
    trustNote: "Eine Jobgarantie gibt es bei uns nicht. Dafür sagen wir dir vorher, woran du bist.",
    priceTitle: "Bewerbungs-Service · 25 Bewerbungen", priceNote: "einmalig · danach 25 weitere für 149 € oder unbegrenzt für 50 € im Monat",
    ctaLogin: "Anmelden und buchen", register: "Noch kein Konto? Kostenlos registrieren",
    careTitle: "Bitte beachte trotzdem",
    care: [
      "Für eine Beschäftigung in Deutschland sind anerkannte Qualifikationen und Sprachkenntnisse nötig. Darum kümmern wir uns nicht.",
      "Wir sorgen dafür, dass deine Bewerbung gut aussieht und vollständig ist. Ob dich jemand einstellt, entscheidet allein der Arbeitgeber.",
      "Zur Einordnung: Von 20 Menschen, die sich aus dem Ausland bewerben, bekommen im Schnitt etwa 2 eine Stelle. Das solltest du wissen, bevor du buchst.",
    ],
    careStrong: "Wenn dir das zu unsicher ist: Buche nicht. Das ist in Ordnung.",
    doTitle: "Was du bei uns bekommst und was nicht", doYes: "Das machen wir", doNo: "Das machen wir nicht",
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
      { n: "25", t: "aktuelle Stellen in deinem Beruf", d: "Jede mit Link zur Anzeige, damit du nachsehen kannst." },
      { n: "1", t: "Bewerbung, wie sie deutsche Firmen erwarten", d: "Auf Deutsch, sauber gestaltet und für jede Stelle angepasst." },
      { n: "4", t: "Wochen, bis alles verschickt ist", d: "In deinem Profil siehst du jederzeit, wo wir gerade stehen." },
      { n: "+", t: "Unterlagen, die dir gehören", d: "Lebenslauf und Anschreiben kannst du herunterladen und selbst weiter nutzen. Du weißt danach auch, auf welchen Seiten du suchen kannst." },
    ],
    checkTitle: "Passt WoYou zu dir?", checkLead: "Fünf kurze Fragen, kostenlos. Danach sagen wir dir offen, ob sich eine Buchung für dich lohnt.", checkBtn: "Zum Selbstcheck",
    sampleTitle: "So sieht deine Bewerbung aus", sampleLead: "So sehen Lebenslauf und Anschreiben aus, die wir für dich erstellen. Schlicht und gut lesbar, so wie Personalabteilungen es mögen.", sampleCv: "Muster-Lebenslauf", sampleLetter: "Muster-Anschreiben", sampleNote: "Muster mit erfundener Person",
    stepsTitle: "So läuft es ab",
    steps: [
      { t: "Selbstcheck", d: "kostenlos, dauert eine Minute" },
      { t: "Buchen", d: "199 €, online" },
      { t: "Erstgespräch", d: "per Telefon oder Video" },
      { t: "Bewerbungen", d: "25 in 4 Wochen" },
      { t: "Antworten", d: "Stand in deinem Profil" },
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Wie hoch ist meine Chance auf eine Stelle?", a: "Im Schnitt bekommen etwa 2 von 20 Menschen, die sich aus dem Ausland bewerben, bekommen eine Stelle. Wir machen deine Bewerbung so gut wie möglich. Was ein Arbeitgeber verlangt, können wir nicht ändern." },
      { q: "Warum gebt ihr keine Garantie?", a: "Weil das niemand ehrlich kann. Wer dir eine Stelle verspricht, verspricht etwas, das er nicht in der Hand hat. Wir verkaufen dir nur die Arbeit, die wir auch wirklich machen." },
      { q: "Bekomme ich mein Geld zurück, wenn es nicht klappt?", a: "Nein. Du bezahlst für 25 Bewerbungen, die wir heraussuchen und verschicken, und die bekommst du auch. Finden wir keine 25 Stellen, bekommst du für den Rest anteilig Geld zurück." },
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
    h1: "We apply for jobs in Germany for you. Honestly, for €199.",
    sub: "We bring your CV up to German standards, look for 25 jobs that could suit you and send the applications in your name. Whether an employer invites you is their decision, not ours.",
    ctaStart: "Start now · €199", ctaCheck: "Self-check first",
    trust: ["No placement", "No guarantee", "No hidden costs"],
    trustNote: "We cannot guarantee a job. But we tell you upfront where you stand.",
    priceTitle: "Application service · 25 applications", priceNote: "one-time · then 25 more for €149 or unlimited for €50 a month",
    ctaLogin: "Log in and book", register: "No account yet? Register for free",
    careTitle: "Please note",
    care: [
      "To work in Germany you need recognised qualifications and language skills. We do not take care of that.",
      "We make sure your application looks good and is complete. Whether someone hires you is up to the employer alone.",
      "For context: of 20 people applying from abroad, on average about 2 get a job. You should know that before you book.",
    ],
    careStrong: "If that feels too uncertain: don't book. That's okay.",
    doTitle: "What you get from us and what you don't", doYes: "What we do", doNo: "What we don't do",
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
      { n: "25", t: "current jobs in your field", d: "Each with a link to the advert so you can check it." },
      { n: "1", t: "application the way German companies expect it", d: "In German, cleanly designed and adapted for each job." },
      { n: "4", t: "weeks until everything is sent", d: "Your profile always shows where we are." },
      { n: "+", t: "documents that belong to you", d: "You can download your CV and cover letter and keep using them. You will also know which sites to search." },
    ],
    checkTitle: "Is WoYou right for you?", checkLead: "Five short questions, free. Then we tell you openly whether booking makes sense for you.", checkBtn: "Go to self-check",
    sampleTitle: "This is what your application looks like", sampleLead: "This is what the CV and cover letter we write for you look like. Simple and easy to read, the way HR departments like it.", sampleCv: "Sample CV", sampleLetter: "Sample cover letter", sampleNote: "Sample with a fictional person",
    stepsTitle: "How it works",
    steps: [
      { t: "Self-check", d: "free, takes a minute" },
      { t: "Book", d: "€199, online" },
      { t: "First call", d: "by phone or video" },
      { t: "Applications", d: "25 in 4 weeks" },
      { t: "Replies", d: "status in your profile" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "How good is my chance of getting a job?", a: "On average, about 2 out of 20 people applying from abroad get a job. We make your application as good as we can. What an employer requires is not something we can change." },
      { q: "Why don't you give a guarantee?", a: "Because nobody can honestly give one. Whoever promises you a job is promising something they do not control. We only sell you the work we actually do." },
      { q: "Do I get my money back if it doesn't work out?", a: "No. You pay for 25 applications that we find and send, and you get them. If we cannot find 25 jobs, you get a proportional refund for the rest." },
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
    h1: "Nous postulons pour vous en Allemagne. Honnêtement, pour 199 €.",
    sub: "Nous mettons votre CV aux normes allemandes, cherchons 25 offres qui peuvent vous correspondre et envoyons les candidatures en votre nom. C'est l'employeur qui décide de vous inviter, pas nous.",
    ctaStart: "Commencer · 199 €", ctaCheck: "D'abord l'auto-test",
    trust: ["Pas de placement", "Pas de garantie", "Pas de frais cachés"],
    trustNote: "Nous ne garantissons pas d'emploi. Mais nous vous disons dès le départ où vous en êtes.",
    priceTitle: "Service de candidature · 25 candidatures", priceNote: "paiement unique · ensuite 25 de plus pour 149 € ou illimité pour 50 € par mois",
    ctaLogin: "Se connecter et réserver", register: "Pas encore de compte ? Inscription gratuite",
    careTitle: "À noter malgré tout",
    care: [
      "Pour travailler en Allemagne, il faut des qualifications reconnues et des connaissances linguistiques. Nous ne nous en occupons pas.",
      "Nous veillons à ce que votre candidature soit soignée et complète. C'est l'employeur seul qui décide de vous embaucher.",
      "Pour situer : sur 20 personnes qui postulent depuis l'étranger, environ 2 obtiennent un poste en moyenne. Mieux vaut le savoir avant de réserver.",
    ],
    careStrong: "Si c'est trop incertain pour vous : ne réservez pas. C'est tout à fait correct.",
    doTitle: "Ce que vous obtenez chez nous et ce que vous n'obtenez pas", doYes: "Ce que nous faisons", doNo: "Ce que nous ne faisons pas",
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
      { n: "25", t: "offres actuelles dans votre métier", d: "Chacune avec le lien vers l'annonce, pour vérifier vous-même." },
      { n: "1", t: "candidature comme les entreprises allemandes l'attendent", d: "En allemand, soignée et adaptée à chaque offre." },
      { n: "4", t: "semaines jusqu'à l'envoi de tout", d: "Votre profil montre à tout moment où nous en sommes." },
      { n: "+", t: "des documents qui vous appartiennent", d: "Vous pouvez télécharger CV et lettre et continuer à les utiliser. Vous saurez aussi sur quels sites chercher." },
    ],
    checkTitle: "WoYou vous convient-il ?", checkLead: "Cinq questions courtes, gratuit. Ensuite nous vous disons franchement si une réservation vaut la peine pour vous.", checkBtn: "Faire l'auto-test",
    sampleTitle: "Voici à quoi ressemble votre candidature", sampleLead: "Voici à quoi ressemblent le CV et la lettre que nous rédigeons pour vous. Simples et lisibles, comme les services RH les aiment.", sampleCv: "CV modèle", sampleLetter: "Lettre modèle", sampleNote: "Modèle avec une personne fictive",
    stepsTitle: "Déroulement",
    steps: [
      { t: "Auto-test", d: "gratuit, une minute" },
      { t: "Réserver", d: "199 €, en ligne" },
      { t: "Premier entretien", d: "par téléphone ou vidéo" },
      { t: "Candidatures", d: "25 en 4 semaines" },
      { t: "Réponses", d: "suivi dans votre profil" },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Quelle est ma chance d'obtenir un poste ?", a: "En moyenne, environ 2 personnes sur 20 qui postulent depuis l'étranger obtiennent un poste. Nous rendons votre candidature aussi bonne que possible. Les exigences des employeurs, nous ne pouvons pas les changer." },
      { q: "Pourquoi ne donnez-vous pas de garantie ?", a: "Parce que personne ne peut honnêtement la donner. Celui qui vous promet un poste promet quelque chose qu'il ne maîtrise pas. Nous vous vendons seulement le travail que nous faisons vraiment." },
      { q: "Suis-je remboursé si cela ne marche pas ?", a: "Non. Vous payez pour 25 candidatures que nous cherchons et envoyons, et vous les recevez. Si nous ne trouvons pas 25 offres, nous vous remboursons le reste au prorata." },
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
    h1: "نقدّم طلباتك للعمل في ألمانيا. بصدق، مقابل 199 €.",
    sub: "نجهّز سيرتك الذاتية بالمعايير الألمانية، ونبحث عن 25 وظيفة قد تناسبك، ونرسل الطلبات باسمك. أما دعوتك للمقابلة فقرار صاحب العمل، وليس قرارنا.",
    ctaStart: "ابدأ الآن · 199 €", ctaCheck: "الاختبار الذاتي أولًا",
    trust: ["لا وساطة توظيف", "لا ضمان", "لا تكاليف مخفية"],
    trustNote: "لا نضمن لك وظيفة. لكننا نقول لك من البداية أين تقف.",
    priceTitle: "خدمة التقديم · 25 طلبًا", priceNote: "دفعة واحدة · بعدها 25 طلبًا إضافيًا مقابل 149 € أو عدد غير محدود مقابل 50 € شهريًا",
    ctaLogin: "سجّل الدخول واحجز", register: "ليس لديك حساب؟ سجّل مجانًا",
    careTitle: "يرجى الانتباه",
    care: [
      "للعمل في ألمانيا تحتاج إلى مؤهلات معترف بها ومعرفة باللغة. نحن لا نتولى ذلك.",
      "نحرص على أن يكون طلبك مرتبًا وكاملًا. أما التوظيف فقرار صاحب العمل وحده.",
      "للتوضيح: من بين 20 شخصًا يتقدمون من الخارج، يحصل في المتوسط شخصان تقريبًا على وظيفة. من الأفضل أن تعرف ذلك قبل الحجز.",
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
      { n: "+", t: "مستندات تبقى لك", d: "يمكنك تحميل السيرة الذاتية والرسالة واستخدامهما لاحقًا. وستعرف أيضًا أين تبحث عن الوظائف." },
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
      { q: "ما فرصتي في الحصول على وظيفة؟", a: "في المتوسط يحصل شخصان تقريبًا من كل 20 متقدمًا من الخارج على وظيفة. نجعل طلبك جيدًا قدر الإمكان، أما شروط أصحاب العمل فلا نستطيع تغييرها." },
      { q: "لماذا لا تقدمون ضمانًا؟", a: "لأن أحدًا لا يستطيع ذلك. من يضمن لك وظيفة يبيعك الأمل. نحن نبيع عملًا نقوم به فعلًا." },
      { q: "هل أسترد أموالي إذا لم ينجح الأمر؟", a: "لا. أنت تدفع مقابل 25 طلبًا نبحث عنها ونرسلها، وتحصل عليها. إذا لم نجد 25 وظيفة، نعيد لك الباقي بشكل نسبي." },
      { q: "هل هناك تكاليف إضافية؟", a: "باقة البداية بـ 199 € مرة واحدة وتشمل 25 طلبًا. بعدها تختار: 25 طلبًا إضافيًا مقابل 149 € أو عددًا غير محدود مقابل 50 € شهريًا، مع إمكانية الإلغاء في نهاية كل شهر. لا توجد رسوم مخفية." },
      { q: "في أي مهن تقدّمون عني؟", a: "في المهن التي نحددها معًا في المكالمة الأولى حسب تكوينك وخبرتك." },
      { q: "هل يمكنني استخدام مستنداتي بنفسي؟", a: "نعم. يمكنك تحميل سيرتك الذاتية ونموذج رسالة التحفيز في أي وقت واستخدامهما في طلباتك الخاصة." },
      { q: "كيف أدفع؟", a: "عبر الإنترنت بالبطاقة وبشكل آمن من خلال مزوّد الدفع Stripe." },
    ],
    facts: ["KarriereKind GmbH، دوسلدورف", "خوادم في ألمانيا", "الدفع عبر Stripe", "شخص مسؤول عنك"],
    jobs: ["الرعاية", "المطاعم", "الحِرف", "المكتب", "التقنية"],
  },
  hi: {
    badge: "आवेदन",
    h1: "हम जर्मनी में आपके लिए आवेदन करते हैं। ईमानदारी से, 199 € में।",
    sub: "हम आपका बायोडाटा जर्मन मानक के अनुसार तैयार करते हैं, आपके लिए उपयुक्त हो सकने वाली 25 नौकरियाँ खोजते हैं और आपके नाम से आवेदन भेजते हैं। आपको इंटरव्यू के लिए बुलाना है या नहीं, यह नियोक्ता तय करता है, हम नहीं।",
    ctaStart: "अभी शुरू करें · 199 €", ctaCheck: "पहले सेल्फ-चेक करें",
    trust: ["नौकरी दिलाने का काम नहीं", "कोई गारंटी नहीं", "कोई छिपी लागत नहीं"],
    trustNote: "हम नौकरी की गारंटी नहीं देते। लेकिन पहले ही साफ़ बता देते हैं कि आप कहाँ खड़े हैं।",
    priceTitle: "आवेदन सेवा · 25 आवेदन", priceNote: "एक बार · उसके बाद 25 और आवेदन 149 € में या असीमित 50 € प्रति माह",
    ctaLogin: "लॉग इन करें और बुक करें", register: "अभी खाता नहीं है? मुफ़्त में रजिस्टर करें",
    careTitle: "कृपया ध्यान दें",
    care: [
      "जर्मनी में काम करने के लिए मान्यता प्राप्त योग्यता और भाषा का ज्ञान ज़रूरी है। यह काम हम नहीं करते।",
      "हम यह सुनिश्चित करते हैं कि आपका आवेदन अच्छा दिखे और पूरा हो। आपको नौकरी देना है या नहीं, यह केवल नियोक्ता तय करता है।",
      "अंदाज़े के लिए: विदेश से आवेदन करने वाले 20 लोगों में से औसतन लगभग 2 को नौकरी मिलती है। बुक करने से पहले यह जानना ज़रूरी है।",
    ],
    careStrong: "अगर यह आपको बहुत अनिश्चित लगता है, तो बुक न करें। यह बिल्कुल ठीक है।",
    doTitle: "हमारे साथ आपको क्या मिलता है और क्या नहीं", doYes: "हम क्या करते हैं", doNo: "हम क्या नहीं करते",
    yes: [
      "हम आपके दस्तावेज़ जाँचते हैं और उन्हें जर्मन मानक पर लाते हैं",
      "हम बायोडाटा और कवर लेटर जर्मन में लिखते हैं",
      "हम आपकी प्रोफ़ाइल के लिए 25 मौजूदा और वास्तविक नौकरियाँ खोजते हैं",
      "हम आपके नाम से आवेदन भेजते हैं",
      "हम आपको स्रोत दिखाते हैं ताकि आप बाद में ख़ुद आवेदन कर सकें",
      "अगर आपकी प्रोफ़ाइल को अभी मौका नहीं है, तो हम साफ़ बता देते हैं",
    ],
    no: [
      "हम नौकरी नहीं दिलाते",
      "हम प्लेसमेंट एजेंसी या दलाल नहीं हैं",
      "हम नौकरी, इंटरव्यू या जवाब की गारंटी नहीं देते",
      "हम वीज़ा या योग्यता की मान्यता का काम नहीं करते",
      "हम नियोक्ता या सरकारी विभाग के फ़ैसले को प्रभावित नहीं करते",
    ],
    realTitle: "आपको वास्तव में क्या मिलता है",
    real: [
      { n: "25", t: "आपके पेशे में मौजूदा नौकरियाँ", d: "हर नौकरी के साथ विज्ञापन का लिंक, ताकि आप ख़ुद देख सकें।" },
      { n: "1", t: "आवेदन, जैसा जर्मन कंपनियाँ चाहती हैं", d: "जर्मन में, साफ़-सुथरा और हर नौकरी के अनुसार।" },
      { n: "4", t: "सप्ताह, जब तक सब भेज दिया जाए", d: "अपनी प्रोफ़ाइल में आप हर समय देख सकते हैं कि काम कहाँ तक पहुँचा।" },
      { n: "+", t: "दस्तावेज़ जो आपके अपने हैं", d: "बायोडाटा और कवर लेटर आप डाउनलोड करके आगे भी इस्तेमाल कर सकते हैं। आपको यह भी पता चलेगा कि नौकरियाँ कहाँ खोजें।" },
    ],
    checkTitle: "क्या WoYou आपके लिए सही है?", checkLead: "पाँच छोटे सवाल, मुफ़्त। उसके बाद हम साफ़ बताते हैं कि आपके लिए बुकिंग फ़ायदेमंद है या नहीं।", checkBtn: "सेल्फ-चेक पर जाएँ",
    sampleTitle: "आपका आवेदन ऐसा दिखता है", sampleLead: "हम आपके लिए जो बायोडाटा और कवर लेटर बनाते हैं, वे ऐसे दिखते हैं। सरल और पढ़ने में आसान, जैसा HR विभाग पसंद करते हैं।", sampleCv: "नमूना बायोडाटा", sampleLetter: "नमूना कवर लेटर", sampleNote: "काल्पनिक व्यक्ति का नमूना",
    stepsTitle: "प्रक्रिया कैसे चलती है",
    steps: [
      { t: "सेल्फ-चेक", d: "मुफ़्त, एक मिनट" },
      { t: "बुकिंग", d: "199 €, ऑनलाइन" },
      { t: "पहली बातचीत", d: "फ़ोन या वीडियो पर" },
      { t: "आवेदन", d: "4 सप्ताह में 25" },
      { t: "जवाब", d: "आपकी प्रोफ़ाइल में स्थिति" },
    ],
    faqTitle: "सामान्य प्रश्न",
    faq: [
      { q: "मुझे नौकरी मिलने की कितनी संभावना है?", a: "औसतन विदेश से आवेदन करने वाले 20 में से लगभग 2 लोगों को नौकरी मिलती है। हम आपका आवेदन जितना हो सके उतना अच्छा बनाते हैं। नियोक्ता की शर्तें हम नहीं बदल सकते।" },
      { q: "आप गारंटी क्यों नहीं देते?", a: "क्योंकि कोई भी ईमानदारी से यह गारंटी नहीं दे सकता। जो नौकरी का वादा करता है, वह ऐसी चीज़ का वादा करता है जो उसके हाथ में नहीं है। हम आपको सिर्फ़ वही काम बेचते हैं जो हम सच में करते हैं।" },
      { q: "अगर बात नहीं बनी तो क्या पैसे वापस मिलेंगे?", a: "नहीं। आप 25 आवेदनों के लिए भुगतान करते हैं जिन्हें हम खोजते और भेजते हैं, और वे आपको मिलते हैं। अगर हमें 25 नौकरियाँ नहीं मिलतीं, तो बाकी के लिए अनुपात में पैसे वापस मिलते हैं।" },
      { q: "क्या कोई और लागत है?", a: "शुरुआती पैकेज की कीमत एक बार 199 € है और इसमें 25 आवेदन शामिल हैं। उसके बाद आप तय करते हैं: 25 और आवेदन 149 € में या असीमित 50 € प्रति माह, जिसे हर महीने के अंत में रद्द किया जा सकता है। कोई छिपी फ़ीस नहीं।" },
      { q: "आप किन पेशों के लिए आवेदन करते हैं?", a: "उन पेशों के लिए जो हम पहली बातचीत में आपके साथ तय करते हैं, आपकी शिक्षा और अनुभव के अनुसार।" },
      { q: "क्या मैं अपने दस्तावेज़ ख़ुद इस्तेमाल कर सकता/सकती हूँ?", a: "हाँ। बायोडाटा और कवर लेटर का नमूना आप कभी भी डाउनलोड करके अपने आवेदनों के लिए इस्तेमाल कर सकते हैं।" },
      { q: "भुगतान कैसे करूँ?", a: "हमारे भुगतान प्रदाता Stripe के ज़रिए कार्ड से, ऑनलाइन और सुरक्षित।" },
    ],
    facts: ["KarriereKind GmbH, ड्यूसेलडॉर्फ", "सर्वर जर्मनी में", "Stripe से भुगतान", "व्यक्तिगत संपर्क व्यक्ति"],
    jobs: ["देखभाल", "रेस्टोरेंट", "शिल्प", "ऑफ़िस", "तकनीक"],
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
  papers: U("photo-1664382953403-fc1ac77073a0", 900), // Logistik: zwei Kolleginnen im Lager
};
