// Selbstcheck vor der Buchung: Beruf × Deutschniveau × Abschluss × Anerkennung → Empfehlung.
// Regeln hier pflegen. SELFCHECK_MODE (in der Seite): "warn" (Standard) = abraten, Buchung bleibt möglich;
// "block" = bei Rot kein Buchungsknopf. Entscheidung offen (Rachid, Konzept Folie 11).

export type Level = "none" | "A1" | "A2" | "B1" | "B2" | "C1";
export type Degree = "none" | "school" | "vocational" | "university";
export type Recognition = "yes" | "pending" | "no" | "unknown";
export type Answer = { job: string; degree: Degree; german: Level; recognition: Recognition; country: string; balkan?: Balkan };
export type Verdict = { level: "green" | "yellow" | "red"; reasons: string[] };

const ORDER: Level[] = ["none", "A1", "A2", "B1", "B2", "C1"];
const atLeast = (l: Level, min: Level) => ORDER.indexOf(l) >= ORDER.indexOf(min);

// Reglementierte Berufe: ohne Anerkennung in Deutschland nicht ausübbar (Auswahl, erweiterbar)
const REGULATED = /pfleg|kranken|alten|hebamm|arzt|ärzt|zahnarzt|apothek|physiotherap|ergotherap|logopäd|erzieh|lehrer|psychotherap|rettungs|notfallsanit|anwalt|steuerberat/i;
// Pflege & Gesundheit: in der Praxis meist B2 verlangt
const HEALTH = /pfleg|kranken|alten|hebamm|arzt|ärzt|zahnarzt|apothek|physiotherap|ergotherap|logopäd|rettungs|notfallsanit/i;
// Helfertätigkeiten: auch ohne Abschluss und mit A2 realistisch
const HELPER = /helfer|lager|logistik|reinig|küchenhilf|spül|produktion|kommission|fahrer|zusteller|gärtner|bau|montage|service|kellner/i;

export type CheckLang = "de" | "en" | "fr" | "hi" | "ar" | "sr" | "te";

// ar/hi/sr/te: Übersetzung bitte von Muttersprachler:in prüfen lassen (fr nutzt hier die englischen Texte, der Westbalkan-Teil unten hat eigenes fr)
// Westbalkan (Pilot ab 17.11.2026): eigener Pfad für Fahrer und Logistik, siehe evaluateBalkan(). Alle anderen wie bisher.
export function evaluate(a: Answer, lang: CheckLang = "de", opts: BalkanOpts = {}): Verdict {
  const land = balkanLand(a.country);
  if (land && a.balkan?.group) {
    if (a.balkan.group !== "andere") return evaluateBalkan(a, land, lang, opts);
    // andere Berufsgruppe: allgemeine Einschätzung, aber Hinweis auf den Pilot und nie besser als Gelb
    const g = evaluateGeneral(a, lang), b = BALKAN_TEXT[lang];
    return { level: g.level === "green" ? "yellow" : g.level, reasons: [b.andere, ...g.reasons, fill(b.info, lang)] };
  }
  return evaluateGeneral(a, lang);
}

