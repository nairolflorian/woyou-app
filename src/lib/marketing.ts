import "server-only";

// Marketingstrecke: automatische Hinweis-Mails entlang des Kundenwegs (Registrierung → Buchung → Mappe → Werkzeug).
// Weg 1 (22.10.2026): keine Versprechen zu Bewerbungen durch WoYou mehr, nur Unterlagen und Werkzeug.
// Die Mails werten den privaten Tracker der Kund:innen bewusst NICHT aus (nur Buchung, Mappe, Werkzeug-Laufzeit).
// Läuft täglich über /api/cron/marketing. Verschickt wird nur, wenn SMTP eingerichtet ist und MARKETING_MAILS nicht "off" ist.
// Jede Person bekommt je Schritt höchstens eine Mail und pro Lauf höchstens eine. Abmeldelink in jeder Mail.
// Deutsch, Englisch, Französisch, Arabisch (Mail rechts nach links) und Hindi; alle anderen Sprachen bekommen die englische Fassung.
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail, layout, mailEnabled } from "@/lib/mail";
import { ROLE } from "@/lib/enums";
import { BOOKING_STATUS } from "@/lib/services";
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { arMonths, dateLocaleOf, dirOf } from "@/lib/werkzeug-text";

type Lang = "de" | "en" | "fr" | "ar" | "hi";
type Text = { subject: string; title: string; paras: string[]; button: string };
type Step = { key: string; name: string; when: string; path: string; text: Record<Lang, (v: Vars) => Text> };
type Vars = { name: string; price: string; months: number; until: string };

