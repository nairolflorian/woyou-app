// Texte für das Einwilligungs-Banner (nur sichtbar, wenn META_PIXEL_ID oder GOOGLE_TAG_ID gesetzt ist).
// fr in der Sie-Form (vous), sr in lateinischer Schrift mit „ti“. ar/hi/sr/te: bitte von Muttersprachler:in prüfen lassen.
// Andere Seitensprachen (es, ru, uk) bekommen Englisch.
import type { CheckLang } from "./selfcheck";

export type ConsentText = {
  title: string; body: string;
  accept: string; reject: string; settings: string; save: string;
  necessary: string; necessaryDesc: string; alwaysOn: string;
  marketing: string; marketingDesc: string;
  privacy: string; footer: string;
};

export const CONSENT_TEXT: Record<CheckLang, ConsentText> = {
  de: {
    title: "Cookies und Datenschutz",
    body: "Wir nutzen technisch notwendige Cookies für Anmeldung und Sprachwahl. Mit deiner Einwilligung setzen wir außerdem Cookies von Meta und Google ein. Damit messen wir, wie gut unsere Anzeigen funktionieren, und können dir passende Werbung zeigen. Dabei können Daten in die USA übertragen werden. Deine Wahl kannst du jederzeit unten auf der Seite unter „Cookie-Einstellungen“ ändern.",
    accept: "Alle akzeptieren", reject: "Nur notwendige", settings: "Einstellungen", save: "Auswahl speichern",
    necessary: "Notwendig", necessaryDesc: "Anmeldung, Sprachwahl und deine Cookie-Wahl.", alwaysOn: "immer an",
    marketing: "Statistik und Werbung (Meta, Google)",
    marketingDesc: "Meta Pixel und Google-Tag zählen Besuche und Erfolge unserer Anzeigen und ermöglichen Werbung für Menschen, die unsere Seite besucht haben.",
    privacy: "Mehr in der Datenschutzerklärung", footer: "Cookie-Einstellungen",
  },
  en: {
    title: "Cookies and privacy",
    body: "We use cookies that are needed for login and your language. With your consent we also use cookies from Meta and Google. They help us measure how well our ads work and show you relevant ads. Data may be transferred to the USA. You can change your choice at any time at the bottom of the page under \"Cookie settings\".",
    accept: "Accept all", reject: "Necessary only", settings: "Settings", save: "Save choice",
    necessary: "Necessary", necessaryDesc: "Login, language and your cookie choice.", alwaysOn: "always on",
    marketing: "Statistics and advertising (Meta, Google)",
    marketingDesc: "Meta Pixel and Google tag count visits and the results of our ads and allow ads for people who have visited our site.",
    privacy: "More in our privacy policy", footer: "Cookie settings",
  },
  fr: {
    title: "Cookies et confidentialité",
    body: "Nous utilisons des cookies nécessaires pour la connexion et la langue. Avec votre accord, nous utilisons aussi des cookies de Meta et de Google. Ils nous permettent de mesurer l'efficacité de nos annonces et de vous montrer des publicités adaptées. Des données peuvent être transférées aux États-Unis. Vous pouvez modifier votre choix à tout moment en bas de la page, dans « Paramètres des cookies ».",
    accept: "Tout accepter", reject: "Seulement les nécessaires", settings: "Paramètres", save: "Enregistrer le choix",
    necessary: "Nécessaires", necessaryDesc: "Connexion, langue et votre choix de cookies.", alwaysOn: "toujours actifs",
    marketing: "Statistiques et publicité (Meta, Google)",
    marketingDesc: "Le pixel Meta et la balise Google comptent les visites et les résultats de nos annonces et permettent de montrer des publicités aux personnes qui ont visité notre site.",
    privacy: "Plus d'informations dans notre politique de confidentialité", footer: "Paramètres des cookies",
  },
  ar: {
    title: "ملفات تعريف الارتباط والخصوصية",
    body: "نستخدم ملفات تعريف الارتباط الضرورية لتسجيل الدخول واختيار اللغة. وبموافقتك نستخدم أيضًا ملفات تعريف الارتباط من Meta وGoogle. بها نقيس مدى نجاح إعلاناتنا ونعرض لك إعلانات مناسبة. قد يتم نقل بيانات إلى الولايات المتحدة. يمكنك تغيير اختيارك في أي وقت أسفل الصفحة من خلال «إعدادات ملفات تعريف الارتباط».",
    accept: "قبول الكل", reject: "الضرورية فقط", settings: "الإعدادات", save: "حفظ الاختيار",
    necessary: "ضرورية", necessaryDesc: "تسجيل الدخول واللغة واختيارك لملفات تعريف الارتباط.", alwaysOn: "مفعّلة دائمًا",
    marketing: "الإحصاءات والإعلانات (Meta، Google)",
    marketingDesc: "يقيس Meta Pixel ووسم Google الزيارات ونتائج إعلاناتنا، ويتيحان عرض إعلانات لمن زار موقعنا.",
    privacy: "المزيد في سياسة الخصوصية", footer: "إعدادات ملفات تعريف الارتباط",
  },
  hi: {
    title: "कुकीज़ और गोपनीयता",
    body: "हम लॉगिन और भाषा के लिए ज़रूरी कुकीज़ का उपयोग करते हैं। आपकी सहमति से हम Meta और Google की कुकीज़ भी इस्तेमाल करते हैं। इनसे हम मापते हैं कि हमारे विज्ञापन कितने अच्छे काम करते हैं और आपको उपयुक्त विज्ञापन दिखा सकते हैं। इसमें डेटा अमेरिका भेजा जा सकता है। आप अपनी पसंद कभी भी पेज के नीचे \"कुकी सेटिंग्स\" में बदल सकते हैं।",
    accept: "सभी स्वीकार करें", reject: "केवल ज़रूरी", settings: "सेटिंग्स", save: "पसंद सहेजें",
    necessary: "ज़रूरी", necessaryDesc: "लॉगिन, भाषा और आपकी कुकी पसंद।", alwaysOn: "हमेशा चालू",
    marketing: "आँकड़े और विज्ञापन (Meta, Google)",
    marketingDesc: "Meta Pixel और Google टैग विज़िट और हमारे विज्ञापनों के नतीजे गिनते हैं और हमारी साइट पर आए लोगों को विज्ञापन दिखाना संभव बनाते हैं।",
    privacy: "अधिक जानकारी गोपनीयता नीति में", footer: "कुकी सेटिंग्स",
  },
  sr: {
    title: "Kolačići i privatnost",
    body: "Koristimo neophodne kolačiće za prijavu i izbor jezika. Uz tvoju saglasnost koristimo i kolačiće kompanija Meta i Google. Pomoću njih merimo koliko dobro rade naši oglasi i možemo da ti prikažemo odgovarajuće oglase. Pri tome se podaci mogu preneti u SAD. Svoj izbor možeš da promeniš bilo kada na dnu stranice pod „Podešavanja kolačića“.",
    accept: "Prihvati sve", reject: "Samo neophodni", settings: "Podešavanja", save: "Sačuvaj izbor",
    necessary: "Neophodni", necessaryDesc: "Prijava, jezik i tvoj izbor kolačića.", alwaysOn: "uvek uključeni",
    marketing: "Statistika i oglašavanje (Meta, Google)",
    marketingDesc: "Meta Pixel i Google oznaka broje posete i uspeh naših oglasa i omogućavaju oglase za ljude koji su posetili naš sajt.",
    privacy: "Više u politici privatnosti", footer: "Podešavanja kolačića",
  },
  te: {
    title: "కుకీలు మరియు గోప్యత",
    body: "లాగిన్ మరియు భాష కోసం అవసరమైన కుకీలను మేము ఉపయోగిస్తాము. మీ అనుమతితో Meta మరియు Google కుకీలను కూడా ఉపయోగిస్తాము. వాటితో మా ప్రకటనలు ఎంత బాగా పనిచేస్తున్నాయో కొలుస్తాము మరియు మీకు సరిపోయే ప్రకటనలు చూపించగలము. ఇందులో డేటా అమెరికాకు బదిలీ కావచ్చు. మీ ఎంపికను ఎప్పుడైనా పేజీ కింద \"కుకీ సెట్టింగ్‌లు\"లో మార్చవచ్చు.",
    accept: "అన్నీ అంగీకరించండి", reject: "అవసరమైనవి మాత్రమే", settings: "సెట్టింగ్‌లు", save: "ఎంపికను సేవ్ చేయండి",
    necessary: "అవసరమైనవి", necessaryDesc: "లాగిన్, భాష మరియు మీ కుకీ ఎంపిక.", alwaysOn: "ఎల్లప్పుడూ ఆన్",
    marketing: "గణాంకాలు మరియు ప్రకటనలు (Meta, Google)",
    marketingDesc: "Meta Pixel మరియు Google ట్యాగ్ సందర్శనలను, మా ప్రకటనల ఫలితాలను లెక్కిస్తాయి మరియు మా సైట్‌ను సందర్శించిన వారికి ప్రకటనలు చూపించడానికి వీలు కల్పిస్తాయి.",
    privacy: "మరిన్ని వివరాలు గోప్యతా విధానంలో", footer: "కుకీ సెట్టింగ్‌లు",
  },
};

export const CONSENT_SPRACHEN = Object.keys(CONSENT_TEXT) as CheckLang[];
export const consentText = (locale: string): ConsentText =>
  CONSENT_TEXT[(CONSENT_SPRACHEN as string[]).includes(locale) ? (locale as CheckLang) : "en"];
