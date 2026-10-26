// Schalter „Selbstcheck vor der Buchung“: Server-Teil. Wird zur Laufzeit gelesen (wie TERMINLAND_URL in termin.ts),
// Staging über docker-compose.yml, Produktion über .env.prod (env_file). Standard: aus.
// Regeln in src/lib/selbstcheck-vorbuchung.ts.
import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SELBSTCHECK_COOKIE, gemerktJson, neuester, parseGemerkt, schalterAn, selfcheckModeAus, type GemerkterCheck } from "@/lib/selbstcheck-vorbuchung";

export const selbstcheckVorBuchungAn = () => schalterAn(process.env.SELBSTCHECK_VOR_BUCHUNG);
export const selfcheckMode = () => selfcheckModeAus(process.env.SELFCHECK_MODE);

/** Neuester gemerkter Check: aus dem Konto oder (noch nicht übernommen) aus dem Cookie */
export async function gemerkterCheck(candidateSelbstcheck: string | null | undefined): Promise<GemerkterCheck | null> {
  const c = await cookies();
  return neuester(parseGemerkt(candidateSelbstcheck), parseGemerkt(c.get(SELBSTCHECK_COOKIE)?.value));
}

/** Nach Registrierung oder Anmeldung: Ergebnis aus dem Cookie ins Konto übernehmen und Cookie löschen. Fehler stören die Anmeldung nie. */
export async function selbstcheckUebernehmen(userId: string): Promise<void> {
  try {
    const c = await cookies();
    const raw = c.get(SELBSTCHECK_COOKIE)?.value;
    if (!raw) return;
    const ausCookie = selbstcheckVorBuchungAn() ? parseGemerkt(raw) : null;
    if (!ausCookie) { c.delete(SELBSTCHECK_COOKIE); return; }
    const cand = await prisma.candidate.findUnique({ where: { userId }, select: { id: true, selbstcheck: true } });
    if (!cand) return; // noch kein Profil: Cookie bleibt, die Bestellseite liest es mit
    c.delete(SELBSTCHECK_COOKIE);
    // nur wenn das Cookie neuer ist als das, was schon im Konto steht
    if (neuester(parseGemerkt(cand.selbstcheck), ausCookie) === ausCookie) await prisma.candidate.update({ where: { id: cand.id }, data: { selbstcheck: gemerktJson(ausCookie) } });
  } catch { /* optional */ }
}