function evaluateGeneral(a: Answer, lang: CheckLang): Verdict {
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

// =====================================================================================================
// Westbalkan-Pilot (Konzept v4, 25.10.2026): Lkw-Fahrer (CE/C, Bus) und Logistik ohne Führerschein.
// Weg über die Westbalkanregelung (§ 26 Abs. 2 BeschV): Arbeitgeber beantragt, Kontingent 50.000 pro Jahr, Vorrangprüfung.
// Immer sagen: Kontingent, Vorrangprüfung, du bewirbst dich selbst, der Arbeitgeber beantragt. Nie: Garantie, Vermittlung, Visahilfe.
// =====================================================================================================

// Saison: bis wann die Unterlagen fertig sein sollten und ab wann Arbeitgeber beantragen. Je Saison hier anpassen.
export const UNTERLAGEN_BIS = { day: 15, month: 12 };
// Kampagne „Spremi se za januar“: bis wann man buchen sollte, damit die Unterlagen bis UNTERLAGEN_BIS fertig werden
export const BUCHUNG_BIS = { day: 30, month: 11 };
export const ANTRAG_AB = { day: 2, month: 1 };
// Kalender-Satz bei „Unterlagen nicht rechtzeitig fertig“. Entscheidung der Geschäftsführung bis 28.10.2026:
//   "weich" (Standard): ehrlicher Hinweis, dass der Antrag dann sehr wahrscheinlich im Folgejahr landet (Gelb)
//   "hart": „Mappe bis 15.12., Arbeitgeber beantragt ab 2. Januar. Wenn du das nicht schaffst, warte.“ (Rot)
export const KALENDER_SATZ: "weich" | "hart" = "weich";
// Unter so vielen Jahren mit der Klasse gibt es einen Hinweis auf wenig Fahrpraxis
const MIN_FAHRPRAXIS_JAHRE = 2;

export type BalkanGroup = "ce" | "c" | "bus" | "lager" | "stapler" | "dispo" | "andere";
export const BALKAN_GROUPS: BalkanGroup[] = ["ce", "c", "bus", "lager", "stapler", "dispo", "andere"];
export type Balkan = { group: BalkanGroup | ""; since: string; driverCard: "yes" | "no" | ""; code95: "yes" | "no" | "unknown" | ""; ready: "yes" | "no" | "" };
export const EMPTY_BALKAN: Balkan = { group: "", since: "", driverCard: "", code95: "", ready: "" };
export type BalkanOpts = { now?: Date; kalender?: "weich" | "hart" };
export const isDriverGroup = (g: Balkan["group"]) => g === "ce" || g === "c" || g === "bus";

// Die sechs Westbalkan-Staaten mit Namen in allen Oberflächensprachen (für Vorschläge im Feld „Land“) und weiteren Schreibweisen zum Erkennen.
// Die kyrillischen Schreibweisen dienen nur dem Erkennen einer Eingabe, angezeigt werden sie nie.
export type BalkanLand = "AL" | "BA" | "XK" | "ME" | "MK" | "RS";
export const WESTBALKAN: { id: BalkanLand; names: Record<CheckLang, string>; also: string[] }[] = [
  { id: "AL", names: { de: "Albanien", en: "Albania", fr: "Albanie", ar: "ألبانيا", hi: "अल्बानिया", sr: "Albanija", te: "అల్బేనియా" }, also: ["shqiperia", "shqiperi", "албанија", "албания"] },
  { id: "BA", names: { de: "Bosnien und Herzegowina", en: "Bosnia and Herzegovina", fr: "Bosnie-Herzégovine", ar: "البوسنة والهرسك", hi: "बोस्निया और हर्ज़ेगोविना", sr: "Bosna i Hercegovina", te: "బోస్నియా మరియు హెర్జెగోవినా" }, also: ["bosnien", "bosnia", "bosnie", "bosna", "herzegowina", "hercegovina", "bih", "البوسنة", "बोस्निया", "బోస్నియా", "босна"] },
  { id: "XK", names: { de: "Kosovo", en: "Kosovo", fr: "Kosovo", ar: "كوسوفو", hi: "कोसोवो", sr: "Kosovo", te: "కొసావో" }, also: ["kosova", "косово"] },
  { id: "ME", names: { de: "Montenegro", en: "Montenegro", fr: "Monténégro", ar: "الجبل الأسود", hi: "मोंटेनेग्रो", sr: "Crna Gora", te: "మాంటెనెగ్రో" }, also: ["مونتينيغرو", "црна гора"] },
  { id: "MK", names: { de: "Nordmazedonien", en: "North Macedonia", fr: "Macédoine du Nord", ar: "مقدونيا الشمالية", hi: "उत्तर मैसेडोनिया", sr: "Severna Makedonija", te: "ఉత్తర మాసిడోనియా" }, also: ["mazedonien", "macedonia", "macedoine", "makedonija", "maqedonia", "مقدونيا", "मैसेडोनिया", "మాసిడోనియా", "македонија"] },
  { id: "RS", names: { de: "Serbien", en: "Serbia", fr: "Serbie", ar: "صربيا", hi: "सर्बिया", sr: "Srbija", te: "సెర్బియా" }, also: ["србија"] },
];
const norm = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
export function balkanLand(input: string): BalkanLand | null {
  const v = norm(input || "");
  if (!v) return null;
  for (const c of WESTBALKAN) {
    for (const n of [...Object.values(c.names), ...c.also].map(norm)) {
      if (v === n || (n.length >= 4 && v.includes(n))) return c.id;
    }
  }
  return null;
}

// Datum je Sprache, z. B. „15. Dezember“, „15 December“. Serbisch als „15.12.“ (passt nach „do“ ohne Beugung).
const DATE_LOCALE: Record<CheckLang, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", ar: "ar-MA", hi: "hi-IN", sr: "sr-Latn-RS", te: "te-IN" };
export function saisonDatum(d: { day: number; month: number }, lang: CheckLang) {
  if (lang === "sr") return `${d.day}.${d.month}.`;
  return new Date(2026, d.month - 1, d.day).toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "long" });
}

