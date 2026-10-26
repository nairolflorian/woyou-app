// Kurze Texte zum Verbraucherrecht in allen Sprachen der Oberfläche: „inkl. USt“, Hinweise auf der Bestellseite,
// Fußzeile (Widerrufsbelehrung, Vertrag widerrufen, Verträge hier kündigen), Kundenbereich, Hinweis in der Mail.
// Die Rechtstexte selbst (AGB, Widerrufsbelehrung, Formulare) gibt es nur auf Deutsch (Vertragssprache).
// Auf Deutsch sind die Beschriftungen der Knöpfe gesetzlich vorgegeben und müssen genau so lauten (siehe KNOPF in vertrag.ts).
// Übersetzung bitte von Muttersprachler:in prüfen lassen (ar, hi, sr, te). Textregeln: keine langen Striche, du-Form, fr in vous.
import { KNOPF } from "@/lib/recht/vertrag";

type L = "de" | "en" | "fr" | "ar" | "hi" | "sr" | "te";
export type RechtUi = {
  /** neben dem Preis */
  vat: string;
  footerWiderrufsbelehrung: string;
  footerWiderrufen: string;
  footerKuendigen: string;
  /** Hinweis, dass die Rechtsseiten auf Deutsch sind */
  germanOnly: string;
  /** Bestellseite. Platzhalter: {n} Werktage, {months} Monate, {btn} Beschriftung des Buchungsknopfs */
  notesTitle: string;
  noteDelivery: string;
  noteContract: string;
  noteCheck: string;
  noteStored: string;
  noteLanguage: string;
  noteWiderruf: string;
  linkWiderruf: string;
  /** Kundenbereich */
  profileTitle: string;
  profileLead: string;
  profileWiderrufHint: string;
  bookingNo: string;
  /** Mail: Hinweis vor dem deutschen Rechtsteil */
  mailLegalIntro: string;
};

