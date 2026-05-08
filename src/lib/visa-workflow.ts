import "server-only";

// Triggered after a candidate has been hired (status = PLACED).
// Creates a checklist of tasks for the vermittler / back-office team.
// Idempotent: skips creation if a task with the same kind already exists for
// the candidate within the last 30 days.

import { prisma } from "@/lib/prisma";

type TaskTemplate = {
  kind: "VISA" | "DOCUMENT_CHECK" | "VERIFICATION" | "CONTACT" | "OTHER";
  title: string;
  description: string;
  daysFromNow: number;
};

const PLACEMENT_CHECKLIST: TaskTemplate[] = [
  {
    kind: "DOCUMENT_CHECK",
    title: "Dokumente vollständig prüfen",
    description:
      "Pass, Lebenslauf, Zeugnisse / Diplome, Sprachnachweise — alle Pflichtdokumente verifizieren und ggf. nachfordern.",
    daysFromNow: 3,
  },
  {
    kind: "VERIFICATION",
    title: "Anerkennung des Berufsabschlusses einleiten",
    description:
      "Antrag bei der zuständigen Stelle (z.B. ZAB / IHK / Pflegekammer) vorbereiten und einreichen.",
    daysFromNow: 7,
  },
  {
    kind: "VISA",
    title: "Visumsantrag vorbereiten",
    description:
      "Arbeitsvertrag, Anerkennung, Krankenversicherung, Lebenslauf, Foto, Pass — Bündelung für Botschaftstermin.",
    daysFromNow: 14,
  },
  {
    kind: "CONTACT",
    title: "Botschafts- / Konsulatstermin koordinieren",
    description:
      "Termin in Marokko (Rabat oder Casablanca) buchen und Kandidat beim Vorbereiten unterstützen.",
    daysFromNow: 21,
  },
  {
    kind: "OTHER",
    title: "Wohnungssuche organisieren",
    description:
      "Mit Unternehmen abstimmen ob Werkswohnung verfügbar, sonst Suche initiieren.",
    daysFromNow: 28,
  },
  {
    kind: "OTHER",
    title: "Krankenversicherung & Sozialversicherung",
    description:
      "Anmeldung bei Krankenkasse und Sozialversicherung vor Einreise klären.",
    daysFromNow: 30,
  },
  {
    kind: "CONTACT",
    title: "Begrüßungs-Briefing senden",
    description:
      "Ankunft-Checkliste (Wetter, Anreise, erste Tage, Ansprechpartner) per E-Mail / Telegram an den Kandidaten.",
    daysFromNow: 35,
  },
];

export async function createPlacementChecklist(
  candidateId: string,
  companyId: string,
  matchId?: string | null
): Promise<{ created: number }> {
  // Skip if a fresh visa task already exists (idempotency for re-triggers).
  const recent = await prisma.adminTask.findFirst({
    where: {
      candidateId,
      kind: "VISA",
      createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) return { created: 0 };

  let count = 0;
  const now = Date.now();
  for (const tpl of PLACEMENT_CHECKLIST) {
    await prisma.adminTask.create({
      data: {
        candidateId,
        companyId,
        matchId: matchId ?? undefined,
        kind: tpl.kind,
        title: tpl.title,
        description: tpl.description,
        dueDate: new Date(now + tpl.daysFromNow * 24 * 60 * 60 * 1000),
      },
    });
    count++;
  }
  return { created: count };
}
