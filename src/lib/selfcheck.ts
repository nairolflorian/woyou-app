// Selbstcheck vor der Buchung: Beruf × Deutschniveau × Abschluss × Anerkennung → Empfehlung.
// Regeln hier pflegen. SELFCHECK_MODE (in der Seite): "warn" (Standard) = abraten, Buchung bleibt möglich;
// "block" = bei Rot kein Buchungsknopf. Entscheidung offen (Rachid, Konzept Folie 11).

export type Level = "none" | "A1" | "A2" | "B1" | "B2" | "C1";
export type Degree = "none" | "school" | "vocational" | "university";
export type Recognition = "yes" | "pending" | "no" | "unknown";
export type Answer = { job: string; degree: Degree; german: Level; recognition: Recognition; country: string };
export type Verdict = { level: "green" | "yellow" | "red"; reasons: string[] };

const ORDER: Level[] = ["none", "A1", "A2", "B1", "B2", "C1"];
const atLeast = (l: Level, min: Level) => ORDER.indexOf(l) >= ORDER.indexOf(min);

// Reglementierte Berufe: ohne Anerkennung in Deutschland nicht ausübbar (Auswahl, erweiterbar)
const REGULATED = /pfleg|kranken|alten|hebamm|arzt|ärzt|zahnarzt|apothek|physiotherap|ergotherap|logopäd|erzieh|lehrer|psychotherap|rettungs|notfallsanit|anwalt|steuerberat/i;
// Pflege & Gesundheit: in der Praxis meist B2 verlangt
const HEALTH = /pfleg|kranken|alten|hebamm|arzt|ärzt|zahnarzt|apothek|physiotherap|ergotherap|logopäd|rettungs|notfallsanit/i;
// Helfertätigkeiten: auch ohne Abschluss und mit A2 realistisch
const HELPER = /helfer|lager|logistik|reinig|küchenhilf|spül|produktion|kommission|fahrer|zusteller|gärtner|bau|montage|service|kellner/i;