type BalkanText = {
  a0: string; a1Logistik: string; dispoB1: string; a1Fahrer: string; busDeutsch: string;
  code95No: string; code95UnknownPre: string; driverCardNo: string; wenigPraxis: string;
  notReadyWeich: string; notReadyHart: string; readyYes: string; serbienFs: string;
  green: string; andere: string; info: string;
};
// Platzhalter {bis} = UNTERLAGEN_BIS, {ab} = ANTRAG_AB
// fr/ar/hi/sr/te: Übersetzung bitte von Muttersprachler:in prüfen lassen (Serbisch nur lateinische Schrift)
export const BALKAN_TEXT: Record<CheckLang, BalkanText> = {
  de: {
    a0: "Ohne Deutschkenntnisse raten wir dir ab. Auch als Fahrer oder im Lager brauchst du jeden Tag etwas Deutsch, zum Beispiel für Sicherheitsregeln und Absprachen. Buche jetzt nicht. Mach zuerst einen Deutschkurs bis A1, besser A2, und mach den Selbstcheck danach noch einmal. Wenn du willst, sagen wir dir, wo es Kurse gibt.",
    a1Logistik: "Im Lager und in der Kommissionierung verlangen Arbeitgeber meist mindestens A2, weil du Arbeitsanweisungen und Sicherheitsregeln verstehen musst. Mit A1 raten wir ab. Mach zuerst A2, dann lohnt sich die Buchung deutlich mehr.",
    dispoB1: "In der Disposition telefonierst und schreibst du den ganzen Tag mit Fahrern, Kunden und Lager. Dafür brauchst du mindestens B1. Mit deinem Niveau raten wir ab. Mach zuerst B1. Bis dahin kann ein Job im Lager oder in der Kommissionierung eine Möglichkeit sein, dafür reicht oft A2.",
    a1Fahrer: "Mit A1 ist es als Fahrer möglich, aber eingeschränkt. Viele Arbeitgeber wünschen sich A2, damit du Lieferscheine, Anweisungen und Gespräche an der Rampe verstehst. Lerne nebenher weiter, das erhöht deine Chancen deutlich.",
    busDeutsch: "Im Bus sprichst du jeden Tag mit Fahrgästen. Busunternehmen verlangen deshalb meist mehr Deutsch, oft B1.",
    code95No: "Ohne Code 95 brauchst du in Deutschland die Grundqualifikation. Manche Arbeitgeber bieten sie an. Ob und wie das in deinem Fall geht, klären der Arbeitgeber und die Behörden.",
    code95UnknownPre: "Du weißt nicht, ob du Code 95 hast? Frag bei der Stelle nach, die deinen Führerschein ausgestellt hat.",
    driverCardNo: "Für Fahrten mit digitalem Tachografen brauchst du eine Fahrerkarte. Wenn du in Deutschland wohnst, beantragst du sie dort. Sprich das beim Arbeitgeber an.",
    wenigPraxis: "Du hast diese Klasse erst seit kurzer Zeit. Viele Arbeitgeber wünschen sich mindestens 1 bis 2 Jahre Fahrpraxis. Bewerben kannst du dich trotzdem.",
    notReadyWeich: "Wenn deine Unterlagen nicht bis {bis} fertig sind, kann der Arbeitgeber den Antrag ab {ab} kaum rechtzeitig stellen. Er landet dann sehr wahrscheinlich erst im Kontingent des Folgejahres. Du kannst trotzdem schon anfangen und bist dann gut vorbereitet.",
    notReadyHart: "Mappe bis {bis}, Arbeitgeber beantragt ab {ab}. Wenn du das nicht schaffst, warte.",
    readyYes: "Gut: Wenn deine Unterlagen bis {bis} fertig sind, kann der Arbeitgeber den Antrag ab {ab} stellen.",
    serbienFs: "Einen serbischen Führerschein, auch Klasse C und CE, kannst du in Deutschland ohne neue Prüfung umschreiben lassen.",
    green: "Für dein Profil gibt es in Deutschland in der Regel genug offene Stellen, auf die du dich selbst bewerben kannst. Eine Zusage ist trotzdem nicht sicher.",
    andere: "Unser Pilot für den Westbalkan ist im Moment für Lkw- und Busfahrer und für Lager und Logistik gedacht. Für andere Berufe gilt die allgemeine Einschätzung unten. Weitere Berufsgruppen sind für später geplant.",
    info: "So läuft die Westbalkanregelung: Den Antrag stellt der Arbeitgeber, nicht du. Es gibt ein Kontingent von 50.000 Zustimmungen pro Jahr, und die Agentur für Arbeit prüft vorher, ob es passende Bewerber aus Deutschland oder der EU gibt (Vorrangprüfung). Bewerben musst du dich selbst. WoYou vermittelt keine Stellen.",
  },
  en: {
    a0: "Without German we advise against booking. Even as a driver or in a warehouse you need some German every day, for example for safety rules and instructions. Don't book now. First take a German course to A1, better A2, and then do the self-check again. If you like, we can tell you where to find courses.",
    a1Logistik: "In warehouses and order picking, employers usually require at least A2, because you need to understand work instructions and safety rules. With A1 we advise against booking. Reach A2 first, then booking is much more worthwhile.",
    dispoB1: "In dispatch you spend the whole day on the phone and writing with drivers, customers and the warehouse. For that you need at least B1. With your level we advise against booking. Reach B1 first. Until then, a job in a warehouse or in order picking can be an option, A2 is often enough for that.",
    a1Fahrer: "With A1 it is possible as a driver, but with limits. Many employers would like A2, so that you understand delivery notes, instructions and conversations at the loading dock. Keep learning alongside, it clearly improves your chances.",
    busDeutsch: "On a bus you talk to passengers every day. Bus companies therefore usually require more German, often B1.",
    code95No: "Without Code 95 you need the basic qualification (Grundqualifikation) in Germany. Some employers offer it. Whether and how this works in your case is clarified by the employer and the authorities.",
    code95UnknownPre: "Not sure whether you have Code 95? Ask the office that issued your driving licence.",
    driverCardNo: "For driving with a digital tachograph you need a driver card. Once you live in Germany, you apply for it there. Bring it up with the employer.",
    wenigPraxis: "You have had this licence category for only a short time. Many employers would like at least 1 to 2 years of driving experience. You can still apply.",
    notReadyWeich: "If your documents are not ready by {bis}, the employer can hardly submit the application from {ab} in time. It will then most likely only count towards the following year's quota. You can still start now and will be well prepared.",
    notReadyHart: "Documents ready by {bis}, the employer applies from {ab}. If you can't make it, wait.",
    readyYes: "Good: if your documents are ready by {bis}, the employer can submit the application from {ab}.",
    serbienFs: "A Serbian driving licence, including categories C and CE, can be converted in Germany without a new test.",
    green: "For your profile there are usually enough open jobs in Germany that you can apply to yourself. An offer is still not guaranteed.",
    andere: "Our Western Balkans pilot is currently meant for truck and bus drivers and for warehouse and logistics. For other professions, the general assessment below applies. More job groups are planned for later.",
    info: "How the Western Balkans regulation works: the employer submits the application, not you. There is a quota of 50,000 approvals per year, and the Federal Employment Agency first checks whether there are suitable applicants from Germany or the EU (priority check). You apply yourself. WoYou does not place you in jobs.",
  },
  fr: {
    a0: "Sans connaissances d'allemand, nous vous le déconseillons. Même comme chauffeur ou en entrepôt, vous avez besoin d'un peu d'allemand chaque jour, par exemple pour les règles de sécurité et les consignes. Ne réservez pas maintenant. Suivez d'abord un cours d'allemand jusqu'au niveau A1, mieux A2, puis refaites le test. Si vous le souhaitez, nous vous indiquons où trouver des cours.",
    a1Logistik: "En entrepôt et en préparation de commandes, les employeurs demandent en général au moins A2, car vous devez comprendre les consignes de travail et de sécurité. Avec A1, nous vous le déconseillons. Atteignez d'abord A2, la réservation sera alors bien plus utile.",
    dispoB1: "En planification des transports, vous téléphonez et écrivez toute la journée avec les chauffeurs, les clients et l'entrepôt. Pour cela, il faut au moins B1. Avec votre niveau, nous vous le déconseillons. Atteignez d'abord B1. En attendant, un emploi en entrepôt ou en préparation de commandes peut être une option, A2 suffit souvent.",
    a1Fahrer: "Avec A1, c'est possible comme chauffeur, mais avec des limites. Beaucoup d'employeurs souhaitent A2, pour que vous compreniez les bons de livraison, les consignes et les échanges au quai de chargement. Continuez à apprendre en parallèle, cela augmente nettement vos chances.",
    busDeutsch: "Dans un bus, vous parlez chaque jour avec des passagers. Les entreprises de bus demandent donc en général plus d'allemand, souvent B1.",
    code95No: "Sans Code 95, vous avez besoin en Allemagne de la qualification initiale (Grundqualifikation). Certains employeurs la proposent. C'est l'employeur et les autorités qui clarifient si et comment cela fonctionne dans votre cas.",
    code95UnknownPre: "Vous ne savez pas si vous avez le Code 95 ? Renseignez-vous auprès du service qui a délivré votre permis.",
    driverCardNo: "Pour conduire avec un tachygraphe numérique, il vous faut une carte conducteur. Une fois installé en Allemagne, vous la demandez sur place. Parlez-en avec l'employeur.",
    wenigPraxis: "Vous avez cette catégorie de permis depuis peu. Beaucoup d'employeurs souhaitent au moins 1 à 2 ans d'expérience de conduite. Vous pouvez quand même postuler.",
    notReadyWeich: "Si vos documents ne sont pas prêts d'ici le {bis}, l'employeur pourra difficilement déposer la demande à temps à partir du {ab}. Elle relèvera alors très probablement du contingent de l'année suivante. Vous pouvez quand même commencer maintenant et vous aurez une longueur d'avance.",
    notReadyHart: "Dossier prêt d'ici le {bis}, l'employeur fait la demande à partir du {ab}. Si vous n'y arrivez pas, attendez.",
    readyYes: "Bien : si vos documents sont prêts d'ici le {bis}, l'employeur peut déposer la demande à partir du {ab}.",
    serbienFs: "Un permis serbe, y compris les catégories C et CE, peut être converti en Allemagne sans nouvel examen.",
    green: "Pour votre profil, il y a en général assez d'offres en Allemagne auxquelles vous pouvez postuler vous-même. Une embauche n'est toutefois pas garantie.",
    andere: "Notre pilote pour les Balkans occidentaux s'adresse pour l'instant aux chauffeurs poids lourd et bus ainsi qu'à l'entrepôt et à la logistique. Pour les autres métiers, l'évaluation générale ci-dessous s'applique. D'autres groupes de métiers sont prévus plus tard.",
    info: "Comment fonctionne la réglementation Balkans occidentaux (Westbalkanregelung) : c'est l'employeur qui dépose la demande, pas vous. Il existe un contingent de 50 000 autorisations par an, et l'Agence fédérale pour l'emploi vérifie d'abord s'il existe des candidats adaptés en Allemagne ou dans l'UE (examen de priorité). Vous postulez vous-même. WoYou ne fait pas de placement.",
  },
  ar: {
    a0: "بدون معرفة باللغة الألمانية ننصحك بعدم الحجز. حتى كسائق أو في المستودع تحتاج يوميًا إلى قليل من الألمانية، مثلًا لقواعد السلامة والتعليمات. لا تحجز الآن. تعلّم الألمانية أولًا حتى مستوى A1، والأفضل A2، ثم أعد هذا الاختبار. إذا أردت، نخبرك أين توجد دورات.",
    a1Logistik: "في المستودعات وتجهيز الطلبات يطلب أصحاب العمل عادةً مستوى A2 على الأقل، لأنك يجب أن تفهم تعليمات العمل وقواعد السلامة. مع A1 ننصحك بعدم الحجز. صِل أولًا إلى A2، وعندها يصبح الحجز أكثر فائدة بكثير.",
    dispoB1: "في تنسيق النقل تتصل وتكتب طوال اليوم مع السائقين والعملاء والمستودع. لذلك تحتاج إلى مستوى B1 على الأقل. مع مستواك الحالي ننصحك بعدم الحجز. صِل أولًا إلى B1. حتى ذلك الحين قد تكون وظيفة في المستودع أو في تجهيز الطلبات خيارًا، وغالبًا يكفي لها A2.",
    a1Fahrer: "مع A1 العمل كسائق ممكن، لكن مع قيود. كثير من أصحاب العمل يفضّلون A2 حتى تفهم أوراق التسليم والتعليمات والحديث عند رصيف التحميل. واصل التعلّم بالتوازي، فهذا يرفع فرصك بوضوح.",
    busDeutsch: "في الحافلة تتحدث كل يوم مع الركاب. لذلك تطلب شركات الحافلات عادةً مستوى أعلى في الألمانية، غالبًا B1.",
    code95No: "بدون Code 95 تحتاج في ألمانيا إلى التأهيل الأساسي للسائقين (Grundqualifikation). بعض أصحاب العمل يوفّرونه. هل يمكن ذلك في حالتك وكيف، يحدده صاحب العمل والجهات الرسمية.",
    code95UnknownPre: "لا تعرف إن كان لديك Code 95؟ اسأل الجهة التي أصدرت رخصة قيادتك.",
    driverCardNo: "للقيادة بجهاز تاكوغراف رقمي تحتاج إلى بطاقة سائق. عندما تسكن في ألمانيا تطلبها هناك. تحدّث عن ذلك مع صاحب العمل.",
    wenigPraxis: "لديك هذه الفئة منذ وقت قصير فقط. كثير من أصحاب العمل يفضّلون خبرة قيادة لا تقل عن سنة إلى سنتين. ومع ذلك يمكنك التقدّم.",
    notReadyWeich: "إذا لم تكن مستنداتك جاهزة حتى {bis}، فمن الصعب أن يقدّم صاحب العمل الطلب في الوقت المناسب ابتداءً من {ab}. وعندها سيدخل الطلب على الأرجح في حصة السنة التالية. يمكنك مع ذلك أن تبدأ الآن وتكون مستعدًا جيدًا.",
    notReadyHart: "الملف جاهز حتى {bis}، وصاحب العمل يقدّم الطلب ابتداءً من {ab}. إذا لم تستطع ذلك، انتظر.",
    readyYes: "جيد: إذا كانت مستنداتك جاهزة حتى {bis}، يمكن لصاحب العمل تقديم الطلب ابتداءً من {ab}.",
    serbienFs: "رخصة القيادة الصربية، بما فيها الفئتان C وCE، يمكن تحويلها في ألمانيا بدون امتحان جديد.",
    green: "لملفك توجد في ألمانيا عادةً وظائف شاغرة كافية يمكنك التقدّم إليها بنفسك. ومع ذلك يبقى القبول غير مضمون.",
    andere: "برنامجنا التجريبي لدول غرب البلقان مخصص حاليًا لسائقي الشاحنات والحافلات ولوظائف المستودعات واللوجستيك. لباقي المهن ينطبق التقييم العام أدناه. مجموعات مهنية أخرى مخطط لها لاحقًا.",
    info: "هكذا تعمل لائحة غرب البلقان (Westbalkanregelung): صاحب العمل هو من يقدّم الطلب، وليس أنت. توجد حصة من 50.000 موافقة في السنة، وتتحقق وكالة العمل أولًا مما إذا كان هناك متقدمون مناسبون من ألمانيا أو الاتحاد الأوروبي (فحص الأولوية). أنت من يتقدّم إلى الوظائف بنفسك. WoYou لا تتوسط في التوظيف.",
  },
  hi: {
    a0: "जर्मन के बिना हम बुकिंग की सलाह नहीं देते। ड्राइवर के रूप में या गोदाम में भी रोज़ थोड़ी जर्मन चाहिए, जैसे सुरक्षा नियमों और निर्देशों के लिए। अभी बुक न करें। पहले A1 तक, बेहतर A2 तक जर्मन सीखें और फिर यह जाँच दोबारा करें। चाहें तो हम बता सकते हैं कि कोर्स कहाँ मिलते हैं।",
    a1Logistik: "गोदाम और ऑर्डर पिकिंग में नियोक्ता आमतौर पर कम से कम A2 माँगते हैं, क्योंकि आपको काम के निर्देश और सुरक्षा नियम समझने होते हैं। A1 के साथ हम सलाह नहीं देते। पहले A2 तक पहुँचें, तब बुकिंग कहीं ज़्यादा फ़ायदेमंद है।",
    dispoB1: "डिस्पैच में आप पूरे दिन ड्राइवरों, ग्राहकों और गोदाम से फ़ोन पर बात करते और लिखते हैं। इसके लिए कम से कम B1 चाहिए। आपके स्तर के साथ हम सलाह नहीं देते। पहले B1 तक पहुँचें। तब तक गोदाम या ऑर्डर पिकिंग की नौकरी एक विकल्प हो सकती है, उसके लिए अक्सर A2 काफ़ी है।",
    a1Fahrer: "A1 के साथ ड्राइवर के रूप में काम संभव है, पर सीमाओं के साथ। कई नियोक्ता A2 चाहते हैं, ताकि आप डिलीवरी के काग़ज़, निर्देश और लोडिंग पर बातचीत समझ सकें। साथ में सीखते रहें, इससे आपके मौके साफ़ तौर पर बढ़ते हैं।",
    busDeutsch: "बस में आप रोज़ यात्रियों से बात करते हैं। इसलिए बस कंपनियाँ आमतौर पर ज़्यादा जर्मन माँगती हैं, अक्सर B1।",
    code95No: "Code 95 के बिना जर्मनी में आपको बुनियादी योग्यता (Grundqualifikation) चाहिए। कुछ नियोक्ता इसे देते हैं। आपके मामले में यह होगा या नहीं और कैसे, यह नियोक्ता और अधिकारी तय करते हैं।",
    code95UnknownPre: "पता नहीं कि आपके पास Code 95 है या नहीं? उस दफ़्तर से पूछें जिसने आपका ड्राइविंग लाइसेंस जारी किया।",
    driverCardNo: "डिजिटल टैकोग्राफ़ वाली गाड़ी चलाने के लिए ड्राइवर कार्ड चाहिए। जब आप जर्मनी में रहते हैं, तब वहीं इसके लिए आवेदन करते हैं। इस बारे में नियोक्ता से बात करें।",
    wenigPraxis: "यह श्रेणी आपके पास अभी थोड़े समय से है। कई नियोक्ता कम से कम 1 से 2 साल का ड्राइविंग अनुभव चाहते हैं। फिर भी आप आवेदन कर सकते हैं।",
    notReadyWeich: "अगर आपके दस्तावेज़ {bis} तक तैयार नहीं हैं, तो नियोक्ता {ab} से समय पर आवेदन मुश्किल से कर पाएगा। तब आवेदन शायद अगले साल के कोटे में जाएगा। फिर भी आप अभी शुरू कर सकते हैं और अच्छी तरह तैयार रहेंगे।",
    notReadyHart: "दस्तावेज़ {bis} तक तैयार, नियोक्ता {ab} से आवेदन करता है। अगर आप यह नहीं कर पाते, तो इंतज़ार करें।",
    readyYes: "अच्छा: अगर आपके दस्तावेज़ {bis} तक तैयार हैं, तो नियोक्ता {ab} से आवेदन कर सकता है।",
    serbienFs: "सर्बिया का ड्राइविंग लाइसेंस, C और CE श्रेणी भी, जर्मनी में बिना नई परीक्षा के बदलवाया जा सकता है।",
    green: "आपकी प्रोफ़ाइल के लिए जर्मनी में आमतौर पर काफ़ी खुली नौकरियाँ होती हैं, जिन पर आप ख़ुद आवेदन कर सकते हैं। फिर भी नौकरी मिलना पक्का नहीं है।",
    andere: "पश्चिमी बाल्कन के लिए हमारा पायलट अभी ट्रक और बस ड्राइवरों और गोदाम व लॉजिस्टिक्स के लिए है। दूसरे पेशों के लिए नीचे दी गई सामान्य जाँच लागू होती है। दूसरे पेशा समूह बाद में आने की योजना है।",
    info: "पश्चिमी बाल्कन नियम (Westbalkanregelung) ऐसे काम करता है: आवेदन नियोक्ता करता है, आप नहीं। हर साल 50,000 मंज़ूरियों का कोटा है, और रोज़गार एजेंसी पहले जाँचती है कि जर्मनी या EU से कोई उपयुक्त उम्मीदवार है या नहीं (प्राथमिकता जाँच)। नौकरियों पर आवेदन आप ख़ुद करते हैं। WoYou नौकरी नहीं दिलाता।",
  },
  sr: {
    a0: "Bez znanja nemačkog ne preporučujemo ti porudžbinu. I kao vozaču ili u magacinu svaki dan ti treba malo nemačkog, na primer za pravila bezbednosti i dogovore. Nemoj sada da naručiš. Prvo završi kurs nemačkog do nivoa A1, bolje A2, pa ponovo uradi ovu proveru. Ako želiš, reći ćemo ti gde ima kurseva.",
    a1Logistik: "U magacinu i komisioniranju poslodavci po pravilu traže najmanje A2, jer moraš da razumeš radna uputstva i pravila bezbednosti. Sa A1 ne preporučujemo porudžbinu. Prvo dostigni A2, tada se porudžbina mnogo više isplati.",
    dispoB1: "U dispečerskom poslu ceo dan telefoniraš i pišeš vozačima, kupcima i magacinu. Za to ti treba najmanje B1. Sa tvojim nivoom ne preporučujemo porudžbinu. Prvo dostigni B1. Do tada posao u magacinu ili komisioniranju može da bude opcija, za to je često dovoljan A2.",
    a1Fahrer: "Sa A1 je posao vozača moguć, ali uz ograničenja. Mnogi poslodavci žele A2, da bi se razumele otpremnice, uputstva i razgovori na rampi. Uči paralelno dalje, to ti znatno povećava šanse.",
    busDeutsch: "U autobusu svaki dan razgovaraš sa putnicima. Zato prevoznici obično traže više nemačkog, često B1.",
    code95No: "Bez koda 95 u Nemačkoj ti treba osnovna kvalifikacija (Grundqualifikation). Neki poslodavci je nude. Da li i kako to ide u tvom slučaju, razjašnjavaju poslodavac i nadležni organi.",
    code95UnknownPre: "Ne znaš da li imaš kod 95? Pitaj u službi koja ti je izdala vozačku dozvolu.",
    driverCardNo: "Za vožnju sa digitalnim tahografom treba ti kartica vozača. Kada živiš u Nemačkoj, tamo podnosiš zahtev za nju. Razgovaraj o tome sa poslodavcem.",
    wenigPraxis: "Ovu kategoriju imaš tek kratko vreme. Mnogi poslodavci žele najmanje 1 do 2 godine vozačkog iskustva. Ipak možeš da se prijaviš.",
    notReadyWeich: "Ako tvoja dokumenta nisu spremna do {bis}, teško da poslodavac od {ab} može na vreme da podnese zahtev. Tada će zahtev vrlo verovatno ući tek u kvotu za sledeću godinu. Ipak možeš već sada da počneš i imaćeš prednost.",
    notReadyHart: "Dokumenta do {bis}, poslodavac od {ab} podnosi zahtev. Ako to ne stigneš, sačekaj.",
    readyYes: "Dobro: ako su tvoja dokumenta spremna do {bis}, poslodavac od {ab} može da podnese zahtev.",
    serbienFs: "Srpsku vozačku dozvolu, i kategorije C i CE, možeš u Nemačkoj da zameniš bez novog ispita.",
    green: "Za tvoj profil u Nemačkoj po pravilu ima dovoljno otvorenih radnih mesta na koja možeš lično da se prijaviš. Ipak, ponuda za posao nije zagarantovana.",
    andere: "Naš pilot za Zapadni Balkan je trenutno namenjen vozačima kamiona i autobusa i poslovima u magacinu i logistici. Za ostala zanimanja važi opšta procena ispod. Ostale grupe zanimanja planiramo kasnije.",
    info: "Ovako funkcioniše Westbalkanregelung (propis za Zapadni Balkan): zahtev podnosi poslodavac, ne ti. Postoji kvota od 50.000 odobrenja godišnje, a Agencija za rad (Agentur für Arbeit) prvo proverava da li ima odgovarajućih kandidata iz Nemačke ili EU (provera prednosti). Na posao se prijavljuješ lično. WoYou ne posreduje u zapošljavanju.",
  },
  te: {
    a0: "జర్మన్ రాకుండా మేము బుకింగ్ సలహా ఇవ్వము. డ్రైవర్‌గా లేదా గిడ్డంగిలో కూడా రోజూ కొంత జర్మన్ అవసరం, ఉదా. భద్రతా నియమాలు, సూచనల కోసం. ఇప్పుడు బుక్ చేయకండి. ముందుగా A1 వరకు, వీలైతే A2 వరకు జర్మన్ నేర్చుకుని, తర్వాత ఈ పరీక్ష మళ్ళీ చేయండి. మీకు కావాలంటే కోర్సులు ఎక్కడ ఉన్నాయో మేము చెబుతాము.",
    a1Logistik: "గిడ్డంగి మరియు ఆర్డర్ పికింగ్ ఉద్యోగాలకు యజమానులు సాధారణంగా కనీసం A2 అడుగుతారు, ఎందుకంటే పని సూచనలు, భద్రతా నియమాలు మీకు అర్థం కావాలి. A1 తో మేము బుకింగ్ సలహా ఇవ్వము. ముందుగా A2 చేరుకోండి, అప్పుడు బుకింగ్ చాలా ఎక్కువ ఉపయోగకరం.",
    dispoB1: "డిస్పాచ్ పనిలో రోజంతా డ్రైవర్లు, కస్టమర్లు, గిడ్డంగితో ఫోన్‌లో మాట్లాడతారు, రాస్తారు. దీనికి కనీసం B1 కావాలి. మీ స్థాయితో మేము బుకింగ్ సలహా ఇవ్వము. ముందుగా B1 చేరుకోండి. అప్పటి వరకు గిడ్డంగి లేదా ఆర్డర్ పికింగ్ ఉద్యోగం ఒక అవకాశం కావచ్చు, దానికి తరచుగా A2 సరిపోతుంది.",
    a1Fahrer: "A1 తో డ్రైవర్‌గా పని సాధ్యమే, కానీ పరిమితులతో. చాలా మంది యజమానులు A2 కోరుకుంటారు, అప్పుడు డెలివరీ పత్రాలు, సూచనలు, లోడింగ్ దగ్గర మాటలు మీకు అర్థమవుతాయి. దానితో పాటు నేర్చుకుంటూ ఉండండి, దాంతో మీ అవకాశాలు బాగా పెరుగుతాయి.",
    busDeutsch: "బస్సులో మీరు రోజూ ప్రయాణికులతో మాట్లాడతారు. అందుకే బస్ కంపెనీలు సాధారణంగా ఎక్కువ జర్మన్ అడుగుతాయి, తరచుగా B1.",
    code95No: "Code 95 లేకుండా జర్మనీలో మీకు ప్రాథమిక అర్హత (Grundqualifikation) అవసరం. కొంతమంది యజమానులు దీన్ని అందిస్తారు. మీ విషయంలో ఇది సాధ్యమా, ఎలా అనేది యజమాని మరియు అధికారులు నిర్ణయిస్తారు.",
    code95UnknownPre: "మీకు Code 95 ఉందో లేదో తెలియదా? మీ డ్రైవింగ్ లైసెన్స్ ఇచ్చిన కార్యాలయంలో అడగండి.",
    driverCardNo: "డిజిటల్ టాకోగ్రాఫ్‌తో వాహనం నడపడానికి డ్రైవర్ కార్డ్ కావాలి. మీరు జర్మనీలో నివసించినప్పుడు అక్కడే దానికి దరఖాస్తు చేస్తారు. దీని గురించి యజమానితో మాట్లాడండి.",
    wenigPraxis: "ఈ వర్గం లైసెన్స్ మీకు కొద్ది కాలంగానే ఉంది. చాలా మంది యజమానులు కనీసం 1 నుంచి 2 సంవత్సరాల డ్రైవింగ్ అనుభవం కోరుకుంటారు. అయినా మీరు దరఖాస్తు చేయవచ్చు.",
    notReadyWeich: "మీ పత్రాలు {bis} లోగా సిద్ధం కాకపోతే, యజమాని {ab} నుంచి సమయానికి దరఖాస్తు చేయడం కష్టం. అప్పుడు దరఖాస్తు చాలావరకు తర్వాతి సంవత్సరం కోటాలోకి వెళ్తుంది. అయినా మీరు ఇప్పుడే మొదలుపెట్టి బాగా సిద్ధంగా ఉండవచ్చు.",
    notReadyHart: "పత్రాలు {bis} లోగా సిద్ధం, యజమాని {ab} నుంచి దరఖాస్తు చేస్తారు. మీరు అది చేయలేకపోతే, వేచి ఉండండి.",
    readyYes: "మంచిది: మీ పత్రాలు {bis} లోగా సిద్ధమైతే, యజమాని {ab} నుంచి దరఖాస్తు చేయవచ్చు.",
    serbienFs: "సెర్బియా డ్రైవింగ్ లైసెన్స్‌ను, C మరియు CE వర్గాలతో సహా, జర్మనీలో కొత్త పరీక్ష లేకుండా మార్చుకోవచ్చు.",
    green: "మీ ప్రొఫైల్‌కు జర్మనీలో సాధారణంగా మీరే దరఖాస్తు చేసుకోగలిగే సరిపడా ఖాళీ ఉద్యోగాలు ఉంటాయి. అయినా ఉద్యోగం వస్తుందని హామీ లేదు.",
    andere: "పశ్చిమ బాల్కన్ కోసం మా పైలట్ ప్రస్తుతం ట్రక్ మరియు బస్ డ్రైవర్లకు, గిడ్డంగి మరియు లాజిస్టిక్స్ ఉద్యోగాలకు మాత్రమే. ఇతర వృత్తులకు కింద ఉన్న సాధారణ అంచనా వర్తిస్తుంది. ఇతర వృత్తి సమూహాలు తర్వాత ప్రణాళికలో ఉన్నాయి.",
    info: "పశ్చిమ బాల్కన్ నియమం (Westbalkanregelung) ఇలా పనిచేస్తుంది: దరఖాస్తు యజమాని చేస్తారు, మీరు కాదు. సంవత్సరానికి 50,000 అనుమతుల కోటా ఉంది, ముందుగా ఉపాధి సంస్థ జర్మనీ లేదా EU నుంచి సరైన అభ్యర్థులు ఉన్నారా అని తనిఖీ చేస్తుంది (ప్రాధాన్యత తనిఖీ). ఉద్యోగాలకు మీరే దరఖాస్తు చేస్తారు. WoYou ఉద్యోగ నియామకం చేయదు.",
  },
};

