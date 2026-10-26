// Texte für den Schalter „Selbstcheck vor der Buchung“ (Bestellseite und Selbstcheck).
// fr in der Sie-Form (vous), sr in lateinischer Schrift mit „ti“. ar/hi/sr/te: bitte von Muttersprachler:in prüfen lassen.
// Platzhalter: {ergebnis}, {datum}, {email}
import type { CheckLang } from "./selfcheck";

export type VorBuchungText = {
  needTitle: string; needBody: string; needCta: string;
  result: string; redo: string; levels: { green: string; yellow: string; red: string };
  redTitle: string; redBody: string; redConfirm: string; blockedBody: string;
  nextBook: string;
};

export const VORBUCHUNG_TEXT: Record<CheckLang, VorBuchungText> = {
  de: {
    needTitle: "Zuerst der Selbstcheck",
    needBody: "Bevor du buchst, mach bitte unseren kurzen Selbstcheck. Er dauert etwa eine Minute und ist kostenlos. Danach sagen wir dir offen, ob sich die Buchung für dein Profil lohnt. Das Ergebnis gilt 30 Tage.",
    needCta: "Zum Selbstcheck",
    result: "Dein Selbstcheck: {ergebnis} (am {datum})",
    redo: "Selbstcheck neu machen",
    levels: { green: "Buchung sinnvoll", yellow: "Möglich, aber mit Einschränkungen", red: "Wir raten dir ab" },
    redTitle: "Dein Selbstcheck sagt: Wir raten dir ab",
    redBody: "Nach deinen Angaben hast du mit unseren Unterlagen im Moment wenig Chancen auf eine Stelle in Deutschland. Bitte bezahle nur, wenn du das bewusst so willst. Meist ist der bessere nächste Schritt, zuerst Deutsch zu lernen oder die Anerkennung deines Abschlusses zu klären. Hat sich etwas geändert? Dann mach den Selbstcheck neu.",
    redConfirm: "Ich habe gelesen, dass WoYou mir abrät, und möchte trotzdem buchen",
    blockedBody: "Deshalb bieten wir dir das Startpaket im Moment nicht an. Dein nächster sinnvoller Schritt: Arbeite an dem, was der Selbstcheck dir genannt hat, zum Beispiel Deutsch bis mindestens A2 oder die Anerkennung deines Abschlusses. Danach mach den Selbstcheck neu. Fragen? Schreib uns: {email}",
    nextBook: "Weiter zur Buchung",
  },
  en: {
    needTitle: "First, the self-check",
    needBody: "Before you book, please take our short self-check. It takes about a minute and is free. Then we tell you openly whether booking makes sense for your profile. The result is valid for 30 days.",
    needCta: "Go to the self-check",
    result: "Your self-check: {ergebnis} (on {datum})",
    redo: "Take the self-check again",
    levels: { green: "Booking makes sense", yellow: "Possible, but with limits", red: "We advise against it" },
    redTitle: "Your self-check says: we advise against it",
    redBody: "Based on your answers, our documents currently give you little chance of a job in Germany. Please only pay if you really want to. Usually the better next step is to learn German first or to get your qualification recognised. Has something changed? Then take the self-check again.",
    redConfirm: "I have read that WoYou advises me against it, and I still want to book",
    blockedBody: "That is why we are not offering you the starter package right now. Your next sensible step: work on what the self-check told you, for example German to at least A2 or the recognition of your qualification. Then take the self-check again. Questions? Write to us: {email}",
    nextBook: "Continue to booking",
  },
  fr: {
    needTitle: "D'abord l'auto-test",
    needBody: "Avant de réserver, faites s'il vous plaît notre court auto-test. Il dure environ une minute et il est gratuit. Ensuite, nous vous disons honnêtement si la réservation vaut la peine pour votre profil. Le résultat est valable 30 jours.",
    needCta: "Vers l'auto-test",
    result: "Votre auto-test : {ergebnis} (le {datum})",
    redo: "Refaire l'auto-test",
    levels: { green: "Réservation pertinente", yellow: "Possible, avec des limites", red: "Nous vous le déconseillons" },
    redTitle: "Votre auto-test indique : nous vous le déconseillons",
    redBody: "D'après vos réponses, nos documents vous donnent actuellement peu de chances de trouver un emploi en Allemagne. Ne payez que si vous le voulez vraiment. Le plus souvent, la meilleure étape est d'abord d'apprendre l'allemand ou de faire reconnaître votre diplôme. Quelque chose a changé ? Refaites alors l'auto-test.",
    redConfirm: "J'ai lu que WoYou me le déconseille et je souhaite quand même réserver",
    blockedBody: "C'est pourquoi nous ne vous proposons pas le pack de départ pour le moment. Votre prochaine étape utile : travaillez sur ce que l'auto-test vous a indiqué, par exemple l'allemand jusqu'au niveau A2 au moins ou la reconnaissance de votre diplôme. Refaites ensuite l'auto-test. Des questions ? Écrivez-nous : {email}",
    nextBook: "Continuer vers la réservation",
  },
  ar: {
    needTitle: "الاختبار الذاتي أولًا",
    needBody: "قبل أن تحجز، قم من فضلك بالاختبار الذاتي القصير. يستغرق حوالي دقيقة وهو مجاني. بعد ذلك نخبرك بصدق إن كان الحجز مفيدًا لملفك. النتيجة صالحة لمدة 30 يومًا.",
    needCta: "إلى الاختبار الذاتي",
    result: "اختبارك الذاتي: {ergebnis} (بتاريخ {datum})",
    redo: "أعد الاختبار الذاتي",
    levels: { green: "الحجز مفيد", yellow: "ممكن مع قيود", red: "ننصحك بعدم الحجز" },
    redTitle: "نتيجة اختبارك الذاتي: ننصحك بعدم الحجز",
    redBody: "حسب إجاباتك، فرصك في الحصول على عمل في ألمانيا بمستنداتنا ضعيفة حاليًا. ادفع فقط إذا كنت تريد ذلك عن قناعة. غالبًا تكون الخطوة الأفضل هي تعلّم الألمانية أولًا أو توضيح الاعتراف بشهادتك. هل تغيّر شيء؟ أعد الاختبار الذاتي.",
    redConfirm: "قرأت أن WoYou تنصحني بعدم الحجز، وأريد الحجز رغم ذلك",
    blockedBody: "لهذا السبب لا نعرض عليك باقة البداية حاليًا. خطوتك التالية المفيدة: اعمل على ما ذكره لك الاختبار الذاتي، مثلًا الألمانية حتى مستوى A2 على الأقل أو الاعتراف بشهادتك. بعد ذلك أعد الاختبار الذاتي. أسئلة؟ اكتب لنا: {email}",
    nextBook: "متابعة إلى الحجز",
  },
  hi: {
    needTitle: "पहले सेल्फ़-चेक",
    needBody: "बुक करने से पहले कृपया हमारा छोटा सेल्फ़-चेक करें। इसमें लगभग एक मिनट लगता है और यह मुफ़्त है। उसके बाद हम साफ़ बताते हैं कि आपके प्रोफ़ाइल के लिए बुकिंग फ़ायदेमंद है या नहीं। परिणाम 30 दिन तक मान्य है।",
    needCta: "सेल्फ़-चेक पर जाएँ",
    result: "आपका सेल्फ़-चेक: {ergebnis} ({datum} को)",
    redo: "सेल्फ़-चेक फिर से करें",
    levels: { green: "बुकिंग समझदारी है", yellow: "संभव है, पर सीमाओं के साथ", red: "हम सलाह नहीं देते" },
    redTitle: "आपका सेल्फ़-चेक कहता है: हम सलाह नहीं देते",
    redBody: "आपके जवाबों के अनुसार, हमारे दस्तावेज़ों से अभी जर्मनी में नौकरी मिलने की संभावना कम है। कृपया तभी भुगतान करें जब आप सच में ऐसा चाहते हों। अक्सर बेहतर अगला कदम पहले जर्मन सीखना या अपनी योग्यता की मान्यता करवाना होता है। क्या कुछ बदला है? तो सेल्फ़-चेक फिर से करें।",
    redConfirm: "मैंने पढ़ लिया है कि WoYou मुझे सलाह नहीं देता, और मैं फिर भी बुक करना चाहता/चाहती हूँ",
    blockedBody: "इसलिए हम अभी आपको स्टार्टर पैकेज नहीं दे रहे हैं। आपका अगला सही कदम: सेल्फ़-चेक ने जो बताया उस पर काम करें, जैसे कम से कम A2 तक जर्मन या अपनी योग्यता की मान्यता। उसके बाद सेल्फ़-चेक फिर से करें। सवाल? हमें लिखें: {email}",
    nextBook: "बुकिंग पर आगे बढ़ें",
  },
  sr: {
    needTitle: "Prvo samoprovera",
    needBody: "Pre nego što naručiš, uradi našu kratku samoproveru. Traje oko jedan minut i besplatna je. Posle toga ti otvoreno kažemo da li ti se porudžbina isplati za tvoj profil. Rezultat važi 30 dana.",
    needCta: "Na samoproveru",
    result: "Tvoja samoprovera: {ergebnis} ({datum})",
    redo: "Uradi samoproveru ponovo",
    levels: { green: "Porudžbina ima smisla", yellow: "Moguće, ali uz ograničenja", red: "Ne preporučujemo ti" },
    redTitle: "Tvoja samoprovera kaže: ne preporučujemo ti",
    redBody: "Prema tvojim odgovorima, sa našim dokumentima trenutno imaš male šanse za posao u Nemačkoj. Plati samo ako to zaista želiš. Najčešće je bolji sledeći korak da prvo učiš nemački ili da rešiš priznavanje diplome. Da li se nešto promenilo? Onda uradi samoproveru ponovo.",
    redConfirm: "Pročitao/la sam da mi WoYou ne preporučuje, i ipak želim da naručim",
    blockedBody: "Zato ti startni paket trenutno ne nudimo. Tvoj sledeći smislen korak: radi na onome što ti je samoprovera navela, na primer nemački najmanje do A2 ili priznavanje diplome. Posle toga uradi samoproveru ponovo. Pitanja? Piši nam: {email}",
    nextBook: "Dalje na porudžbinu",
  },
  te: {
    needTitle: "ముందు సెల్ఫ్-చెక్",
    needBody: "బుక్ చేసే ముందు దయచేసి మా చిన్న సెల్ఫ్-చెక్ చేయండి. దీనికి సుమారు ఒక నిమిషం పడుతుంది, ఇది ఉచితం. ఆ తర్వాత మీ ప్రొఫైల్‌కు బుకింగ్ ఉపయోగపడుతుందో లేదో స్పష్టంగా చెబుతాము. ఫలితం 30 రోజులు చెల్లుతుంది.",
    needCta: "సెల్ఫ్-చెక్‌కు వెళ్ళండి",
    result: "మీ సెల్ఫ్-చెక్: {ergebnis} ({datum} న)",
    redo: "సెల్ఫ్-చెక్ మళ్ళీ చేయండి",
    levels: { green: "బుకింగ్ ఉపయోగకరం", yellow: "సాధ్యమే, కానీ పరిమితులతో", red: "మేము సలహా ఇవ్వము" },
    redTitle: "మీ సెల్ఫ్-చెక్ ఫలితం: మేము సలహా ఇవ్వము",
    redBody: "మీ సమాధానాల ప్రకారం, మా పత్రాలతో ప్రస్తుతం జర్మనీలో ఉద్యోగం దొరికే అవకాశం తక్కువ. మీరు నిజంగా కోరుకుంటేనే చెల్లించండి. సాధారణంగా ముందు జర్మన్ నేర్చుకోవడం లేదా మీ అర్హతకు గుర్తింపు పొందడం మంచి తదుపరి అడుగు. ఏదైనా మారిందా? అయితే సెల్ఫ్-చెక్ మళ్ళీ చేయండి.",
    redConfirm: "WoYou నాకు సలహా ఇవ్వదని నేను చదివాను, అయినా బుక్ చేయాలనుకుంటున్నాను",
    blockedBody: "అందుకే ప్రస్తుతం మీకు స్టార్టర్ ప్యాకేజీ అందించడం లేదు. మీ తదుపరి సరైన అడుగు: సెల్ఫ్-చెక్ చెప్పిన విషయాలపై పని చేయండి, ఉదాహరణకు కనీసం A2 వరకు జర్మన్ లేదా మీ అర్హతకు గుర్తింపు. ఆ తర్వాత సెల్ఫ్-చెక్ మళ్ళీ చేయండి. ప్రశ్నలు ఉన్నాయా? మాకు రాయండి: {email}",
    nextBook: "బుకింగ్‌కు కొనసాగండి",
  },
};

export const VORBUCHUNG_SPRACHEN = Object.keys(VORBUCHUNG_TEXT) as CheckLang[];
export const vorBuchungLang = (locale: string): CheckLang => ((VORBUCHUNG_SPRACHEN as string[]).includes(locale) ? (locale as CheckLang) : "en");
export const vorBuchungText = (locale: string) => VORBUCHUNG_TEXT[vorBuchungLang(locale)];
export const fillVorBuchung = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
