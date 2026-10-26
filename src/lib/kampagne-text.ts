// Kampagne „Spremi se za januar“ (Bereit für Januar) und Einstiegsblock der Länderseiten, in allen 7 Oberflächensprachen.
// Regeln (Konzept v4): Druck nur über offizielle Quellen (BA, Deutsche Botschaft), „das Kontingent ist begrenzt“,
// nie „nur noch wenige Plätze“, kein Countdown, kein Rabatt, kein Versprechen, dass Januar klappt.
// Immer nennen: Vorrangprüfung, der Arbeitgeber beantragt und entscheidet.
// Fakten nur aus dem Konzept: 50.000 je Kalenderjahr, Ende November 2025 ausgeschöpft, Halbierung auf 25.000 ab 2027
// laut Koalitionsvertrag geplant (vorsichtig formuliert). Keine weiteren Zahlen erfinden.
//
// Die Texte hängen bewusst nicht vom Datum ab. Ab März wechselt das Thema: dann diese Seite aus Sitemap und Anzeigen nehmen
// oder die Texte hier anpassen. Daten kommen aus selfcheck.ts (BUCHUNG_BIS, UNTERLAGEN_BIS, ANTRAG_AB).
// Platzhalter: {buchung} = BUCHUNG_BIS, {bis} = UNTERLAGEN_BIS, {ab} = ANTRAG_AB, {land} = Ländername, {ort} = Ort der Botschaft.
// fr/ar/hi/sr/te: Übersetzung bitte von Muttersprachler:in prüfen lassen (Serbisch nur lateinische Schrift, du-Form „ti“).
import { ANTRAG_AB, BUCHUNG_BIS, UNTERLAGEN_BIS, saisonDatum, type CheckLang } from "./selfcheck";

export type KampagneText = {
  metaTitle: string; metaDesc: string;
  badge: string; h1: string; lead: string; ctaCheck: string;
  calTitle: string; cal: { when: string; t: string; d: string }[];
  whyTitle: string; why: string[]; limit: string;
  sourcesLabel: string; srcBa: string; srcEmbassy: string;
  honestTitle: string; honest: string[];
  ctaTitle: string; ctaLead: string;
  // Länderseiten (Block über der Startseite)
  landMetaTitle: string; landMetaDesc: string; landWb: string; landCheck: string; landJanuar: string; landIn: string; landSprachen: string;
};