const day = 864e5;
const base = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const secret = () => process.env.SESSION_PASSWORD || "woyou-demo-secret-please-change-me-32-characters-long-x";
export const unsubToken = (userId: string) => crypto.createHmac("sha256", secret()).update(`unsub:${userId}`).digest("base64url").slice(0, 32);
export const unsubUrl = (userId: string) => `${base()}/abmelden?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;
export const marketingActive = () => mailEnabled() && process.env.MARKETING_MAILS !== "off";

export const STEPS: Step[] = [
  {
    key: "REG_1", name: "Registriert, noch nicht gebucht (Tag 1)", when: "1 Tag nach Registrierung, keine Buchung", path: "/#angebot",
    text: {
      de: (v) => ({ subject: "Deine Bewerbungsunterlagen nach deutschem Standard", title: `Hallo ${v.name},`, paras: ["schön, dass du bei WoYou bist. Viele Bewerbungen aus dem Ausland scheitern an Kleinigkeiten: falsches Format, fehlende Angaben, kein passendes Anschreiben.", `Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Das Startpaket kostet einmalig ${v.price} und enthält ${v.months} Monate Werkzeug.`], button: "Startpaket ansehen" }),
      en: (v) => ({ subject: "Your application documents to German standards", title: `Hi ${v.name},`, paras: ["Great to have you at WoYou. Many applications from abroad fail on small things: the wrong format, missing details, no suitable cover letter.", `We create your application documents to German standards and give you a tool to find suitable jobs and apply yourself. The starter package costs ${v.price} once and includes ${v.months} months of the tool.`], button: "See the starter package" }),
      fr: (v) => ({ subject: "Votre dossier de candidature aux normes allemandes", title: `Bonjour ${v.name},`, paras: ["Ravis de vous compter chez WoYou. Beaucoup de candidatures venant de l'étranger échouent pour des détails : mauvais format, informations manquantes, pas de lettre adaptée.", `Nous créons votre dossier de candidature aux normes allemandes et vous donnons un outil pour trouver des offres adaptées et postuler vous-même. Le pack de départ coûte ${v.price} une seule fois et comprend ${v.months} mois d'outil.`], button: "Voir le pack de départ" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "مستندات التقديم الخاصة بك بالمعايير الألمانية", title: `مرحبًا ${v.name}،`, paras: ["يسعدنا انضمامك إلى WoYou. كثير من الطلبات من الخارج تفشل بسبب تفاصيل صغيرة: تنسيق خاطئ، أو معلومات ناقصة، أو غياب رسالة تحفيز مناسبة.", `نُعدّ مستندات التقديم الخاصة بك بالمعايير الألمانية، ونعطيك أداة تجد بها وظائف مناسبة وتتقدّم إليها بنفسك. باقة البداية تكلّف ${v.price} مرة واحدة وتشمل ${arMonths(v.months)} من الأداة.`], button: "عرض باقة البداية" }),
      hi: (v) => ({ subject: "जर्मन मानक के अनुसार आपके आवेदन दस्तावेज़", title: `नमस्ते ${v.name},`, paras: ["WoYou पर आपका स्वागत है। विदेश से आने वाले कई आवेदन छोटी-छोटी बातों पर अटक जाते हैं: ग़लत फ़ॉर्मैट, अधूरी जानकारी, कोई उपयुक्त कवर लेटर नहीं।", `हम जर्मन मानक के अनुसार आपके आवेदन दस्तावेज़ बनाते हैं और आपको एक टूल देते हैं, जिससे आप उपयुक्त नौकरियाँ ढूँढते हैं और ख़ुद आवेदन करते हैं। स्टार्टर पैकेज की कीमत एक बार ${v.price} है और इसमें ${v.months} महीने का टूल शामिल है।`], button: "स्टार्टर पैकेज देखें" }),
    },
  },
  {
    key: "REG_3", name: "Registriert, noch nicht gebucht (Tag 3)", when: "3 Tage nach Registrierung, keine Buchung", path: "/#ablauf",
    text: {
      de: (v) => ({ subject: "So funktioniert WoYou", title: `Hallo ${v.name},`, paras: ["kurz erklärt: Du füllst deine Bewerbungsmappe aus oder lädst deinen Lebenslauf hoch. Wir prüfen alles und machen deine Unterlagen fertig. Im Werkzeug suchst du dann selbst Stellen, erstellst für jede ein Anschreiben und bewirbst dich aus deinem eigenen Postfach. Die Antworten bekommst du direkt.", "Fragen? Antworte einfach auf diese Mail."], button: "Ablauf ansehen" }),
      en: (v) => ({ subject: "How WoYou works", title: `Hi ${v.name},`, paras: ["In short: you fill in your application folder or upload your CV. We check everything and get your documents ready. In the tool you then search for jobs yourself, create a cover letter for each and apply from your own inbox. Replies come straight to you.", "Questions? Just reply to this email."], button: "See how it works" }),
      fr: (v) => ({ subject: "Comment fonctionne WoYou", title: `Bonjour ${v.name},`, paras: ["En bref : vous remplissez votre dossier ou téléchargez votre CV. Nous vérifions tout et préparons vos documents. Dans l'outil, vous cherchez ensuite vous-même des offres, créez une lettre pour chacune et postulez depuis votre propre boîte e-mail. Les réponses vous arrivent directement.", "Des questions ? Répondez simplement à cet e-mail."], button: "Voir le déroulement" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "كيف تعمل WoYou", title: `مرحبًا ${v.name}،`, paras: ["باختصار: تملأ ملف التقديم أو ترفع سيرتك الذاتية. نراجع كل شيء ونجهّز مستنداتك. بعد ذلك تبحث بنفسك عن وظائف في الأداة، وتُنشئ لكل وظيفة رسالة تحفيز، وتتقدّم من بريدك الإلكتروني. وتصلك الردود مباشرة.", "لديك سؤال؟ رد على هذه الرسالة فقط."], button: "طريقة العمل" }),
      hi: (v) => ({ subject: "WoYou कैसे काम करता है", title: `नमस्ते ${v.name},`, paras: ["संक्षेप में: आप अपनी आवेदन फ़ाइल भरते हैं या अपना बायोडाटा अपलोड करते हैं। हम सब कुछ जाँचते हैं और आपके दस्तावेज़ तैयार करते हैं। फिर टूल में आप ख़ुद नौकरियाँ खोजते हैं, हर एक के लिए कवर लेटर बनाते हैं और अपने ईमेल से आवेदन करते हैं। जवाब सीधे आपको मिलते हैं।", "कोई सवाल? बस इस ईमेल का जवाब दें।"], button: "देखें, यह कैसे काम करता है" }),
    },
  },
  {
    key: "REG_7", name: "Registriert, noch nicht gebucht (Tag 7)", when: "7 Tage nach Registrierung, keine Buchung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Noch Fragen zu WoYou?", title: `Hallo ${v.name},`, paras: [`wir haben gesehen, dass du dich noch nicht entschieden hast. Das Startpaket kostet einmalig ${v.price} und enthält deine Unterlagen und ${v.months} Monate Bewerbungswerkzeug. Danach endet der Zugang von selbst, ohne Abo. Versteckte Kosten gibt es nicht.`, "Wenn dir etwas unklar ist, antworte auf diese Mail oder ruf uns an. Das ist unsere letzte Erinnerung."], button: "Jetzt buchen" }),
      en: (v) => ({ subject: "Any questions about WoYou?", title: `Hi ${v.name},`, paras: [`We noticed you haven't decided yet. The starter package costs ${v.price} once and includes your documents and ${v.months} months of the application tool. After that, access simply ends, with no subscription. No hidden costs.`, "If anything is unclear, reply to this email or call us. This is our last reminder."], button: "Book now" }),
      fr: (v) => ({ subject: "Des questions sur WoYou ?", title: `Bonjour ${v.name},`, paras: [`Vous n'avez pas encore réservé. Le pack de départ coûte ${v.price} une seule fois et comprend votre dossier et ${v.months} mois d'outil de candidature. Ensuite, l'accès s'arrête de lui-même, sans abonnement. Sans frais cachés.`, "Si quelque chose n'est pas clair, répondez à cet e-mail ou appelez-nous. C'est notre dernier rappel."], button: "Réserver" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "هل لديك أسئلة عن WoYou؟", title: `مرحبًا ${v.name}،`, paras: [`لاحظنا أنك لم تقرر بعد. باقة البداية تكلّف ${v.price} مرة واحدة وتشمل مستنداتك و${arMonths(v.months)} من أداة التقديم. بعدها ينتهي الوصول تلقائيًا، بلا اشتراك. لا توجد تكاليف مخفية.`, "إذا كان هناك ما هو غير واضح، رد على هذه الرسالة أو اتصل بنا. هذا آخر تذكير منا."], button: "احجز الآن" }),
      hi: (v) => ({ subject: "WoYou के बारे में कोई सवाल?", title: `नमस्ते ${v.name},`, paras: [`हमने देखा कि आपने अभी फ़ैसला नहीं किया है। स्टार्टर पैकेज की कीमत एक बार ${v.price} है और इसमें आपके दस्तावेज़ और ${v.months} महीने का आवेदन टूल शामिल है। उसके बाद पहुँच अपने-आप ख़त्म हो जाती है, कोई सदस्यता नहीं। कोई छिपा ख़र्च नहीं।`, "अगर कुछ साफ़ नहीं है, तो इस ईमेल का जवाब दें या हमें फ़ोन करें। यह हमारा आख़िरी रिमाइंडर है।"], button: "अभी बुक करें" }),
    },
  },
  {
    key: "PAY_1", name: "Gebucht, Zahlung offen", when: "1 Tag nach Buchung ohne Zahlung", path: "/bewerbungsservice/buchen",
    text: {
      de: (v) => ({ subject: "Deine Buchung wartet noch auf die Zahlung", title: `Hallo ${v.name},`, paras: ["du hast das Startpaket gebucht, die Zahlung ist aber noch nicht abgeschlossen. Sobald sie da ist, schalten wir dein Bewerbungswerkzeug frei."], button: "Zahlung abschließen" }),
      en: (v) => ({ subject: "Your booking is waiting for payment", title: `Hi ${v.name},`, paras: ["You booked the starter package, but the payment is not complete yet. As soon as it is, we unlock your application tool."], button: "Complete payment" }),
      fr: (v) => ({ subject: "Votre réservation attend le paiement", title: `Bonjour ${v.name},`, paras: ["Vous avez réservé le pack de départ, mais le paiement n'est pas encore finalisé. Dès qu'il l'est, nous activons votre outil de candidature."], button: "Finaliser le paiement" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "حجزك بانتظار الدفع", title: `مرحبًا ${v.name}،`, paras: ["لقد حجزت باقة البداية، لكن الدفع لم يكتمل بعد. بمجرد اكتماله نُفعّل أداة التقديم الخاصة بك."], button: "إتمام الدفع" }),
      hi: (v) => ({ subject: "आपकी बुकिंग भुगतान का इंतज़ार कर रही है", title: `नमस्ते ${v.name},`, paras: ["आपने स्टार्टर पैकेज बुक किया है, लेकिन भुगतान अभी पूरा नहीं हुआ है। भुगतान पूरा होते ही हम आपका आवेदन टूल चालू कर देंगे।"], button: "भुगतान पूरा करें" }),
    },
  },
  {
    key: "MAPPE_2", name: "Bezahlt, Mappe nicht eingereicht (Tag 2)", when: "2 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Deine Bewerbungsmappe fehlt noch", title: `Hallo ${v.name},`, paras: ["damit wir deine Unterlagen fertig machen können, brauchen wir deine Angaben: Berufserfahrung, Ausbildung, Sprachen. Das dauert etwa 15 Minuten. Du kannst auch einfach deinen eigenen Lebenslauf hochladen."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "Your application folder is still missing", title: `Hi ${v.name},`, paras: ["To get your documents ready, we need your details: work experience, education, languages. It takes about 15 minutes. You can also simply upload your own CV."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Votre dossier de candidature manque encore", title: `Bonjour ${v.name},`, paras: ["Pour préparer vos documents, nous avons besoin de vos informations : expérience, formation, langues. Cela prend environ 15 minutes. Vous pouvez aussi simplement télécharger votre CV."], button: "Remplir le dossier" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "ملف التقديم ما زال ناقصًا", title: `مرحبًا ${v.name}،`, paras: ["لكي نجهّز مستنداتك نحتاج بياناتك: الخبرة المهنية، والتكوين، واللغات. يستغرق ذلك حوالي 15 دقيقة. ويمكنك أيضًا رفع سيرتك الذاتية مباشرة."], button: "املأ الملف" }),
      hi: (v) => ({ subject: "आपकी आवेदन फ़ाइल अभी बाकी है", title: `नमस्ते ${v.name},`, paras: ["आपके दस्तावेज़ तैयार करने के लिए हमें आपकी जानकारी चाहिए: कार्य अनुभव, शिक्षा, भाषाएँ। इसमें लगभग 15 मिनट लगते हैं। आप चाहें तो सीधे अपना बायोडाटा भी अपलोड कर सकते हैं।"], button: "फ़ाइल भरें" }),
    },
  },
  {
    key: "MAPPE_5", name: "Bezahlt, Mappe nicht eingereicht (Tag 5)", when: "5 Tage nach Zahlung, Mappe nicht eingereicht", path: "/bewerbungsmappe",
    text: {
      de: (v) => ({ subject: "Wir warten auf deine Angaben", title: `Hallo ${v.name},`, paras: ["dein Startpaket ist bezahlt, aber wir können deine Unterlagen erst prüfen, wenn deine Mappe da ist. Die Stellensuche kannst du schon nutzen. Wenn du Hilfe brauchst, antworte auf diese Mail. Wir rufen dich gern an."], button: "Mappe ausfüllen" }),
      en: (v) => ({ subject: "We are waiting for your details", title: `Hi ${v.name},`, paras: ["Your starter package is paid, but we can only check your documents once your folder is complete. You can already use the job search. If you need help, reply to this email and we will call you."], button: "Fill in folder" }),
      fr: (v) => ({ subject: "Nous attendons vos informations", title: `Bonjour ${v.name},`, paras: ["Votre pack de départ est payé, mais nous ne pouvons vérifier vos documents qu'avec votre dossier. Vous pouvez déjà utiliser la recherche d'emploi. Besoin d'aide ? Répondez à cet e-mail, nous vous appelons volontiers."], button: "Remplir le dossier" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "ننتظر بياناتك", title: `مرحبًا ${v.name}،`, paras: ["باقة البداية مدفوعة، لكن لا يمكننا مراجعة مستنداتك قبل أن يصلنا ملفك. يمكنك من الآن استخدام البحث عن وظيفة. إذا احتجت مساعدة، رد على هذه الرسالة وسنتصل بك بكل سرور."], button: "املأ الملف" }),
      hi: (v) => ({ subject: "हम आपकी जानकारी का इंतज़ार कर रहे हैं", title: `नमस्ते ${v.name},`, paras: ["आपके स्टार्टर पैकेज का भुगतान हो गया है, लेकिन आपकी फ़ाइल मिलने के बाद ही हम आपके दस्तावेज़ जाँच सकते हैं। नौकरी खोज आप अभी से इस्तेमाल कर सकते हैं। मदद चाहिए तो इस ईमेल का जवाब दें, हम आपको फ़ोन करेंगे।"], button: "फ़ाइल भरें" }),
    },
  },
  {
    key: "TOOL_START", name: "Unterlagen fertig, Werkzeug kurz vorgestellt", when: "3 Tage nach Freigabe der Mappe", path: "/stellensuche",
    text: {
      de: (v) => ({ subject: "So findest du passende Stellen", title: `Hallo ${v.name},`, paras: ["deine Unterlagen sind fertig. In der Stellensuche findest du aktuelle Stellen zu deinem Profil und siehst gleich, welches Deutsch verlangt wird. Merk dir die Stellen, die dir gefallen. Für jede erstellst du ein passendes Anschreiben und bewirbst dich selbst."], button: "Stellensuche öffnen" }),
      en: (v) => ({ subject: "How to find suitable jobs", title: `Hi ${v.name},`, paras: ["Your documents are ready. In the job search you find current jobs for your profile and see right away which German level is required. Save the jobs you like. For each one you create a matching cover letter and apply yourself."], button: "Open job search" }),
      fr: (v) => ({ subject: "Comment trouver des offres adaptées", title: `Bonjour ${v.name},`, paras: ["Vos documents sont prêts. Dans la recherche d'emploi, vous trouvez des offres actuelles pour votre profil et voyez tout de suite le niveau d'allemand demandé. Gardez les offres qui vous plaisent. Pour chacune, vous créez une lettre adaptée et postulez vous-même."], button: "Ouvrir la recherche" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "هكذا تجد وظائف مناسبة", title: `مرحبًا ${v.name}،`, paras: ["مستنداتك جاهزة. في البحث عن وظيفة تجد وظائف حالية تناسب ملفك، وترى مباشرة مستوى الألمانية المطلوب. احفظ الوظائف التي تعجبك. لكل واحدة منها تُنشئ رسالة تحفيز مناسبة وتتقدّم بنفسك."], button: "فتح البحث عن وظيفة" }),
      hi: (v) => ({ subject: "उपयुक्त नौकरियाँ ऐसे ढूँढें", title: `नमस्ते ${v.name},`, paras: ["आपके दस्तावेज़ तैयार हैं। नौकरी खोज में आपको अपनी प्रोफ़ाइल के लिए ताज़ा नौकरियाँ मिलती हैं, और आप तुरंत देख सकते हैं कि कौन-सा जर्मन स्तर चाहिए। जो नौकरियाँ पसंद आएँ, उन्हें सहेजें। हर एक के लिए आप एक उपयुक्त कवर लेटर बनाते हैं और ख़ुद आवेदन करते हैं।"], button: "नौकरी खोज खोलें" }),
    },
  },
  {
    key: "TOOL_ENDS", name: "Werkzeug läuft bald ab", when: "Werkzeug endet in höchstens 7 Tagen (reiner Hinweis, kein Verkauf: es gibt keine Verlängerung)", path: "/meine-bewerbungen",
    text: {
      de: (v) => ({ subject: `Dein Bewerbungswerkzeug läuft am ${v.until} ab`, title: `Hallo ${v.name},`, paras: [`dein Bewerbungswerkzeug läuft am ${v.until} ab. Bis dahin kannst du noch suchen, Stellen merken und Anschreiben erstellen.`, "Danach musst du nichts tun: Es gibt kein Abo und nichts zu kündigen. Stellensuche und Tracker werden gesperrt, deine Unterlagen und die Anschreiben zu deinen Stellen kannst du weiter herunterladen."], button: "Meine Bewerbungen" }),
      en: (v) => ({ subject: `Your application tool expires on ${v.until}`, title: `Hi ${v.name},`, paras: [`Your application tool expires on ${v.until}. Until then you can still search, save jobs and create cover letters.`, "After that you don't need to do anything: there is no subscription and nothing to cancel. Job search and the tracker are locked, and you can still download your documents and the cover letters for your jobs."], button: "My applications" }),
      fr: (v) => ({ subject: `Votre outil de candidature expire le ${v.until}`, title: `Bonjour ${v.name},`, paras: [`Votre outil de candidature expire le ${v.until}. D'ici là, vous pouvez encore chercher, garder des offres et créer des lettres.`, "Ensuite, vous n'avez rien à faire : il n'y a pas d'abonnement et rien à résilier. La recherche et le suivi sont fermés, et vous pouvez toujours télécharger vos documents et les lettres créées pour vos offres."], button: "Mes candidatures" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: `تنتهي أداة التقديم في ${v.until}`, title: `مرحبًا ${v.name}،`, paras: [`تنتهي مدة أداة التقديم الخاصة بك في ${v.until}. حتى ذلك الحين يمكنك مواصلة البحث وحفظ الوظائف وإنشاء رسائل التحفيز.`, "بعد ذلك لا داعي لفعل أي شيء: لا يوجد اشتراك ولا شيء للإلغاء. يُغلق البحث والمتابعة، ويمكنك الاستمرار في تحميل مستنداتك ورسائل التحفيز الخاصة بوظائفك."], button: "طلباتي" }),
      hi: (v) => ({ subject: `आपका आवेदन टूल ${v.until} को समाप्त हो रहा है`, title: `नमस्ते ${v.name},`, paras: [`आपका आवेदन टूल ${v.until} को समाप्त हो रहा है। तब तक आप खोज सकते हैं, नौकरियाँ सहेज सकते हैं और कवर लेटर बना सकते हैं।`, "उसके बाद आपको कुछ नहीं करना है: कोई सदस्यता नहीं है और कुछ रद्द नहीं करना। नौकरी खोज और सूची बंद हो जाती है, और आप अपने दस्तावेज़ और अपनी नौकरियों के कवर लेटर आगे भी डाउनलोड कर सकते हैं।"], button: "मेरे आवेदन" }),
    },
  },
  {
    key: "FEEDBACK", name: "Rückmeldung nach einigen Wochen", when: "45 Tage nach Zahlung", path: "/#kontakt",
    text: {
      de: (v) => ({ subject: "Wie läuft es bei dir?", title: `Hallo ${v.name},`, paras: ["vor einigen Wochen hast du mit WoYou angefangen. Hast du Einladungen bekommen oder sogar eine Zusage? Wir freuen uns über eine kurze Antwort auf diese Mail. Und wenn dir am Werkzeug etwas fehlt, sag es uns."], button: "Kontakt" }),
      en: (v) => ({ subject: "How is it going?", title: `Hi ${v.name},`, paras: ["You started with WoYou a few weeks ago. Have you had interviews or even an offer? A short reply to this email would mean a lot. And if something is missing in the tool, let us know."], button: "Contact" }),
      fr: (v) => ({ subject: "Comment ça se passe ?", title: `Bonjour ${v.name},`, paras: ["Vous avez commencé avec WoYou il y a quelques semaines. Avez-vous reçu des invitations, voire une offre ? Une courte réponse à cet e-mail nous ferait plaisir. Et s'il manque quelque chose dans l'outil, dites-le-nous."], button: "Contact" }),
      // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
      ar: (v) => ({ subject: "كيف تسير الأمور؟", title: `مرحبًا ${v.name}،`, paras: ["بدأت مع WoYou قبل بضعة أسابيع. هل وصلتك دعوات لمقابلات أو حتى عرض عمل؟ يسعدنا ردك القصير على هذه الرسالة. وإذا كان ينقص الأداة شيء، أخبرنا."], button: "تواصل معنا" }),
      hi: (v) => ({ subject: "कैसा चल रहा है?", title: `नमस्ते ${v.name},`, paras: ["आपने कुछ हफ़्ते पहले WoYou के साथ शुरुआत की थी। क्या आपको इंटरव्यू के बुलावे या नौकरी का प्रस्ताव मिला? इस ईमेल का छोटा-सा जवाब हमें बहुत अच्छा लगेगा। और अगर टूल में कुछ कमी लगे, तो हमें बताएँ।"], button: "संपर्क करें" }),
    },
  },
];