const fill = (s: string, lang: CheckLang = "de") => s.replace("{bis}", saisonDatum(UNTERLAGEN_BIS, lang)).replace("{ab}", saisonDatum(ANTRAG_AB, lang));

function evaluateBalkan(a: Answer, land: BalkanLand, lang: CheckLang, opts: BalkanOpts): Verdict {
  const b = BALKAN_TEXT[lang], x = a.balkan!, g = x.group;
  const f = (s: string) => fill(s, lang);
  const driver = isDriverGroup(g), logistik = g === "lager" || g === "stapler";
  const info = [f(b.info)];
  const red = (r: string): Verdict => ({ level: "red", reasons: [r, ...info] });

  // 1. Deutsch: A0 abraten, Disposition unter B1 abraten, Lager/Stapler unter A2 abraten (wie allgemeiner Check)
  if (a.german === "none") return red(b.a0);
  if (g === "dispo" && !atLeast(a.german, "B1")) return red(b.dispoB1);
  if (logistik && !atLeast(a.german, "A2")) return red(b.a1Logistik);
  // 2. harter Kalender-Satz: wer die Unterlagen nicht rechtzeitig schafft, soll warten
  const kalender = opts.kalender ?? KALENDER_SATZ;
  if (x.ready === "no" && kalender === "hart") return red(f(b.notReadyHart));

  const issues: string[] = [];
  if (driver && a.german === "A1") issues.push(b.a1Fahrer);
  if (g === "bus" && !atLeast(a.german, "B1")) issues.push(b.busDeutsch);
  // ANWALT PRÜFEN: Einreise ohne Code 95 und Grundqualifikation beim Arbeitgeber (Konzept v4, Prüfung durch Anwalt offen). Text bewusst vorsichtig.
  if (driver && x.code95 === "no") issues.push(b.code95No);
  if (driver && x.code95 === "unknown") issues.push(`${b.code95UnknownPre} ${b.code95No}`);
  // ANWALT PRÜFEN: Fahrerkarte wird vom Wohnsitzstaat ausgestellt
  if (driver && x.driverCard === "no") issues.push(b.driverCardNo);
  const year = Number(x.since), now = opts.now ?? new Date();
  if (driver && /^\d{4}$/.test(x.since) && year <= now.getFullYear() && now.getFullYear() - year < MIN_FAHRPRAXIS_JAHRE) issues.push(b.wenigPraxis);
  if (x.ready === "no") issues.push(f(b.notReadyWeich));

  // Hinweise ohne Einfluss auf die Ampel
  if (x.ready === "yes") info.unshift(f(b.readyYes));
  // Anlage 11 FeV: serbischer Führerschein (auch C/CE) ohne Prüfung umschreibbar (laut Konzept nur für Serbien bestätigt)
  if (driver && land === "RS") info.unshift(b.serbienFs);

  if (issues.length) return { level: "yellow", reasons: [...issues, ...info] };
  return { level: "green", reasons: [b.green, ...info] };
}
