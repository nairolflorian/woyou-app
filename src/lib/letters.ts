import "server-only";

// Anschreiben: sachliche Vorlage (funktioniert immer) und optional KI-Formulierung.
// KI ist nur aktiv mit AI_PROVIDER (mistral | anthropic) + AI_API_KEY in .env (Anbieter mit AV-Vertrag,
// kein Gratis-Tarif, da Lebenslaufdaten verarbeitet werden). Ohne Schlüssel: Vorlage.
import type { ProfileData } from "@/lib/application";

export type JobInfo = { title: string; company: string; city?: string | null; ref?: string | null; contactName?: string | null; description?: string | null };

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const firstSentences = (s: string, n: number) => (s.match(/[^.!?]+[.!?]+/g) || [s]).slice(0, n).map(clean).join(" ").trim();
const lines = (s: string) => s.split(/\n|;|•/).map(clean).filter(Boolean);

export function salutation(contactName?: string | null) {
  const n = clean(contactName || "");
  if (/^(frau)\s+/i.test(n)) return `Sehr geehrte ${n.replace(/^frau/i, "Frau")},`;
  if (/^(herr)\s+/i.test(n)) return `Sehr geehrter ${n.replace(/^herr/i, "Herr")},`;
  return "Sehr geehrte Damen und Herren,";
}

export function subjectLine(job: JobInfo) {
  return `Bewerbung als ${clean(job.title)}${job.ref ? `, Referenznummer ${job.ref}` : ""}`;
}

// Sachliche Vorlage ohne Floskeln – nur Fakten aus der Mappe
export function templateLetter(d: ProfileData, job: JobInfo): string {
  const name = `${d.firstName} ${d.lastName}`.trim();
  const p: string[] = [];
  p.push(`hiermit bewerbe ich mich bei ${clean(job.company)} als ${clean(job.title)}${job.city ? ` in ${clean(job.city)}` : ""}.`);

  const exp = d.experience.filter((x) => x.title);
  const edu = d.education.filter((x) => x.title);
  if (exp.length) {
    const last = exp[0];
    const tasks = lines(last.details).slice(0, 3);
    const where = `${last.place ? ` bei ${clean(last.place)}` : ""}${last.city ? ` in ${clean(last.city)}` : ""}`;
    let s = /heute|aktuell|jetzt|today|now/i.test(last.to) || !last.to
      ? `Zurzeit arbeite ich als ${clean(last.title)}${where}.`
      : `Zuletzt habe ich als ${clean(last.title)}${where} gearbeitet.`;
    if (tasks.length) s += ` Zu meinen Aufgaben gehören ${tasks.length > 1 ? tasks.slice(0, -1).join(", ") + " und " + tasks.at(-1) : tasks[0]}.`;
    if (exp.length > 1) s += ` Davor war ich als ${clean(exp[1].title)}${exp[1].place ? ` bei ${clean(exp[1].place)}` : ""} tätig.`;
    p.push(s);
  }
  if (edu.length) p.push(`Meine Ausbildung: ${[clean(edu[0].title), clean(edu[0].place), clean(edu[0].to)].filter(Boolean).join(", ")}.`);

  const de = d.languages.find((l) => /deutsch|german|allemand/i.test(l.name) && l.level);
  const other = d.languages.filter((l) => l !== de && l.name && l.level).map((l) => `${l.name} (${l.level})`);
  if (de || other.length) p.push(`${de ? `Meine Deutschkenntnisse liegen auf Niveau ${de.level}.` : ""}${other.length ? ` Außerdem spreche ich ${other.length > 1 ? other.slice(0, -1).join(", ") + " und " + other.at(-1) : other[0]}.` : ""}`.trim());

  if (d.motivation) p.push(firstSentences(d.motivation, 3));
  p.push(`Ich kann ${d.availableFrom && !/sofort/i.test(d.availableFrom) ? `ab ${clean(d.availableFrom)}` : "kurzfristig"} bei Ihnen anfangen. Über eine Einladung zu einem Gespräch, gern auch per Video, freue ich mich.`);

  return [salutation(job.contactName), "", ...p.flatMap((x) => [x, ""]), "Mit freundlichen Grüßen", name].join("\n");
}