// ar/hi/sr/te: Übersetzung bitte von Muttersprachler:in prüfen lassen
export function evaluate(a: Answer, lang: "de" | "en" | "hi" | "ar" | "sr" | "te" = "de"): Verdict {
  const t = (de: string, en: string, hi?: string, ar?: string, sr?: string, te?: string) => (lang === "hi" && hi ? hi : lang === "ar" && ar ? ar : lang === "sr" && sr ? sr : lang === "te" && te ? te : lang === "de" ? de : en);
  const reasons: string[] = [];
  const regulated = REGULATED.test(a.job), health = HEALTH.test(a.job), helper = HELPER.test(a.job);

  if (!atLeast(a.german, "A2")) {
    return { level: "red", reasons: [t("Ohne Deutschkenntnisse hat dieses Profil aktuell kaum Chancen. Buche nicht. Mach zuerst einen Deutschkurs bis A2 oder B1. Wenn du willst, sagen wir dir, wo das geht.", "Without German skills this profile currently has very little chance. Don't book. Take a German course to A2 or B1 first. If you like, we can tell you where.", "जर्मन के बिना इस प्रोफ़ाइल के लिए अभी मौके बहुत कम हैं। बुक न करें। पहले A2 या B1 तक जर्मन सीखें। चाहें तो हम बता सकते हैं कि कहाँ।", "بدون معرفة باللغة الألمانية تكون فرص هذا الملف ضعيفة جدًا حاليًا. لا تحجز. تعلّم الألمانية أولًا حتى مستوى A2 أو B1. إذا أردت، نخبرك أين يمكنك ذلك.", "Bez znanja nemačkog ovaj profil trenutno ima vrlo male šanse. Nemoj da naručiš. Prvo završi kurs nemačkog do nivoa A2 ili B1. Ako želiš, reći ćemo ti gde to možeš.", "జర్మన్ రాకుండా ఈ ప్రొఫైల్‌కు ప్రస్తుతం అవకాశాలు చాలా తక్కువ. బుక్ చేయకండి. ముందుగా A2 లేదా B1 వరకు జర్మన్ నేర్చుకోండి. మీకు కావాలంటే ఎక్కడ నేర్చుకోవచ్చో మేము చెబుతాము.")] };
  }
  if (regulated && (a.recognition === "no" || a.recognition === "unknown")) {
    return { level: "red", reasons: [t("Dein Beruf ist in Deutschland reglementiert. Ohne Anerkennung (oder ein laufendes Verfahren) laden Arbeitgeber in der Regel nicht ein. Kläre zuerst die Anerkennung, z. B. über anerkennung-in-deutschland.de.", "Your profession is regulated in Germany. Without recognition (or a pending procedure) employers usually do not invite you. Sort out recognition first, e.g. via anerkennung-in-deutschland.de.", "आपका पेशा जर्मनी में नियंत्रित है। मान्यता (या चल रही प्रक्रिया) के बिना नियोक्ता आमतौर पर इंटरव्यू के लिए नहीं बुलाते। पहले मान्यता का काम करें, जैसे anerkennung-in-deutschland.de पर।", "مهنتك منظّمة قانونيًا في ألمانيا. بدون معادلة الشهادة (أو إجراء جارٍ لها) لا يدعوك أصحاب العمل عادةً إلى مقابلة. اهتم أولًا بمعادلة شهادتك، مثلًا عبر anerkennung-in-deutschland.de.", "Tvoje zanimanje je u Nemačkoj regulisano. Bez priznavanja kvalifikacija (ili postupka koji je u toku) poslodavci po pravilu ne pozivaju na razgovor. Prvo reši priznavanje, npr. preko anerkennung-in-deutschland.de.", "మీ వృత్తి జర్మనీలో నియంత్రిత వృత్తి. గుర్తింపు (లేదా జరుగుతున్న ప్రక్రియ) లేకుండా యజమానులు సాధారణంగా ఇంటర్వ్యూకు పిలవరు. ముందుగా గుర్తింపు పని పూర్తి చేయండి, ఉదా. anerkennung-in-deutschland.de ద్వారా.")] };
  }
  if (a.german === "A2") {
    if (helper) reasons.push(t("Mit A2 sind vor allem Helferstellen realistisch. Die gibt es, aber weniger als mit B1.", "With A2, mainly helper jobs are realistic. There are some, but fewer than with B1.", "A2 के साथ मुख्य रूप से सहायक (हेल्पर) नौकरियाँ वास्तविक हैं। ऐसी नौकरियाँ हैं, लेकिन B1 की तुलना में कम।", "مع مستوى A2 تكون الوظائف المساعدة هي الأكثر واقعية. هذه الوظائف موجودة، لكنها أقل مما هو متاح مع B1.", "Sa A2 su realni uglavnom pomoćni poslovi. Takvih ima, ali manje nego sa B1.", "A2 తో ముఖ్యంగా సహాయక (హెల్పర్) ఉద్యోగాలు వాస్తవికం. అలాంటివి ఉన్నాయి, కానీ B1 తో పోలిస్తే తక్కువ."));
    else return { level: "red", reasons: [t("Für Fachstellen verlangen Arbeitgeber fast immer mindestens B1. Mit A2 raten wir ab. Wenn du B1 erreicht hast, lohnt sich die Buchung deutlich mehr.", "For skilled jobs employers almost always require at least B1. With A2 we advise against booking. Once you reach B1, booking is much more worthwhile.", "कुशल नौकरियों के लिए नियोक्ता लगभग हमेशा कम से कम B1 माँगते हैं। A2 के साथ हम सलाह नहीं देते। B1 होने पर बुकिंग कहीं ज़्यादा फ़ायदेमंद है।", "لوظائف المتخصصين يطلب أصحاب العمل في الغالب مستوى B1 على الأقل. مع A2 ننصحك بعدم الحجز. عندما تصل إلى B1 يصبح الحجز أكثر فائدة بكثير.", "Za stručne poslove poslodavci skoro uvek traže najmanje B1. Sa A2 ti ne preporučujemo porudžbinu. Kada dostigneš B1, porudžbina se mnogo više isplati.", "నైపుణ్యం గల ఉద్యోగాలకు యజమానులు దాదాపు ఎప్పుడూ కనీసం B1 అడుగుతారు. A2 తో మేము బుకింగ్ సలహా ఇవ్వము. మీరు B1 చేరుకున్నాక బుకింగ్ చాలా ఎక్కువ ఉపయోగకరం.")] };
  }
  if (health && !atLeast(a.german, "B2")) reasons.push(t("In Pflege und Gesundheit wird meist B2 verlangt. Mit B1 gibt es weniger realistische Stellen.", "In care and health, B2 is usually required. With B1 there are fewer suitable jobs.", "देखभाल और स्वास्थ्य में आमतौर पर B2 माँगा जाता है। B1 के साथ कम वास्तविक नौकरियाँ हैं।", "في التمريض والصحة يُطلب عادةً مستوى B2. مع B1 تكون الوظائف الواقعية أقل.", "U nezi i zdravstvu se uglavnom traži B2. Sa B1 ima manje realnih poslova.", "సంరక్షణ మరియు ఆరోగ్య రంగంలో సాధారణంగా B2 అడుగుతారు. B1 తో వాస్తవిక ఉద్యోగాలు తక్కువ."));
  if (regulated && a.recognition === "pending") reasons.push(t("Anerkennung läuft: Viele Arbeitgeber warten auf den Bescheid. Gib das in der Bewerbung an.", "Recognition pending: many employers wait for the decision. Mention it in your application.", "मान्यता प्रक्रिया चल रही है: कई नियोक्ता फ़ैसले का इंतज़ार करते हैं। इसे आवेदन में ज़रूर लिखें।", "معادلة الشهادة جارية: كثير من أصحاب العمل ينتظرون القرار. اذكر ذلك في طلبك.", "Priznavanje je u toku: mnogi poslodavci čekaju rešenje. Navedi to u prijavi.", "గుర్తింపు ప్రక్రియ జరుగుతోంది: చాలా మంది యజమానులు నిర్ణయం కోసం ఎదురుచూస్తారు. దీన్ని మీ దరఖాస్తులో తప్పకుండా రాయండి."));
  if (a.degree === "none" && !helper) reasons.push(t("Ohne Abschluss sind vor allem Helferstellen realistisch.", "Without a qualification, mainly helper jobs are realistic.", "योग्यता के बिना मुख्य रूप से सहायक नौकरियाँ वास्तविक हैं।", "بدون شهادة تكون الوظائف المساعدة هي الأكثر واقعية.", "Bez završene stručne škole ili diplome realni su uglavnom pomoćni poslovi.", "అర్హత లేకుండా ముఖ్యంగా సహాయక ఉద్యోగాలు వాస్తవికం."));

  if (reasons.length) return { level: "yellow", reasons };
  return { level: "green", reasons: [t("Für dieses Profil gibt es in der Regel genug passende Stellen, auf die du dich selbst bewerben kannst. Eine Zusage bleibt trotzdem offen.", "For this profile there are usually enough suitable jobs you can apply to yourself. An offer is still not guaranteed.", "इस प्रोफ़ाइल के लिए आमतौर पर काफ़ी उपयुक्त नौकरियाँ होती हैं, जिन पर आप ख़ुद आवेदन कर सकते हैं। फिर भी नौकरी मिलना पक्का नहीं है।", "لهذا الملف توجد عادةً وظائف مناسبة كافية يمكنك التقدّم إليها بنفسك. ومع ذلك يبقى القبول غير مضمون.", "Za ovaj profil po pravilu ima dovoljno odgovarajućih poslova na koje možeš lično da se prijaviš. Ipak, ponuda za posao nije zagarantovana.", "ఈ ప్రొఫైల్‌కు సాధారణంగా మీరే దరఖాస్తు చేసుకోగలిగే సరిపడా ఉద్యోగాలు ఉంటాయి. అయినా ఉద్యోగం వస్తుందని హామీ లేదు.")] };
}
