// Betreiberangaben (Impressum, Kontakt, Datenschutz, AGB, Fußzeile) zentral hier pflegen.
// Firma, Anschrift, Vertretung, Register und Datenschutzbeauftragte übernommen von https://karrierekind.de/impressum
// und https://karrierekind.de/datenschutz (Stand 23.10.2026, gleiche Gesellschaft). Eine USt-ID steht dort nicht,
// deshalb hier auch keine. Kontakt wie bei KarriereKind (Stand 23.10.2026): Fußzeile/Kontakt service@karrierekind.de,
// im Impressum info@karrierekind.de. Kein eigenes WoYou-Postfach, damit Anfragen in einem gelesenen Postfach landen.
// Telefon (Entscheidung Florian 23.10.2026): keine Handynummer, sondern die kostenlose Hotline der EuBiA wie auf www.eubia.de.
export const COMPANY = {
  name: "KarriereKind GmbH",
  street: "Berliner Allee 51",
  zipCity: "40212 Düsseldorf",
  country: "Deutschland",
  ceo: "Rachid Debdoubi",
  court: "Amtsgericht Düsseldorf",
  register: "HRB 99139",
  email: "service@karrierekind.de", // Kundenkontakt: Fußzeile, Kontakt, Login, Selbstcheck, AGB, Datenschutz, Antwortadresse der Mails
  legalEmail: "info@karrierekind.de", // Impressum (wie im Impressum von karrierekind.de)
  phone: "+49 211 913 829 10", // Zentrale der EuBiA in Düsseldorf wie auf www.eubia.de (auch aus dem Ausland erreichbar)
  phoneTel: "+4921191382910", // für tel:-Links
  seat: "Düsseldorf",
  // Externe Datenschutzbeauftragte (wie bei KarriereKind)
  dpo: { name: "DPP Data Protection GmbH", person: "Rudolf Fiedler", street: "Zum Gottschalkhof 2", zipCity: "60594 Frankfurt am Main", email: "info@dataprotectionpartner.de" },
};

