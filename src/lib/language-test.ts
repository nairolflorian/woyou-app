export type TestQuestion = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  language: "de" | "en";
  prompt: string;
  options: string[];
  correctIndex: number;
};

// Demo: 12 multiple-choice questions covering A1 → B2 in German
// (in production this would be language-specific and adaptive)
export const LANGUAGE_TEST: TestQuestion[] = [
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
];

export function gradeTest(answers: Record<string, number>): {
  score: number;
  total: number;
  level: "NONE" | "A1" | "A2" | "B1" | "B2";
  passed: boolean;
  details: { id: string; correct: boolean }[];
} {
  let score = 0;
  const details = LANGUAGE_TEST.map((q) => {
    const correct = answers[q.id] === q.correctIndex;
    if (correct) score++;
    return { id: q.id, correct };
  });
  const total = LANGUAGE_TEST.length;
  let level: "NONE" | "A1" | "A2" | "B1" | "B2" = "NONE";
  const a1 = details.slice(0, 3).filter((d) => d.correct).length;
  const a2 = details.slice(3, 6).filter((d) => d.correct).length;
  const b1 = details.slice(6, 9).filter((d) => d.correct).length;
  const b2 = details.slice(9, 12).filter((d) => d.correct).length;
  if (a1 >= 2) level = "A1";
  if (a1 >= 2 && a2 >= 2) level = "A2";
  if (a1 >= 2 && a2 >= 2 && b1 >= 2) level = "B1";
  if (a1 >= 2 && a2 >= 2 && b1 >= 2 && b2 >= 2) level = "B2";
  return { score, total, level, passed: score >= 6, details };
}
