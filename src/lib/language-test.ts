export type TestLang = "de" | "fr" | "ar" | "en";

export type TestQuestion = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  language: TestLang;
  prompt: string;
  options: string[];
  correctIndex: number;
};

// 12 multiple-choice items per language, 3 per CEFR level (A1, A2, B1, B2).

export const TESTS: Record<TestLang, TestQuestion[]> = {
  de: [
    {
      id: "de-a1-1",
      level: "A1",
      language: "de",
      prompt: "Wie heißt du? — _____ Mohamed.",
      options: ["Ich heiße", "Du bist", "Er ist", "Sie heißen"],
      correctIndex: 0,
    },
    {
      id: "de-a1-2",
      level: "A1",
      language: "de",
      prompt: "Welcher Artikel ist richtig? _____ Frau heißt Anna.",
      options: ["Der", "Die", "Das", "Den"],
      correctIndex: 1,
    },
    {
      id: "de-a1-3",
      level: "A1",
      language: "de",
      prompt: "Ich _____ aus Marokko.",
      options: ["bin", "bist", "sind", "ist"],
      correctIndex: 0,
    },
    {
      id: "de-a2-1",
      level: "A2",
      language: "de",
      prompt: "Gestern _____ ich ins Kino gegangen.",
      options: ["habe", "bin", "war", "hatte"],
      correctIndex: 1,
    },
    {
      id: "de-a2-2",
      level: "A2",
      language: "de",
      prompt: "Wenn ich Zeit habe, _____ ich zu Hause.",
      options: ["bleibt", "bleibst", "bleibe", "geblieben"],
      correctIndex: 2,
    },
    {
      id: "de-a2-3",
      level: "A2",
      language: "de",
      prompt: 'Was bedeutet „Krankenversicherung"?',
      options: [
        "Eine Versicherung für Reisen",
        "Eine Versicherung im Krankheitsfall",
        "Ein Vertrag für Wohnungen",
        "Ein Bankkredit",
      ],
      correctIndex: 1,
    },
    {
      id: "de-b1-1",
      level: "B1",
      language: "de",
      prompt: "Ich freue mich _____ das Treffen morgen.",
      options: ["auf", "über", "an", "für"],
      correctIndex: 0,
    },
    {
      id: "de-b1-2",
      level: "B1",
      language: "de",
      prompt: "Wenn ich mehr Zeit _____, würde ich Deutsch lernen.",
      options: ["habe", "hätte", "haben", "gehabt"],
      correctIndex: 1,
    },
    {
      id: "de-b1-3",
      level: "B1",
      language: "de",
      prompt: "Welcher Satz ist im Passiv?",
      options: [
        "Der Chef ruft den Mitarbeiter an.",
        "Der Mitarbeiter wird vom Chef angerufen.",
        "Der Chef hat angerufen.",
        "Der Mitarbeiter ruft den Chef an.",
      ],
      correctIndex: 1,
    },
    {
      id: "de-b2-1",
      level: "B2",
      language: "de",
      prompt: "Trotz _____ Wetters fand das Fest statt.",
      options: ["dem schlechten", "des schlechten", "der schlechte", "den schlechten"],
      correctIndex: 1,
    },
    {
      id: "de-b2-2",
      level: "B2",
      language: "de",
      prompt: 'Was bedeutet „eine Aufenthaltserlaubnis beantragen"?',
      options: [
        "Eine Wohnung mieten",
        "Offiziell um das Recht zu bleiben bitten",
        "Eine Reise planen",
        "Einen Job kündigen",
      ],
      correctIndex: 1,
    },
    {
      id: "de-b2-3",
      level: "B2",
      language: "de",
      prompt: "Welche Konjunktion passt? Sie kommt nicht, _____ sie krank ist.",
      options: ["weil", "damit", "obwohl", "trotzdem"],
      correctIndex: 0,
    },
  ],

  fr: [
    {
      id: "fr-a1-1",
      level: "A1",
      language: "fr",
      prompt: "Comment t'appelles-tu ? — _____ Mohamed.",
      options: ["Je m'appelle", "Tu es", "Il est", "Vous appelez"],
      correctIndex: 0,
    },
    {
      id: "fr-a1-2",
      level: "A1",
      language: "fr",
      prompt: "Quel article est correct ? _____ table est grande.",
      options: ["Le", "La", "Les", "Un"],
      correctIndex: 1,
    },
    {
      id: "fr-a1-3",
      level: "A1",
      language: "fr",
      prompt: "Je _____ du Maroc.",
      options: ["suis", "es", "sont", "est"],
      correctIndex: 0,
    },
    {
      id: "fr-a2-1",
      level: "A2",
      language: "fr",
      prompt: "Hier, je _____ allé au cinéma.",
      options: ["ai", "suis", "était", "avais"],
      correctIndex: 1,
    },
    {
      id: "fr-a2-2",
      level: "A2",
      language: "fr",
      prompt: "Si j'ai le temps, je _____ à la maison.",
      options: ["reste", "restes", "restent", "resté"],
      correctIndex: 0,
    },
    {
      id: "fr-a2-3",
      level: "A2",
      language: "fr",
      prompt: 'Que signifie « assurance maladie » ?',
      options: [
        "Une assurance pour voyager",
        "Une assurance en cas de maladie",
        "Un contrat de location",
        "Un crédit bancaire",
      ],
      correctIndex: 1,
    },
    {
      id: "fr-b1-1",
      level: "B1",
      language: "fr",
      prompt: "Je me réjouis _____ la rencontre de demain.",
      options: ["pour", "de", "à", "sur"],
      correctIndex: 1,
    },
    {
      id: "fr-b1-2",
      level: "B1",
      language: "fr",
      prompt: "Si j'avais plus de temps, j'_____ l'allemand.",
      options: ["apprends", "apprendrais", "apprendre", "ai appris"],
      correctIndex: 1,
    },
    {
      id: "fr-b1-3",
      level: "B1",
      language: "fr",
      prompt: "Quelle phrase est au passif ?",
      options: [
        "Le chef appelle l'employé.",
        "L'employé est appelé par le chef.",
        "Le chef a appelé.",
        "L'employé appelle le chef.",
      ],
      correctIndex: 1,
    },
    {
      id: "fr-b2-1",
      level: "B2",
      language: "fr",
      prompt: "_____ la pluie, la fête a eu lieu.",
      options: ["Malgré", "Pendant", "Bien que", "Parce que"],
      correctIndex: 0,
    },
    {
      id: "fr-b2-2",
      level: "B2",
      language: "fr",
      prompt: 'Que signifie « demander un titre de séjour » ?',
      options: [
        "Louer un appartement",
        "Demander officiellement le droit de rester",
        "Planifier un voyage",
        "Démissionner d'un poste",
      ],
      correctIndex: 1,
    },
    {
      id: "fr-b2-3",
      level: "B2",
      language: "fr",
      prompt: "Choisis la conjonction correcte : Elle ne vient pas _____ elle est malade.",
      options: ["parce qu'", "afin qu'", "bien qu'", "au lieu qu'"],
      correctIndex: 0,
    },
  ],

  ar: [
    {
      id: "ar-a1-1",
      level: "A1",
      language: "ar",
      prompt: "ما اسمك؟ — _____ محمد.",
      options: ["اسمي", "أنت", "هو", "هي"],
      correctIndex: 0,
    },
    {
      id: "ar-a1-2",
      level: "A1",
      language: "ar",
      prompt: "ما هو ضمير المتكلم المفرد؟",
      options: ["أنت", "هو", "أنا", "هم"],
      correctIndex: 2,
    },
    {
      id: "ar-a1-3",
      level: "A1",
      language: "ar",
      prompt: "أنا _____ من المغرب.",
      options: ["قادم", "تذهب", "يأتي", "نسافر"],
      correctIndex: 0,
    },
    {
      id: "ar-a2-1",
      level: "A2",
      language: "ar",
      prompt: "أمس _____ إلى السينما.",
      options: ["أذهب", "ذهبت", "سأذهب", "اذهب"],
      correctIndex: 1,
    },
    {
      id: "ar-a2-2",
      level: "A2",
      language: "ar",
      prompt: "إذا كان لدي وقت، فأنا _____ في البيت.",
      options: ["تبقى", "أبقى", "نبقى", "تبقين"],
      correctIndex: 1,
    },
    {
      id: "ar-a2-3",
      level: "A2",
      language: "ar",
      prompt: 'ما معنى « التأمين الصحي »؟',
      options: [
        "تأمين للسفر",
        "تأمين في حال المرض",
        "عقد إيجار",
        "قرض بنكي",
      ],
      correctIndex: 1,
    },
    {
      id: "ar-b1-1",
      level: "B1",
      language: "ar",
      prompt: "أنا متحمس _____ لقاء الغد.",
      options: ["لـ", "في", "عن", "على"],
      correctIndex: 0,
    },
    {
      id: "ar-b1-2",
      level: "B1",
      language: "ar",
      prompt: "لو _____ المزيد من الوقت لتعلمت الألمانية.",
      options: ["لدي", "كان لدي", "أملك", "لديها"],
      correctIndex: 1,
    },
    {
      id: "ar-b1-3",
      level: "B1",
      language: "ar",
      prompt: "أي جملة مبنية للمجهول؟",
      options: [
        "المدير يستدعي الموظف.",
        "الموظف يُستدعى من قبل المدير.",
        "المدير اتصل.",
        "الموظف يستدعي المدير.",
      ],
      correctIndex: 1,
    },
    {
      id: "ar-b2-1",
      level: "B2",
      language: "ar",
      prompt: "_____ سوء الطقس، أُقيم الحفل.",
      options: ["رغم", "بعد", "خلال", "بسبب"],
      correctIndex: 0,
    },
    {
      id: "ar-b2-2",
      level: "B2",
      language: "ar",
      prompt: 'ما معنى « طلب تصريح الإقامة »؟',
      options: [
        "استئجار شقة",
        "طلب رسمي للحق في البقاء",
        "تخطيط رحلة",
        "ترك العمل",
      ],
      correctIndex: 1,
    },
    {
      id: "ar-b2-3",
      level: "B2",
      language: "ar",
      prompt: "اختر أداة الربط الصحيحة: لم تأتِ _____ كانت مريضة.",
      options: ["لأنها", "لكي", "رغم أنها", "بدلاً من أن"],
      correctIndex: 0,
    },
  ],

  en: [], // placeholder — English not currently exposed in UI
};

