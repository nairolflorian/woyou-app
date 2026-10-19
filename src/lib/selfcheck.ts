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

export function evaluate(a: Answer, lang: "de" | "en" = "de"): Verdict {
  const t = (de: string, en: string) => (lang === "en" ? en : de);
  const reasons: string[] = [];
  const regulated = REGULATED.test(a.job), health = HEALTH.test(a.job), helper = HELPER.test(a.job);

  if (!atLeast(a.german, "A2")) {
    return { level: "red", reasons: [t("Ohne Deutschkenntnisse hat dieses Profil aktuell kaum Chancen. Buche nicht. Mach zuerst einen Deutschkurs bis A2 oder B1. Wenn du willst, sagen wir dir, wo das geht.", "Without German skills this profile currently has very little chance. Don't book. Take a German course to A2 or B1 first. If you like, we can tell you where.")] };
  }
  if (regulated && (a.recognition === "no" || a.recognition === "unknown")) {
    return { level: "red", reasons: [t("Dein Beruf ist in Deutschland reglementiert. Ohne Anerkennung (oder ein laufendes Verfahren) laden Arbeitgeber in der Regel nicht ein. Kläre zuerst die Anerkennung, z. B. über anerkennung-in-deutschland.de.", "Your profession is regulated in Germany. Without recognition (or a pending procedure) employers usually do not invite you. Sort out recognition first, e.g. via anerkennung-in-deutschland.de.")] };
  }
  if (a.german === "A2") {
    if (helper) reasons.push(t("Mit A2 sind vor allem Helferstellen realistisch. Dafür finden wir Stellen, aber weniger als mit B1.", "With A2, mainly helper jobs are realistic. We can find those, but fewer than with B1."));
    else return { level: "red", reasons: [t("Für Fachstellen verlangen Arbeitgeber fast immer mindestens B1. Mit A2 raten wir ab. Wenn du B1 erreicht hast, lohnt sich die Buchung deutlich mehr.", "For skilled jobs employers almost always require at least B1. With A2 we advise against booking. Once you reach B1, booking is much more worthwhile.")] };
  }
  if (health && !atLeast(a.german, "B2")) reasons.push(t("In Pflege und Gesundheit wird meist B2 verlangt. Mit B1 gibt es weniger realistische Stellen.", "In care and health, B2 is usually required. With B1 there are fewer suitable jobs."));
  if (regulated && a.recognition === "pending") reasons.push(t("Anerkennung läuft: Viele Arbeitgeber warten auf den Bescheid. Gib das in der Bewerbung an.", "Recognition pending: many employers wait for the decision. Mention it in your application."));
  if (a.degree === "none" && !helper) reasons.push(t("Ohne Abschluss sind vor allem Helferstellen realistisch.", "Without a qualification, mainly helper jobs are realistic."));

  if (reasons.length) return { level: "yellow", reasons };
  return { level: "green", reasons: [t("Für dieses Profil finden wir in der Regel 25 Stellen. Eine Zusage bleibt trotzdem offen.", "For this profile we usually find 25 jobs. An offer is still not guaranteed.")] };
}