// Grund-Anschreiben für die Mappe (ohne konkrete Stelle)
export function baseLetter(d: ProfileData) {
  return templateLetter(d, { title: d.targetJob || "[Stelle]", company: "[Firma]" });
}

const STYLE_RULES = `Schreibe ein deutsches Bewerbungsanschreiben (Sie-Form gegenüber der Firma, Ich-Form der Bewerberin bzw. des Bewerbers).
Regeln:
- Höchstens 220 Wörter, 4 bis 5 kurze Absätze, sachlich und freundlich.
- Nur Fakten aus den Angaben verwenden. Nichts erfinden: keine Jahreszahlen, Zertifikate, Erfahrungen oder Eigenschaften, die nicht genannt sind.
- Konkreter Bezug auf die Stelle und die Firma (aus Titel und Beschreibung), ohne die Ausschreibung nachzuerzählen.
- Verboten: "mit großem Interesse", "hochmotiviert", "Teamplayer", "dynamisches Umfeld", "leidenschaftlich", "hiermit möchte ich", "Herausforderung", Superlative, Gedankenstriche, Emojis, Aufzählungszeichen.
- Kein Betreff, keine Adresse, kein Datum. Beginne mit der Anrede, ende mit "Mit freundlichen Grüßen" und dem Namen.
- Einfaches, korrektes Deutsch, kurze Sätze.`;

export const aiEnabled = () => !!(process.env.AI_PROVIDER && process.env.AI_API_KEY);

async function callAI(prompt: string): Promise<string | null> {
  const provider = process.env.AI_PROVIDER, key = process.env.AI_API_KEY;
  if (!provider || !key) return null;
  const ctrl = AbortSignal.timeout(30000);
  try {
    if (provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: ctrl,
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: process.env.AI_MODEL || "claude-haiku-4-5", max_tokens: 900, system: STYLE_RULES, messages: [{ role: "user", content: prompt }] }),
      });
      const j = await r.json();
      return r.ok ? (j.content?.[0]?.text ?? null) : null;
    }
    if (provider === "mistral") {
      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST", signal: ctrl,
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: process.env.AI_MODEL || "mistral-small-latest", temperature: 0.4, messages: [{ role: "system", content: STYLE_RULES }, { role: "user", content: prompt }] }),
      });
      const j = await r.json();
      return r.ok ? (j.choices?.[0]?.message?.content ?? null) : null;
    }
  } catch (e) {
    console.error("[ai] Fehler:", e instanceof Error ? e.message : e);
  }
  return null;
}

// Anschreiben für eine Stelle: KI (wenn aktiv) mit Plausibilitätsprüfung, sonst Vorlage
export async function letterForJob(d: ProfileData, job: JobInfo): Promise<{ text: string; source: "ai" | "template" }> {
  if (aiEnabled()) {
    const facts = {
      name: `${d.firstName} ${d.lastName}`.trim(), wunschberuf: d.targetJob, kurzprofil: d.summary, motivation: d.motivation, staerken: d.strengths,
      erfahrung: d.experience.filter((x) => x.title), ausbildung: d.education.filter((x) => x.title), sprachen: d.languages.filter((x) => x.name), kenntnisse: lines(d.skills),
      verfuegbar_ab: d.availableFrom, fuehrerschein: d.drivingLicense,
    };
    const prompt = `Anrede: ${salutation(job.contactName)}\nStelle: ${job.title}\nFirma: ${job.company}${job.city ? `\nOrt: ${job.city}` : ""}\nAuszug aus der Ausschreibung:\n${(job.description || "").slice(0, 2500)}\n\nAngaben der Bewerberin/des Bewerbers (JSON):\n${JSON.stringify(facts)}`;
    const out = await callAI(prompt);
    if (out && out.length > 300 && out.length < 3000 && /Mit freundlichen Grüßen/.test(out) && !/—|–/.test(out)) return { text: out.trim(), source: "ai" };
  }
  return { text: templateLetter(d, job), source: "template" };
}