// Backwards-compat: keep LANGUAGE_TEST pointing at the German test for callers
// that don't pick a language explicitly.
export const LANGUAGE_TEST: TestQuestion[] = TESTS.de;

export const TEST_LANG_LABEL: Record<TestLang, { de: string; en: string; fr: string; ar: string; flag: string }> = {
  de: { de: "Deutsch", en: "German", fr: "Allemand", ar: "الألمانية", flag: "🇩🇪" },
  fr: { de: "Französisch", en: "French", fr: "Français", ar: "الفرنسية", flag: "🇫🇷" },
  ar: { de: "Arabisch", en: "Arabic", fr: "Arabe", ar: "العربية", flag: "🇸🇦" },
  en: { de: "Englisch", en: "English", fr: "Anglais", ar: "الإنجليزية", flag: "🇬🇧" },
};

export function gradeTest(answers: Record<string, number>): {
  score: number;
  total: number;
  level: "NONE" | "A1" | "A2" | "B1" | "B2";
  passed: boolean;
  details: { id: string; correct: boolean }[];
} {
  // Accept answers from any test; identify which question set was used by
  // looking up answer ids in TESTS.
  const allQuestions = [...TESTS.de, ...TESTS.fr, ...TESTS.ar];
  const used = allQuestions.filter((q) => answers[q.id] !== undefined);
  const total = used.length || LANGUAGE_TEST.length;

  let score = 0;
  const details = used.map((q) => {
    const correct = answers[q.id] === q.correctIndex;
    if (correct) score++;
    return { id: q.id, correct };
  });

  // Level: pass a level if at least 2/3 questions of that level are correct.
  const byLevel = (lv: "A1" | "A2" | "B1" | "B2") =>
    used.filter((q) => q.level === lv).filter((q) => answers[q.id] === q.correctIndex).length;

  let level: "NONE" | "A1" | "A2" | "B1" | "B2" = "NONE";
  if (byLevel("A1") >= 2) level = "A1";
  if (level === "A1" && byLevel("A2") >= 2) level = "A2";
  if (level === "A2" && byLevel("B1") >= 2) level = "B1";
  if (level === "B1" && byLevel("B2") >= 2) level = "B2";

  return { score, total, level, passed: score >= Math.ceil(total / 2), details };
}

export function getTest(language: TestLang): TestQuestion[] {
  return TESTS[language] ?? TESTS.de;
}