const T: Record<L, RechtUi> = {
  de: {
    vat: "inkl. USt",
    footerWiderrufsbelehrung: "Widerrufsbelehrung", footerWiderrufen: KNOPF.widerrufen, footerKuendigen: KNOPF.kuendigen,
    germanOnly: "",
    notesTitle: "Gut zu wissen vor der Buchung",
    noteDelivery: "Lieferzeit: Deine Unterlagen sind fertig innerhalb von {n} Werktagen, nachdem du die vollständige Mappe eingereicht hast. Das Werkzeug schalten wir nach der Zahlung sofort für {months} Monate frei.",
    noteContract: "Mit dem Klick auf „{btn}“ buchst du verbindlich. Der Vertrag kommt mit unserer Buchungsbestätigung per E-Mail zustande.",
    noteCheck: "Vor dem Klick kannst du alle Angaben auf dieser Seite prüfen und ändern.",
    noteStored: "Den Vertragstext speichern wir und schicken ihn dir mit AGB und Widerrufsbelehrung per E-Mail.",
    noteLanguage: "Der Vertrag wird auf Deutsch geschlossen.",
    noteWiderruf: "Die Widerrufsbelehrung kannst du schon jetzt lesen:",
    linkWiderruf: "Widerrufsbelehrung",
    profileTitle: "Dein Vertrag",
    profileLead: "Widerrufen oder kündigen geht jederzeit online, ohne Anmeldung.",
    profileWiderrufHint: "Deine Widerrufsfrist läuft noch bis {date}.",
    bookingNo: "Buchungsnummer",
    mailLegalIntro: "",
  },
  en: {
    vat: "incl. VAT",
    footerWiderrufsbelehrung: "Right of withdrawal", footerWiderrufen: "Withdraw from contract", footerKuendigen: "Cancel contracts here",
    germanOnly: "The contract language is German, so this page is in German.",
    notesTitle: "Good to know before you book",
    noteDelivery: "Delivery time: your documents are ready within {n} working days after you have submitted your complete application folder. We unlock the tool for {months} months right after payment.",
    noteContract: "By clicking “{btn}” you book with obligation to pay. The contract is concluded with our booking confirmation by e-mail.",
    noteCheck: "Before clicking, you can check and change all your details on this page.",
    noteStored: "We store the contract text and send it to you by e-mail together with the terms and conditions and the cancellation policy.",
    noteLanguage: "The contract is concluded in German.",
    noteWiderruf: "You can read the cancellation policy before booking:",
    linkWiderruf: "Right of withdrawal (German)",
    profileTitle: "Your contract",
    profileLead: "You can withdraw or cancel online at any time, without logging in.",
    profileWiderrufHint: "Your withdrawal period runs until {date}.",
    bookingNo: "Booking number",
    mailLegalIntro: "Below you find your contract, our terms and conditions and the cancellation policy in German, the contract language.",
  },
  fr: {
    vat: "TVA incluse",
    footerWiderrufsbelehrung: "Droit de rétractation", footerWiderrufen: "Se rétracter du contrat", footerKuendigen: "Résilier vos contrats ici",
    germanOnly: "La langue du contrat est l'allemand, cette page est donc en allemand.",
    notesTitle: "Bon à savoir avant de réserver",
    noteDelivery: "Délai : vos documents sont prêts dans les {n} jours ouvrés après l'envoi de votre dossier complet. Nous activons l'outil pour {months} mois juste après le paiement.",
    noteContract: "En cliquant sur « {btn} », vous réservez avec obligation de paiement. Le contrat est conclu avec notre confirmation de réservation par e-mail.",
    noteCheck: "Avant de cliquer, vous pouvez vérifier et modifier toutes vos informations sur cette page.",
    noteStored: "Nous enregistrons le texte du contrat et vous l'envoyons par e-mail avec les CGV et les informations sur la rétractation.",
    noteLanguage: "Le contrat est conclu en allemand.",
    noteWiderruf: "Vous pouvez lire les informations sur la rétractation avant de réserver :",
    linkWiderruf: "Droit de rétractation (en allemand)",
    profileTitle: "Votre contrat",
    profileLead: "Vous pouvez vous rétracter ou résilier en ligne à tout moment, sans vous connecter.",
    profileWiderrufHint: "Votre délai de rétractation court jusqu'au {date}.",
    bookingNo: "Numéro de réservation",
    mailLegalIntro: "Vous trouverez ci-dessous votre contrat, nos CGV et les informations sur la rétractation en allemand, la langue du contrat.",
  },
  ar: {
    vat: "شامل ضريبة القيمة المضافة",
    footerWiderrufsbelehrung: "حق الانسحاب", footerWiderrufen: "الانسحاب من العقد", footerKuendigen: "إنهاء العقود هنا",
    germanOnly: "لغة العقد هي الألمانية، لذلك هذه الصفحة بالألمانية.",
    notesTitle: "معلومات مهمة قبل الحجز",
    noteDelivery: "مدة التسليم: تصبح مستنداتك جاهزة خلال {n} أيام عمل بعد أن ترسل ملف التقديم كاملًا. نفعّل الأداة لمدة {months} أشهر مباشرة بعد الدفع.",
    noteContract: "بالنقر على «{btn}» تحجز حجزًا ملزمًا بالدفع. يُبرم العقد مع تأكيد الحجز الذي نرسله بالبريد الإلكتروني.",
    noteCheck: "قبل النقر يمكنك مراجعة كل بياناتك في هذه الصفحة وتغييرها.",
    noteStored: "نحفظ نص العقد ونرسله إليك بالبريد الإلكتروني مع الشروط العامة ومعلومات حق الانسحاب.",
    noteLanguage: "يُبرم العقد باللغة الألمانية.",
    noteWiderruf: "يمكنك قراءة معلومات حق الانسحاب قبل الحجز:",
    linkWiderruf: "حق الانسحاب (بالألمانية)",
    profileTitle: "عقدك",
    profileLead: "يمكنك الانسحاب أو الإنهاء عبر الإنترنت في أي وقت، دون تسجيل الدخول.",
    profileWiderrufHint: "مهلة الانسحاب سارية حتى {date}.",
    bookingNo: "رقم الحجز",
    mailLegalIntro: "تجد أدناه عقدك والشروط العامة ومعلومات حق الانسحاب باللغة الألمانية، لغة العقد.",
  },
  hi: {
    vat: "VAT सहित",
    footerWiderrufsbelehrung: "वापसी के अधिकार की जानकारी", footerWiderrufen: "अनुबंध वापस लें", footerKuendigen: "अनुबंध यहाँ रद्द करें",
    germanOnly: "अनुबंध की भाषा जर्मन है, इसलिए यह पेज जर्मन में है।",
    notesTitle: "बुक करने से पहले जानने लायक बातें",
    noteDelivery: "समय: पूरी आवेदन फ़ाइल जमा करने के बाद {n} कार्यदिवसों के भीतर आपके दस्तावेज़ तैयार हो जाते हैं। भुगतान के तुरंत बाद हम टूल {months} महीनों के लिए चालू कर देते हैं।",
    noteContract: "“{btn}” पर क्लिक करके आप भुगतान के साथ पक्की बुकिंग करते हैं। अनुबंध ई-मेल से भेजी गई हमारी बुकिंग पुष्टि के साथ बनता है।",
    noteCheck: "क्लिक करने से पहले आप इस पेज पर अपनी सारी जानकारी जाँच और बदल सकते हैं।",
    noteStored: "हम अनुबंध का पाठ सहेजते हैं और उसे नियम और शर्तों तथा वापसी के अधिकार की जानकारी के साथ ई-मेल से भेजते हैं।",
    noteLanguage: "अनुबंध जर्मन भाषा में होता है।",
    noteWiderruf: "वापसी के अधिकार की जानकारी आप बुक करने से पहले पढ़ सकते हैं:",
    linkWiderruf: "वापसी का अधिकार (जर्मन में)",
    profileTitle: "आपका अनुबंध",
    profileLead: "आप कभी भी ऑनलाइन, बिना लॉग इन किए, अनुबंध वापस ले सकते हैं या रद्द कर सकते हैं।",
    profileWiderrufHint: "आपकी वापसी की अवधि {date} तक है।",
    bookingNo: "बुकिंग नंबर",
    mailLegalIntro: "नीचे आपका अनुबंध, हमारे नियम और शर्तें और वापसी के अधिकार की जानकारी जर्मन में है, जो अनुबंध की भाषा है।",
  },
  sr: {
    vat: "uključen PDV",
    footerWiderrufsbelehrung: "Pravo na odustanak", footerWiderrufen: "Odustani od ugovora", footerKuendigen: "Otkaži ugovore ovde",
    germanOnly: "Jezik ugovora je nemački, zato je ova stranica na nemačkom.",
    notesTitle: "Dobro je da znaš pre narudžbine",
    noteDelivery: "Rok: tvoja dokumenta su gotova u roku od {n} radnih dana nakon što pošalješ kompletnu fasciklu. Alat otključavamo odmah posle plaćanja na {months} meseca.",
    noteContract: "Klikom na „{btn}“ naručuješ uz obavezu plaćanja. Ugovor nastaje našom potvrdom narudžbine putem e-pošte.",
    noteCheck: "Pre klika možeš da proveriš i promeniš sve podatke na ovoj stranici.",
    noteStored: "Tekst ugovora čuvamo i šaljemo ti ga e-poštom zajedno sa opštim uslovima i poukom o pravu na odustanak.",
    noteLanguage: "Ugovor se zaključuje na nemačkom jeziku.",
    noteWiderruf: "Pouku o pravu na odustanak možeš da pročitaš već sada:",
    linkWiderruf: "Pravo na odustanak (na nemačkom)",
    profileTitle: "Tvoj ugovor",
    profileLead: "Odustanak ili otkaz možeš uvek da pošalješ onlajn, bez prijave.",
    profileWiderrufHint: "Tvoj rok za odustanak traje do {date}.",
    bookingNo: "Broj narudžbine",
    mailLegalIntro: "U nastavku su tvoj ugovor, naši opšti uslovi i pouka o pravu na odustanak na nemačkom, jeziku ugovora.",
  },
  te: {
    vat: "VAT సహా",
    footerWiderrufsbelehrung: "ఉపసంహరణ హక్కు సమాచారం", footerWiderrufen: "ఒప్పందం నుండి ఉపసంహరించుకోండి", footerKuendigen: "ఒప్పందాలను ఇక్కడ రద్దు చేయండి",
    germanOnly: "ఒప్పంద భాష జర్మన్, అందుకే ఈ పేజీ జర్మన్‌లో ఉంది.",
    notesTitle: "బుక్ చేసే ముందు తెలుసుకోవలసినవి",
    noteDelivery: "సమయం: పూర్తి దరఖాస్తు ఫైల్ సమర్పించిన తర్వాత {n} పని దినాల్లో మీ పత్రాలు సిద్ధమవుతాయి. చెల్లింపు అయిన వెంటనే టూల్‌ను {months} నెలల పాటు యాక్టివ్ చేస్తాము.",
    noteContract: "“{btn}” పై క్లిక్ చేస్తే మీరు చెల్లింపుతో కట్టుబడి బుక్ చేస్తారు. ఇమెయిల్ ద్వారా మా బుకింగ్ నిర్ధారణతో ఒప్పందం ఏర్పడుతుంది.",
    noteCheck: "క్లిక్ చేసే ముందు ఈ పేజీలో మీ వివరాలన్నీ తనిఖీ చేసి మార్చుకోవచ్చు.",
    noteStored: "ఒప్పంద పాఠాన్ని మేము భద్రపరుస్తాము, నిబంధనలు మరియు ఉపసంహరణ సమాచారంతో కలిపి ఇమెయిల్‌లో పంపుతాము.",
    noteLanguage: "ఒప్పందం జర్మన్ భాషలో జరుగుతుంది.",
    noteWiderruf: "ఉపసంహరణ హక్కు సమాచారాన్ని బుక్ చేసే ముందే చదవవచ్చు:",
    linkWiderruf: "ఉపసంహరణ హక్కు (జర్మన్‌లో)",
    profileTitle: "మీ ఒప్పందం",
    profileLead: "లాగిన్ అవసరం లేకుండా ఎప్పుడైనా ఆన్‌లైన్‌లో ఉపసంహరించుకోవచ్చు లేదా రద్దు చేయవచ్చు.",
    profileWiderrufHint: "మీ ఉపసంహరణ గడువు {date} వరకు ఉంది.",
    bookingNo: "బుకింగ్ నంబర్",
    mailLegalIntro: "క్రింద మీ ఒప్పందం, మా నిబంధనలు మరియు ఉపసంహరణ హక్కు సమాచారం ఒప్పంద భాష అయిన జర్మన్‌లో ఉన్నాయి.",
  },
};

export const rechtUi = (locale?: string | null): RechtUi => T[(locale && locale in T ? locale : locale ? "en" : "de") as L];
export const RECHT_UI_SPRACHEN = Object.keys(T) as L[];