const UNSUB: Record<Lang, string> = {
  de: "Du möchtest keine Hinweise mehr von uns? Hier abmelden:",
  en: "Don't want these emails? Unsubscribe here:",
  fr: "Vous ne souhaitez plus recevoir ces e-mails ? Désinscription :",
  // ar/hi: Übersetzung bitte von Muttersprachler:in prüfen lassen
  ar: "لا تريد هذه الرسائل؟ يمكنك إلغاء الاشتراك من هنا:",
  hi: "ये ईमेल नहीं चाहिए? यहाँ अनसब्सक्राइब करें:",
};

const SIGN: Record<Lang, string> = { de: "Dein WoYou-Team", en: "Your WoYou team", fr: "L'équipe WoYou", ar: "فريق WoYou", hi: "आपकी WoYou टीम" };

export const langOf = (l?: string | null): Lang => (l === "de" || l === "fr" || l === "ar" || l === "hi" ? l : l ? "en" : "de"); // andere Sprachen: Englisch

export function render(step: Step, lang: Lang, v: Vars, userId: string) {
  const t0 = step.text[lang](v);
  const t = { ...t0, title: t0.title.replace(/\s+([,،])/, "$1") }; // ohne Vornamen: „Hallo,“
  const unsub = `${UNSUB[lang]} ${unsubUrl(userId)}`;
  return {
    subject: `WoYou: ${t.subject}`,
    text: [t.title, ...t.paras, `${t.button}: ${base()}${step.path}`, SIGN[lang], unsub].join("\n\n"),
    html: layout(t.title, [...t.paras, SIGN[lang]], { label: t.button, href: `${base()}${step.path}` }, unsub, dirOf(lang)),
  };
}