export const KAMPAGNE_TEXT: Record<CheckLang, KampagneText> = {
  de: {
    metaTitle: "Bereit für Januar: Westbalkanregelung und dein Kalender",
    metaDesc: "Das Kontingent gilt je Kalenderjahr, Arbeitgeber beantragen ab {ab}. So sind deine Bewerbungsunterlagen rechtzeitig fertig. Ehrlich und ohne Jobversprechen.",
    badge: "WESTBALKANREGELUNG",
    h1: "Bereit für Januar",
    lead: "Ab {ab} beginnt das neue Kontingent der Westbalkanregelung. Wenn deine Unterlagen bis dahin fertig sind und du dich im Dezember schon beworben hast, verlierst du keine Zeit. Ob es klappt, entscheidet der Arbeitgeber, nicht wir.",
    ctaCheck: "Kostenlos prüfen, ob es für dich passt",
    calTitle: "Dein Kalender",
    cal: [
      { when: "bis {buchung}", t: "Buchen", d: "Damit wir genug Zeit für deine Unterlagen haben." },
      { when: "bis {bis}", t: "Unterlagen fertig", d: "Lebenslauf auf Deutsch und Vorlage für das Anschreiben, von uns geprüft." },
      { when: "Dezember", t: "Selbst bewerben", d: "Du suchst Stellen im Werkzeug und bewirbst dich aus deinem eigenen Postfach." },
      { when: "ab {ab}", t: "Der Arbeitgeber beantragt", d: "Will dich ein Arbeitgeber einstellen, stellt er den Antrag. Vorher prüft die Agentur für Arbeit (Vorrangprüfung)." },
    ],
    whyTitle: "Warum gerade Januar?",
    why: [
      "Das Kontingent der Westbalkanregelung gilt je Kalenderjahr. Im Januar beginnt es neu.",
      "Pro Jahr gibt es 50.000 Zustimmungen.",
      "Das Kontingent für 2025 war schon Ende November 2025 ausgeschöpft.",
      "Laut Koalitionsvertrag ist geplant, das Kontingent ab 2027 auf 25.000 zu halbieren. Ob und wann das kommt, ist noch offen.",
    ],
    limit: "Das Kontingent ist begrenzt. Wer früh vorbereitet ist, verliert keine Zeit.",
    sourcesLabel: "Offizielle Quellen",
    srcBa: "Bundesagentur für Arbeit: Westbalkanregelung",
    srcEmbassy: "Deutsche Botschaft {ort}",
    honestTitle: "Ehrlich gesagt",
    honest: [
      "Den Antrag stellt der Arbeitgeber, nicht du und nicht wir.",
      "Vorher prüft die Agentur für Arbeit, ob es passende Bewerber aus Deutschland oder der EU gibt (Vorrangprüfung).",
      "Ob du eingestellt wirst, entscheidet allein der Arbeitgeber. Wir versprechen dir keinen Job, kein Visum und keinen Start im Januar.",
      "WoYou vermittelt nicht und hat keinen Kontakt zu Arbeitgebern. Du bewirbst dich selbst.",
    ],
    ctaTitle: "Erst prüfen, dann entscheiden",
    ctaLead: "Der Selbstcheck dauert eine Minute und ist kostenlos. Wenn es für dich wenig Sinn ergibt, sagen wir dir das.",
    landMetaTitle: "WoYou {land}: Bewerbungsunterlagen für Deutschland",
    landMetaDesc: "Für Bewerberinnen und Bewerber aus {land}: Bewerbungsunterlagen nach deutschem Standard und ein Werkzeug, mit dem du dich selbst bewirbst. Mit kostenlosem Selbstcheck.",
    landWb: "Für dein Land gilt die Westbalkanregelung: Der Arbeitgeber beantragt die Zustimmung, das Kontingent ist begrenzt (50.000 pro Jahr) und die Agentur für Arbeit prüft vorher, ob es passende Bewerber aus Deutschland oder der EU gibt.",
    landCheck: "Erst prüfen, ob es sinnvoll ist",
    landJanuar: "Bereit für Januar: Kalender und Hintergründe",
    landIn: "Für Indien gibt es keine Sonderregel wie für den Westbalkan. Für viele Berufe brauchst du die Anerkennung deines Abschlusses und Deutschkenntnisse. Wir machen deine Unterlagen nach deutschem Standard, bewerben musst du dich selbst.",
    landSprachen: "Diese Seite gibt es auch auf:",
  },
  en: {
    metaTitle: "Get ready for January: Western Balkans regulation and your calendar",
    metaDesc: "The quota counts per calendar year, employers apply from {ab}. Get your application documents ready in time. Honest, with no job promise.",
    badge: "WESTERN BALKANS REGULATION",
    h1: "Get ready for January",
    lead: "From {ab}, the new quota of the Western Balkans regulation starts. If your documents are ready by then and you already applied in December, you don't lose time. Whether it works out is the employer's decision, not ours.",
    ctaCheck: "Check for free whether it fits you",
    calTitle: "Your calendar",
    cal: [
      { when: "by {buchung}", t: "Book", d: "So we have enough time for your documents." },
      { when: "by {bis}", t: "Documents ready", d: "German CV and cover letter template, checked by us." },
      { when: "December", t: "Apply yourself", d: "You search for jobs in the tool and apply from your own mailbox." },
      { when: "from {ab}", t: "The employer applies", d: "If an employer wants to hire you, they submit the application. First the Federal Employment Agency runs the priority check (Vorrangprüfung)." },
    ],
    whyTitle: "Why January?",
    why: [
      "The quota of the Western Balkans regulation counts per calendar year. It starts again in January.",
      "There are 50,000 approvals per year.",
      "The quota for 2025 was already used up at the end of November 2025.",
      "According to the coalition agreement, there are plans to halve the quota to 25,000 from 2027. Whether and when this happens is still open.",
    ],
    limit: "The quota is limited. If you are prepared early, you don't lose time.",
    sourcesLabel: "Official sources",
    srcBa: "Federal Employment Agency: Western Balkans regulation",
    srcEmbassy: "German Embassy {ort}",
    honestTitle: "To be honest",
    honest: [
      "The employer submits the application, not you and not us.",
      "Before that, the Federal Employment Agency checks whether there are suitable applicants from Germany or the EU (priority check).",
      "Whether you are hired is the employer's decision alone. We do not promise you a job, a visa or a start in January.",
      "WoYou does not place you in jobs and has no contact with employers. You apply yourself.",
    ],
    ctaTitle: "Check first, then decide",
    ctaLead: "The self-check takes a minute and is free. If it makes little sense for you, we tell you.",
    landMetaTitle: "WoYou {land}: application documents for Germany",
    landMetaDesc: "For applicants from {land}: application documents to German standards and a tool to apply yourself. With a free self-check.",
    landWb: "The Western Balkans regulation applies to your country: the employer applies for the approval, the quota is limited (50,000 per year) and the Federal Employment Agency first checks whether there are suitable applicants from Germany or the EU.",
    landCheck: "First check whether it makes sense",
    landJanuar: "Get ready for January: calendar and background",
    landIn: "There is no special rule for India like the one for the Western Balkans. For many professions you need recognition of your qualification and German skills. We prepare your documents to German standards, you apply yourself.",
    landSprachen: "This page is also available in:",
  },
  fr: {
    metaTitle: "Préparez-vous pour janvier : réglementation Balkans occidentaux et calendrier",
    metaDesc: "Le contingent est annuel, les employeurs déposent la demande à partir du {ab}. Préparez vos documents à temps. Honnête, sans promesse d'emploi.",
    badge: "RÉGLEMENTATION BALKANS OCCIDENTAUX",
    h1: "Préparez-vous pour janvier",
    lead: "À partir du {ab}, le nouveau contingent de la réglementation Balkans occidentaux commence. Si vos documents sont prêts et que vous avez déjà postulé en décembre, vous ne perdez pas de temps. La décision revient à l'employeur, pas à nous.",
    ctaCheck: "Vérifier gratuitement si cela vous convient",
    calTitle: "Votre calendrier",
    cal: [
      { when: "avant le {buchung}", t: "Réserver", d: "Pour que nous ayons assez de temps pour vos documents." },
      { when: "avant le {bis}", t: "Documents prêts", d: "CV en allemand et modèle de lettre, vérifiés par nous." },
      { when: "Décembre", t: "Postuler vous-même", d: "Vous cherchez des offres dans l'outil et postulez depuis votre propre boîte mail." },
      { when: "à partir du {ab}", t: "L'employeur fait la demande", d: "Si un employeur veut vous embaucher, c'est lui qui dépose la demande. L'Agence fédérale pour l'emploi fait d'abord l'examen de priorité." },
    ],
    whyTitle: "Pourquoi janvier ?",
    why: [
      "Le contingent de la réglementation Balkans occidentaux est calculé par année civile. Il recommence en janvier.",
      "Il y a 50 000 autorisations par an.",
      "Le contingent 2025 était déjà épuisé fin novembre 2025.",
      "Selon l'accord de coalition, il est prévu de réduire le contingent de moitié, à 25 000, à partir de 2027. Si et quand cela arrivera reste ouvert.",
    ],
    limit: "Le contingent est limité. En étant prêt tôt, vous ne perdez pas de temps.",
    sourcesLabel: "Sources officielles",
    srcBa: "Agence fédérale pour l'emploi : réglementation Balkans occidentaux",
    srcEmbassy: "Ambassade d'Allemagne, {ort}",
    honestTitle: "En toute franchise",
    honest: [
      "C'est l'employeur qui dépose la demande, pas vous et pas nous.",
      "Avant, l'Agence fédérale pour l'emploi vérifie s'il existe des candidats adaptés en Allemagne ou dans l'UE (examen de priorité).",
      "Seul l'employeur décide de vous embaucher. Nous ne vous promettons ni emploi, ni visa, ni début en janvier.",
      "WoYou ne fait pas de placement et n'a aucun contact avec les employeurs. Vous postulez vous-même.",
    ],
    ctaTitle: "Vérifier d'abord, décider ensuite",
    ctaLead: "Le test dure une minute et il est gratuit. Si cela a peu de sens pour vous, nous vous le disons.",
    landMetaTitle: "WoYou {land} : documents de candidature pour l'Allemagne",
    landMetaDesc: "Pays : {land}. Documents de candidature aux normes allemandes et un outil pour postuler vous-même. Avec un test gratuit.",
    landWb: "La réglementation Balkans occidentaux s'applique à votre pays : l'employeur demande l'autorisation, le contingent est limité (50 000 par an) et l'Agence fédérale pour l'emploi vérifie d'abord s'il existe des candidats adaptés en Allemagne ou dans l'UE.",
    landCheck: "Vérifiez d'abord si cela a du sens",
    landJanuar: "Préparez-vous pour janvier : calendrier et contexte",
    landIn: "Pour l'Inde, il n'y a pas de règle spéciale comme pour les Balkans occidentaux. Pour beaucoup de métiers, il faut la reconnaissance de votre diplôme et des connaissances en allemand. Nous préparons vos documents aux normes allemandes, vous postulez vous-même.",
    landSprachen: "Cette page existe aussi en :",
  },
  ar: {
    metaTitle: "استعد لشهر يناير: لائحة غرب البلقان وجدولك الزمني",
    metaDesc: "الحصة تُحسب لكل سنة ميلادية، وأصحاب العمل يقدّمون الطلب ابتداءً من {ab}. جهّز ملف ترشيحك في الوقت المناسب. بصدق، بدون وعد بوظيفة.",
    badge: "لائحة غرب البلقان",
    h1: "استعد لشهر يناير",
    lead: "ابتداءً من {ab} تبدأ الحصة الجديدة للائحة غرب البلقان. إذا كانت مستنداتك جاهزة حينها وتقدّمت إلى الوظائف في ديسمبر، فلن تضيّع وقتًا. القرار في النهاية لصاحب العمل، وليس لنا.",
    ctaCheck: "تحقّق مجانًا إن كان هذا يناسبك",
    calTitle: "جدولك الزمني",
    cal: [
      { when: "حتى {buchung}", t: "احجز", d: "حتى يكون لدينا وقت كافٍ لمستنداتك." },
      { when: "حتى {bis}", t: "المستندات جاهزة", d: "سيرة ذاتية بالألمانية ونموذج رسالة تحفيزية، راجعناهما نحن." },
      { when: "ديسمبر", t: "تقدّم بنفسك", d: "تبحث عن الوظائف في الأداة وترسل طلباتك من بريدك الإلكتروني الخاص." },
      { when: "ابتداءً من {ab}", t: "صاحب العمل يقدّم الطلب", d: "إذا أراد صاحب عمل توظيفك، فهو من يقدّم الطلب. قبل ذلك تجري وكالة العمل فحص الأولوية." },
    ],
    whyTitle: "لماذا يناير بالتحديد؟",
    why: [
      "حصة لائحة غرب البلقان تُحسب لكل سنة ميلادية، وتبدأ من جديد في يناير.",
      "هناك 50.000 موافقة في السنة.",
      "حصة سنة 2025 نفدت منذ نهاية نوفمبر 2025.",
      "حسب اتفاق الائتلاف الحكومي، من المخطط تخفيض الحصة إلى النصف، أي 25.000، ابتداءً من 2027. هل سيحدث ذلك ومتى، ما زال غير محسوم.",
    ],
    limit: "الحصة محدودة. من يستعد مبكرًا لا يضيّع الوقت.",
    sourcesLabel: "مصادر رسمية",
    srcBa: "الوكالة الاتحادية للعمل: لائحة غرب البلقان",
    srcEmbassy: "السفارة الألمانية، {ort}",
    honestTitle: "بصراحة",
    honest: [
      "صاحب العمل هو من يقدّم الطلب، وليس أنت ولا نحن.",
      "قبل ذلك تتحقق وكالة العمل مما إذا كان هناك متقدمون مناسبون من ألمانيا أو الاتحاد الأوروبي (فحص الأولوية).",
      "قرار توظيفك يعود لصاحب العمل وحده. لا نعدك بوظيفة ولا بتأشيرة ولا ببداية في يناير.",
      "WoYou لا تتوسط في التوظيف وليس لها أي تواصل مع أصحاب العمل. أنت من يتقدّم بنفسه.",
    ],
    ctaTitle: "تحقّق أولًا، ثم قرّر",
    ctaLead: "الاختبار يستغرق دقيقة وهو مجاني. إذا لم يكن مفيدًا لك، نقول لك ذلك.",
    landMetaTitle: "WoYou {land}: ملف الترشيح للعمل في ألمانيا",
    landMetaDesc: "البلد: {land}. ملف ترشيح حسب المعايير الألمانية وأداة تتقدّم بها بنفسك. مع اختبار مجاني.",
    landWb: "لائحة غرب البلقان تنطبق على بلدك: صاحب العمل يطلب الموافقة، والحصة محدودة (50.000 في السنة)، وتتحقق وكالة العمل أولًا مما إذا كان هناك متقدمون مناسبون من ألمانيا أو الاتحاد الأوروبي.",
    landCheck: "تحقّق أولًا إن كان الأمر مفيدًا",
    landJanuar: "استعد لشهر يناير: الجدول الزمني والخلفيات",
    landIn: "بالنسبة للهند لا توجد قاعدة خاصة مثل لائحة غرب البلقان. لكثير من المهن تحتاج إلى معادلة شهادتك ومعرفة باللغة الألمانية. نحن نجهّز مستنداتك حسب المعايير الألمانية، وأنت من يتقدّم بنفسه.",
    landSprachen: "هذه الصفحة متوفرة أيضًا بـ:",
  },
  hi: {
    metaTitle: "जनवरी के लिए तैयार हो जाइए: पश्चिमी बाल्कन नियम और आपका कैलेंडर",
    metaDesc: "कोटा हर कैलेंडर वर्ष के लिए होता है, नियोक्ता {ab} से आवेदन करते हैं। अपने आवेदन दस्तावेज़ समय पर तैयार करें। ईमानदारी से, नौकरी के वादे के बिना।",
    badge: "पश्चिमी बाल्कन नियम",
    h1: "जनवरी के लिए तैयार हो जाइए",
    lead: "{ab} से पश्चिमी बाल्कन नियम का नया कोटा शुरू होता है। अगर तब तक आपके दस्तावेज़ तैयार हैं और आपने दिसंबर में आवेदन कर दिए हैं, तो आपका समय बर्बाद नहीं होता। नौकरी मिलेगी या नहीं, यह नियोक्ता तय करता है, हम नहीं।",
    ctaCheck: "मुफ़्त में जाँचें कि यह आपके लिए सही है या नहीं",
    calTitle: "आपका कैलेंडर",
    cal: [
      { when: "{buchung} तक", t: "बुक करें", d: "ताकि आपके दस्तावेज़ों के लिए हमारे पास काफ़ी समय हो।" },
      { when: "{bis} तक", t: "दस्तावेज़ तैयार", d: "जर्मन में CV और कवर लेटर का टेम्पलेट, हमारे द्वारा जाँचा हुआ।" },
      { when: "दिसंबर", t: "ख़ुद आवेदन करें", d: "आप टूल में नौकरियाँ खोजते हैं और अपने ईमेल से आवेदन भेजते हैं।" },
      { when: "{ab} से", t: "नियोक्ता आवेदन करता है", d: "अगर कोई नियोक्ता आपको रखना चाहता है, तो वही आवेदन करता है। उससे पहले रोज़गार एजेंसी प्राथमिकता जाँच करती है।" },
    ],
    whyTitle: "जनवरी ही क्यों?",
    why: [
      "पश्चिमी बाल्कन नियम का कोटा हर कैलेंडर वर्ष के लिए गिना जाता है। जनवरी में यह फिर से शुरू होता है।",
      "हर साल 50,000 मंज़ूरियाँ होती हैं।",
      "2025 का कोटा नवंबर 2025 के अंत तक ही ख़त्म हो गया था।",
      "गठबंधन समझौते के अनुसार 2027 से कोटा आधा करके 25,000 करने की योजना है। यह होगा या नहीं और कब, अभी तय नहीं है।",
    ],
    limit: "कोटा सीमित है। जो जल्दी तैयार होता है, उसका समय बर्बाद नहीं होता।",
    sourcesLabel: "आधिकारिक स्रोत",
    srcBa: "संघीय रोज़गार एजेंसी: पश्चिमी बाल्कन नियम",
    srcEmbassy: "जर्मन दूतावास, {ort}",
    honestTitle: "साफ़ शब्दों में",
    honest: [
      "आवेदन नियोक्ता करता है, न आप और न हम।",
      "उससे पहले रोज़गार एजेंसी जाँचती है कि जर्मनी या EU से कोई उपयुक्त उम्मीदवार है या नहीं (प्राथमिकता जाँच)।",
      "आपको नौकरी मिलेगी या नहीं, यह सिर्फ़ नियोक्ता तय करता है। हम न नौकरी का वादा करते हैं, न वीज़ा का, न जनवरी में शुरुआत का।",
      "WoYou नौकरी नहीं दिलाता और नियोक्ताओं से कोई संपर्क नहीं रखता। आवेदन आप ख़ुद करते हैं।",
    ],
    ctaTitle: "पहले जाँचें, फिर तय करें",
    ctaLead: "जाँच में एक मिनट लगता है और यह मुफ़्त है। अगर आपके लिए इसका ज़्यादा फ़ायदा नहीं है, तो हम बता देंगे।",
    landMetaTitle: "WoYou {land}: जर्मनी के लिए आवेदन दस्तावेज़",
    landMetaDesc: "देश: {land}। जर्मन मानक के अनुसार आवेदन दस्तावेज़ और एक टूल, जिससे आप ख़ुद आवेदन करते हैं। मुफ़्त जाँच के साथ।",
    landWb: "आपके देश पर पश्चिमी बाल्कन नियम लागू होता है: मंज़ूरी के लिए नियोक्ता आवेदन करता है, कोटा सीमित है (हर साल 50,000) और रोज़गार एजेंसी पहले जाँचती है कि जर्मनी या EU से कोई उपयुक्त उम्मीदवार है या नहीं।",
    landCheck: "पहले जाँचें कि यह समझदारी है या नहीं",
    landJanuar: "जनवरी के लिए तैयार हो जाइए: कैलेंडर और पृष्ठभूमि",
    landIn: "भारत के लिए पश्चिमी बाल्कन जैसा कोई विशेष नियम नहीं है। कई पेशों के लिए आपको अपनी योग्यता की मान्यता और जर्मन भाषा चाहिए। हम आपके दस्तावेज़ जर्मन मानक के अनुसार तैयार करते हैं, आवेदन आप ख़ुद करते हैं।",
    landSprachen: "यह पेज इन भाषाओं में भी है:",
  },
  sr: {
    metaTitle: "Spremi se za januar: Westbalkanregelung i tvoj kalendar",
    metaDesc: "Kvota važi za kalendarsku godinu, a poslodavci od {ab} podnose zahtev. Pripremi dokumenta za prijavu na vreme. Iskreno i bez obećanja posla.",
    badge: "WESTBALKANREGELUNG",
    h1: "Spremi se za januar",
    lead: "Od {ab} počinje nova kvota po Westbalkanregelung. Ako su ti dokumenta do tada spremna i ako se u decembru već prijavljuješ na oglase, nećeš gubiti vreme. Da li će uspeti, odlučuje poslodavac, ne mi.",
    ctaCheck: "Besplatno proveri da li ti odgovara",
    calTitle: "Tvoj kalendar",
    cal: [
      { when: "do {buchung}", t: "Naruči", d: "Da bismo imali dovoljno vremena za tvoja dokumenta." },
      { when: "do {bis}", t: "Dokumenta spremna", d: "Biografija na nemačkom i šablon propratnog pisma, koje smo mi proverili." },
      { when: "Decembar", t: "Prijavljuješ se lično", d: "Tražiš oglase u alatu i prijavljuješ se sa svoje e-pošte." },
      { when: "od {ab}", t: "Poslodavac podnosi zahtev", d: "Ako poslodavac želi da te zaposli, on podnosi zahtev. Pre toga Agencija za rad radi proveru prednosti (Vorrangprüfung)." },
    ],
    whyTitle: "Zašto baš januar?",
    why: [
      "Kvota po Westbalkanregelung važi za kalendarsku godinu. U januaru počinje iznova.",
      "Svake godine ima 50.000 odobrenja.",
      "Kvota za 2025. bila je popunjena već krajem novembra 2025.",
      "Prema koalicionom sporazumu planira se da se kvota od 2027. smanji na pola, na 25.000. Da li će i kada do toga doći, još nije jasno.",
    ],
    limit: "Kvota je ograničena. Ko se pripremi ranije, ne gubi vreme.",
    sourcesLabel: "Zvanični izvori",
    srcBa: "Savezna agencija za zapošljavanje: Westbalkanregelung",
    srcEmbassy: "Nemačka ambasada, {ort}",
    honestTitle: "Iskreno",
    honest: [
      "Zahtev podnosi poslodavac, ne ti i ne mi.",
      "Pre toga Agencija za rad proverava da li ima odgovarajućih kandidata iz Nemačke ili EU (provera prednosti).",
      "Da li ćeš dobiti posao, odlučuje samo poslodavac. Ne obećavamo ti posao, vizu ni početak u januaru.",
      "WoYou ne posreduje u zapošljavanju i nema kontakt sa poslodavcima. Na oglase se prijavljuješ lično.",
    ],
    ctaTitle: "Prvo proveri, pa odluči",
    ctaLead: "Provera traje minut i besplatna je. Ako za tebe nema mnogo smisla, reći ćemo ti.",
    landMetaTitle: "WoYou {land}: dokumenta za prijavu na posao u Nemačkoj",
    landMetaDesc: "Zemlja: {land}. Dokumenta za prijavu po nemačkom standardu i alat sa kojim se lično prijavljuješ. Uz besplatnu proveru.",
    landWb: "Za tvoju zemlju važi Westbalkanregelung: poslodavac traži odobrenje, kvota je ograničena (50.000 godišnje), a Agencija za rad prvo proverava da li ima odgovarajućih kandidata iz Nemačke ili EU.",
    landCheck: "Prvo proveri da li ima smisla",
    landJanuar: "Spremi se za januar: kalendar i pozadina",
    landIn: "Za Indiju ne postoji posebno pravilo kao za Zapadni Balkan. Za mnoga zanimanja ti treba priznata diploma i znanje nemačkog. Mi pripremamo tvoja dokumenta po nemačkom standardu, a prijavljuješ se lično.",
    landSprachen: "Ova stranica postoji i na:",
  },
  te: {
    metaTitle: "జనవరికి సిద్ధం అవ్వండి: పశ్చిమ బాల్కన్ నియమం మరియు మీ క్యాలెండర్",
    metaDesc: "కోటా ప్రతి క్యాలెండర్ సంవత్సరానికి లెక్కిస్తారు, యజమానులు {ab} నుంచి దరఖాస్తు చేస్తారు. మీ దరఖాస్తు పత్రాలను సమయానికి సిద్ధం చేసుకోండి. నిజాయితీగా, ఉద్యోగ హామీ లేకుండా.",
    badge: "పశ్చిమ బాల్కన్ నియమం",
    h1: "జనవరికి సిద్ధం అవ్వండి",
    lead: "{ab} నుంచి పశ్చిమ బాల్కన్ నియమం కొత్త కోటా మొదలవుతుంది. అప్పటికి మీ పత్రాలు సిద్ధంగా ఉండి, డిసెంబర్‌లో మీరు దరఖాస్తులు పంపి ఉంటే, మీ సమయం వృథా కాదు. ఉద్యోగం వస్తుందా లేదా అనేది యజమాని నిర్ణయం, మాది కాదు.",
    ctaCheck: "ఇది మీకు సరిపోతుందో ఉచితంగా తనిఖీ చేయండి",
    calTitle: "మీ క్యాలెండర్",
    cal: [
      { when: "{buchung} లోగా", t: "బుక్ చేయండి", d: "మీ పత్రాల కోసం మాకు తగినంత సమయం ఉండేలా." },
      { when: "{bis} లోగా", t: "పత్రాలు సిద్ధం", d: "జర్మన్‌లో CV మరియు కవర్ లెటర్ టెంప్లేట్, మేము తనిఖీ చేసినవి." },
      { when: "డిసెంబర్", t: "మీరే దరఖాస్తు చేయండి", d: "టూల్‌లో ఉద్యోగాలు వెతికి, మీ సొంత ఈమెయిల్ నుంచి దరఖాస్తు పంపుతారు." },
      { when: "{ab} నుంచి", t: "యజమాని దరఖాస్తు చేస్తారు", d: "ఒక యజమాని మిమ్మల్ని నియమించాలనుకుంటే, ఆయనే దరఖాస్తు చేస్తారు. దానికి ముందు ఉపాధి సంస్థ ప్రాధాన్యత తనిఖీ చేస్తుంది." },
    ],
    whyTitle: "జనవరి ఎందుకు?",
    why: [
      "పశ్చిమ బాల్కన్ నియమం కోటా ప్రతి క్యాలెండర్ సంవత్సరానికి లెక్కిస్తారు. జనవరిలో అది మళ్ళీ మొదలవుతుంది.",
      "సంవత్సరానికి 50,000 అనుమతులు ఉంటాయి.",
      "2025 కోటా నవంబర్ 2025 చివరికే పూర్తయిపోయింది.",
      "సంకీర్ణ ఒప్పందం ప్రకారం 2027 నుంచి కోటాను సగానికి, అంటే 25,000కి తగ్గించాలని ప్రణాళిక ఉంది. అది జరుగుతుందా, ఎప్పుడు అనేది ఇంకా తేలలేదు.",
    ],
    limit: "కోటా పరిమితం. ముందుగా సిద్ధమైనవారు సమయం కోల్పోరు.",
    sourcesLabel: "అధికారిక మూలాలు",
    srcBa: "ఫెడరల్ ఉపాధి సంస్థ: పశ్చిమ బాల్కన్ నియమం",
    srcEmbassy: "జర్మన్ రాయబార కార్యాలయం, {ort}",
    honestTitle: "నిజాయితీగా చెప్పాలంటే",
    honest: [
      "దరఖాస్తు యజమాని చేస్తారు, మీరు కాదు, మేము కాదు.",
      "దానికి ముందు జర్మనీ లేదా EU నుంచి సరైన అభ్యర్థులు ఉన్నారా అని ఉపాధి సంస్థ తనిఖీ చేస్తుంది (ప్రాధాన్యత తనిఖీ).",
      "మిమ్మల్ని నియమించాలా వద్దా అనేది యజమాని మాత్రమే నిర్ణయిస్తారు. ఉద్యోగం, వీసా, జనవరిలో మొదలు, వీటిలో దేనికీ మేము హామీ ఇవ్వము.",
      "WoYou ఉద్యోగ నియామకం చేయదు, యజమానులతో ఎలాంటి సంబంధం లేదు. దరఖాస్తు మీరే చేస్తారు.",
    ],
    ctaTitle: "ముందు తనిఖీ చేయండి, తర్వాత నిర్ణయించండి",
    ctaLead: "తనిఖీకి ఒక నిమిషం పడుతుంది, ఉచితం. మీకు పెద్దగా ఉపయోగం లేకపోతే, మేము చెబుతాము.",
    landMetaTitle: "WoYou {land}: జర్మనీ కోసం దరఖాస్తు పత్రాలు",
    landMetaDesc: "దేశం: {land}. జర్మన్ ప్రమాణాల ప్రకారం దరఖాస్తు పత్రాలు, మీరే దరఖాస్తు చేసుకునే టూల్. ఉచిత తనిఖీతో.",
    landWb: "మీ దేశానికి పశ్చిమ బాల్కన్ నియమం వర్తిస్తుంది: అనుమతి కోసం యజమాని దరఖాస్తు చేస్తారు, కోటా పరిమితం (సంవత్సరానికి 50,000), ముందుగా జర్మనీ లేదా EU నుంచి సరైన అభ్యర్థులు ఉన్నారా అని ఉపాధి సంస్థ తనిఖీ చేస్తుంది.",
    landCheck: "ముందుగా ఇది ఉపయోగకరమో తనిఖీ చేయండి",
    landJanuar: "జనవరికి సిద్ధం అవ్వండి: క్యాలెండర్ మరియు నేపథ్యం",
    landIn: "భారతదేశానికి పశ్చిమ బాల్కన్ లాంటి ప్రత్యేక నియమం లేదు. చాలా వృత్తులకు మీ అర్హతకు గుర్తింపు, జర్మన్ భాష అవసరం. మేము మీ పత్రాలను జర్మన్ ప్రమాణాల ప్రకారం సిద్ధం చేస్తాము, దరఖాస్తు మీరే చేస్తారు.",
    landSprachen: "ఈ పేజీ ఈ భాషల్లో కూడా ఉంది:",
  },
};

export const KAMPAGNE_SPRACHEN = Object.keys(KAMPAGNE_TEXT) as CheckLang[];
/** Oberflächensprache → Textsprache (andere Sprachen sehen Englisch, wie auf der Startseite) */
export const kampagneLang = (locale: string): CheckLang => ((KAMPAGNE_SPRACHEN as string[]).includes(locale) ? (locale as CheckLang) : "en");
export const kampagneText = (locale: string) => KAMPAGNE_TEXT[kampagneLang(locale)];

/** Setzt Daten und Namen ein: {buchung}, {bis}, {ab} aus selfcheck.ts, dazu {land} und {ort} */
export function fillKampagne(s: string, lang: CheckLang, vars: { land?: string; ort?: string } = {}): string {
  return s
    .replace(/\{buchung\}/g, saisonDatum(BUCHUNG_BIS, lang))
    .replace(/\{bis\}/g, saisonDatum(UNTERLAGEN_BIS, lang))
    .replace(/\{ab\}/g, saisonDatum(ANTRAG_AB, lang))
    .replace(/\{land\}/g, vars.land ?? "")
    .replace(/\{ort\}/g, vars.ort ?? "");
}