type L = "de" | "en" | "fr" | "ar" | "hi" | "sr" | "te";
export const SITE_TEXT: Record<L, {
  navOffer: string; navSteps: string; navFaq: string; navContact: string; navCheck: string;
  aboutTitle: string; about: string[]; contactTitle: string; contactLead: string; hours: string;
  footerService: string; footerLegal: string; book: string;
}> = {
  de: {
    navOffer: "Angebot", navCheck: "Selbstcheck", navSteps: "Ablauf", navFaq: "FAQ", navContact: "Kontakt",
    aboutTitle: "Über WoYou",
    about: [
      "WoYou gibt es seit 2018. Wir helfen Menschen aus dem Ausland, sich in Deutschland richtig zu bewerben.",
      "Unser Team spricht viele Sprachen und kennt die Hürden einer Bewerbung in Deutschland aus eigener Erfahrung. Deshalb machen wir deine Unterlagen nach deutschem Standard fertig und geben dir ein Werkzeug, mit dem du selbst passende Stellen findest. Bewerben tust du dich selbst. Und wir sagen dir offen, was wir nicht können.",
    ],
    contactTitle: "Kontakt", contactLead: "Du hast eine Frage zu Unterlagen oder Werkzeug? Schreib uns oder ruf an.",
    hours: "Mo bis Fr, 9 bis 18 Uhr",
    footerService: "Angebot", footerLegal: "Rechtliches", book: "Jetzt buchen",
  },
  en: {
    navOffer: "Offer", navCheck: "Self-check", navSteps: "How it works", navFaq: "FAQ", navContact: "Contact",
    aboutTitle: "About WoYou",
    about: [
      "WoYou has been around since 2018. We help people from abroad apply properly in Germany.",
      "Our team speaks many languages and knows the hurdles of applying in Germany first-hand. That is why we get your documents ready to German standards and give you a tool to find suitable jobs yourself. You apply yourself. And we tell you openly what we cannot do.",
    ],
    contactTitle: "Contact", contactLead: "Do you have a question about your documents or the tool? Write to us or give us a call.",
    hours: "Mon to Fri, 9 am to 6 pm",
    footerService: "Offer", footerLegal: "Legal", book: "Book now",
  },
  fr: {
    navOffer: "Offre", navCheck: "Auto-test", navSteps: "Déroulement", navFaq: "FAQ", navContact: "Contact",
    aboutTitle: "À propos de WoYou",
    about: [
      "WoYou existe depuis 2018. Nous aidons les personnes venant de l'étranger à bien postuler en Allemagne.",
      "Notre équipe parle de nombreuses langues et connaît les obstacles d'une candidature en Allemagne. C'est pourquoi nous préparons votre dossier aux normes allemandes et vous donnons un outil pour trouver vous-même des offres adaptées. Vous postulez vous-même, et nous vous disons franchement ce que nous ne pouvons pas faire.",
    ],
    contactTitle: "Contact", contactLead: "Une question sur votre dossier ou l'outil ? Écrivez-nous ou appelez-nous.",
    hours: "Lun. au ven., 9 h à 18 h",
    footerService: "Offre", footerLegal: "Mentions légales", book: "Réserver",
  },
  ar: {
    navOffer: "العرض", navCheck: "الاختبار الذاتي", navSteps: "طريقة العمل", navFaq: "الأسئلة الشائعة", navContact: "اتصل بنا",
    aboutTitle: "عن WoYou",
    about: [
      "تأسست WoYou عام 2018. نساعد القادمين من الخارج على التقديم بشكل صحيح في ألمانيا.",
      "يتحدث فريقنا لغات عديدة ويعرف صعوبات التقديم في ألمانيا من تجربته. لذلك نجهّز ملفك بالمعايير الألمانية ونمنحك أداة تجد بها بنفسك الوظائف المناسبة. أنت من يقدّم الطلبات، ونخبرك بصراحة بما لا نستطيع فعله.",
    ],
    contactTitle: "اتصل بنا", contactLead: "لديك سؤال عن ملفك أو الأداة؟ راسلنا أو اتصل بنا.",
    hours: "من الاثنين إلى الجمعة، 9 إلى 18",
    footerService: "العرض", footerLegal: "معلومات قانونية", book: "احجز الآن",
  },
  hi: {
    navOffer: "ऑफ़र", navCheck: "सेल्फ-चेक", navSteps: "प्रक्रिया", navFaq: "सामान्य प्रश्न", navContact: "संपर्क",
    aboutTitle: "WoYou के बारे में",
    about: [
      "WoYou 2018 से है। हम विदेश के लोगों को जर्मनी में सही तरीके से आवेदन करने में मदद करते हैं।",
      "हमारी टीम कई भाषाएँ बोलती है और जर्मनी में आवेदन की मुश्किलों को अपने अनुभव से जानती है। इसलिए हम आपके दस्तावेज़ जर्मन मानक के अनुसार तैयार करते हैं और आपको एक टूल देते हैं, जिससे आप ख़ुद सही नौकरियाँ खोजते हैं। आवेदन आप ख़ुद भेजते हैं, और हम साफ़ बताते हैं कि हम क्या नहीं कर सकते।",
    ],
    contactTitle: "संपर्क", contactLead: "दस्तावेज़ों या टूल के बारे में कोई सवाल? हमें लिखें या फ़ोन करें।",
    hours: "सोमवार से शुक्रवार, सुबह 9 से शाम 6 बजे (जर्मन समय)",
    footerService: "ऑफ़र", footerLegal: "कानूनी जानकारी", book: "अभी बुक करें",
  },
  // sr/te: Übersetzung bitte von Muttersprachler:in prüfen lassen (sr in lateinischer Schrift)
  sr: {
    navOffer: "Ponuda", navCheck: "Samoprovera", navSteps: "Kako ide", navFaq: "Česta pitanja", navContact: "Kontakt",
    aboutTitle: "O WoYou",
    about: [
      "WoYou postoji od 2018. godine. Pomažemo ljudima iz inostranstva da se u Nemačkoj ispravno prijave za posao.",
      "Naš tim govori mnogo jezika i iz sopstvenog iskustva poznaje prepreke pri prijavi za posao u Nemačkoj. Zato pripremamo tvoja dokumenta prema nemačkom standardu i dajemo ti alat kojim ti pronalaziš odgovarajuće poslove. Prijavu šalješ ti. I otvoreno ti kažemo šta ne možemo.",
    ],
    contactTitle: "Kontakt", contactLead: "Imaš pitanje o dokumentima ili alatu? Piši nam ili nas pozovi.",
    hours: "Pon. do pet., od 9 do 18 časova (nemačko vreme)",
    footerService: "Ponuda", footerLegal: "Pravne informacije", book: "Naruči sada",
  },
  te: {
    navOffer: "ఆఫర్", navCheck: "సెల్ఫ్-చెక్", navSteps: "ప్రక్రియ", navFaq: "తరచుగా అడిగే ప్రశ్నలు", navContact: "సంప్రదించండి",
    aboutTitle: "WoYou గురించి",
    about: [
      "WoYou 2018 నుండి ఉంది. విదేశాల నుండి వచ్చే వారు జర్మనీలో సరైన పద్ధతిలో దరఖాస్తు చేయడానికి మేము సహాయం చేస్తాము.",
      "మా టీమ్ చాలా భాషలు మాట్లాడుతుంది, జర్మనీలో దరఖాస్తు చేయడంలో ఉండే ఇబ్బందులు స్వంత అనుభవంతో తెలుసు. అందుకే మేము మీ పత్రాలను జర్మన్ ప్రమాణాల ప్రకారం సిద్ధం చేసి, సరైన ఉద్యోగాలను మీరే వెతుక్కునేందుకు ఒక టూల్ ఇస్తాము. దరఖాస్తులు మీరే పంపుతారు. మేము ఏమి చేయలేమో కూడా స్పష్టంగా చెబుతాము.",
    ],
    contactTitle: "సంప్రదించండి", contactLead: "పత్రాలు లేదా టూల్ గురించి ఏదైనా ప్రశ్న ఉందా? మాకు రాయండి లేదా ఫోన్ చేయండి.",
    hours: "సోమవారం నుండి శుక్రవారం, ఉదయం 9 నుండి సాయంత్రం 6 వరకు (జర్మన్ సమయం)",
    footerService: "ఆఫర్", footerLegal: "చట్టపరమైన సమాచారం", book: "ఇప్పుడే బుక్ చేయండి",
  },
};
export const siteText = (locale: string) => SITE_TEXT[(locale in SITE_TEXT ? locale : locale === "de" ? "de" : "en") as L];