export function sampleVars(lang: Lang = "de"): Vars {
  const f = (c: number) => formatPrice(c, lang);
  return { name: "Fatima", price: f(ANGEBOT.startpaket.priceCents), months: ANGEBOT.startpaket.toolMonths, until: new Date(Date.now() + 5 * day).toLocaleDateString(dateLocaleOf(lang)) };
}

type Due = { userId: string; email: string; lang: Lang; step: Step; vars: Vars };

// Wer bekommt heute welche Mail? (ohne zu senden, auch für die Vorschau im Admin)
export async function dueMails(limit = 500): Promise<Due[]> {
  const now = Date.now();
  const users = await prisma.user.findMany({
    where: { role: ROLE.CANDIDATE, deletedAt: null, marketingOptOut: false, email: { not: null }, createdAt: { lt: new Date(now - day) } },
    include: {
      marketingSends: { select: { step: true } },
      candidate: {
        select: {
          firstName: true, toolAccessUntil: true,
          bookings: { where: { status: { not: BOOKING_STATUS.CANCELLED } }, orderBy: { createdAt: "desc" }, take: 1, include: { profile: { select: { status: true, approvedAt: true } } } },
        },
      },
    },
    take: 3000,
  });
  const out: Due[] = [];
  for (const u of users) {
    if (out.length >= limit) break;
    const done = new Set(u.marketingSends.map((x) => x.step));
    const c = u.candidate;
    const b = c?.bookings[0];
    const age = now - u.createdAt.getTime();
    const lang = langOf(u.locale);
    const vars: Vars = { ...sampleVars(lang), name: c?.firstName || "", until: c?.toolAccessUntil?.toLocaleDateString(dateLocaleOf(lang)) ?? "" };
    let key: string | null = null;
    if (!b) {
      key = age > 7 * day ? "REG_7" : age > 3 * day ? "REG_3" : "REG_1";
    } else if (!b.paidAt) {
      if (now - b.createdAt.getTime() > day) key = "PAY_1";
    } else {
      const sincePaid = now - b.paidAt.getTime();
      const submitted = b.profile?.status === "SUBMITTED" || b.profile?.status === "APPROVED";
      const until = c?.toolAccessUntil?.getTime() ?? 0;
      if (!submitted) key = sincePaid > 5 * day ? "MAPPE_5" : sincePaid > 2 * day ? "MAPPE_2" : null;
      else if (until > now && until - now <= 7 * day && !done.has("TOOL_ENDS")) key = "TOOL_ENDS";
      else if (b.profile?.approvedAt && now - b.profile.approvedAt.getTime() > 3 * day && !done.has("TOOL_START")) key = "TOOL_START";
      else if (sincePaid > 45 * day) key = "FEEDBACK";
    }
    if (!key || done.has(key)) continue;
    const step = STEPS.find((s) => s.key === key)!;
    out.push({ userId: u.id, email: u.email!, lang, step, vars });
  }
  return out;
}

// Täglicher Lauf
export async function runMarketing() {
  if (!marketingActive()) return { active: false, sent: 0, failed: 0 };
  let sent = 0, failed = 0;
  for (const d of await dueMails(300)) {
    const m = render(d.step, d.lang, d.vars, d.userId);
    const r = await sendMail({ to: d.email, subject: m.subject, text: m.text, html: m.html, template: `marketing_${d.step.key}`, headers: { "List-Unsubscribe": `<${unsubUrl(d.userId)}>` } });
    if (r.status === "SENT") { await prisma.marketingSend.create({ data: { userId: d.userId, step: d.step.key } }).catch(() => {}); sent++; } else failed++;
  }
  return { active: true, sent, failed };
}
