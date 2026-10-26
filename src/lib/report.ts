import "server-only";

// Monatsreport Woyou (Weg 1): Registrierungen, Startpakete, Mappen. Verlängerung/Abo gibt es nicht mehr (23.10.2026).
// Bewerbungen und Antworten zählen wir nicht mehr: die verschicken Kund:innen selbst.
// Seit 26.10.2026 zusätzlich Selbstchecks (anonym, Tabelle SelfCheckResult), Stornos und freigegebene Mappen,
// plus pilotReport() für den Pilot Westbalkan (Kennzahlen aus dem Konzept v4, Regeln in src/lib/pilot-core.ts).
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { SERVICES } from "@/lib/services";
import {
  PILOT, ampelZahlen, nachSchluessel, istStorno, stornoQuote, mappenBis, unterlagenStichtag, landCode, hochrechnung, pct1,
  type AmpelZahlen, type PilotBuchung,
} from "@/lib/pilot-core";

export type MonthRow = {
  month: string; registrations: number;
  bookings: number; bookingsPaid: number; serviceRevenueCents: number; mappenSubmitted: number;
  conversionPct: number | null;
  selfChecks: number; selfGreen: number; selfYellow: number; selfRed: number; selfGreenPct: number | null;
  stornos: number; mappenApproved: number;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function monthlyReport(months = 6): Promise<MonthRow[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const [users, bookings, profiles, checks, cancelled] = await Promise.all([
    prisma.user.findMany({ where: { role: ROLE.CANDIDATE, createdAt: { gte: start }, deletedAt: null }, select: { createdAt: true } }),
    prisma.serviceBooking.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, paidAt: true, amountCents: true } }),
    prisma.applicationProfile.findMany({ where: { OR: [{ submittedAt: { gte: start } }, { approvedAt: { gte: start } }] }, select: { submittedAt: true, approvedAt: true } }),
    prisma.selfCheckResult.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, level: true } }),
    // Storno = bezahlt und danach storniert; Monat = letzte Änderung (in der Regel die Stornierung)
    prisma.serviceBooking.findMany({ where: { status: "CANCELLED", paidAt: { not: null }, updatedAt: { gte: start } }, select: { status: true, paidAt: true, updatedAt: true } }),
  ]);
  const rows: MonthRow[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const k = monthKey(d);
    const inM = (x: Date | null | undefined) => !!x && monthKey(x) === k;
    const reg = users.filter((u) => inM(u.createdAt)).length;
    const bk = bookings.filter((b) => inM(b.createdAt));
    const paid = bookings.filter((b) => inM(b.paidAt));
    const sc = ampelZahlen(checks.filter((c) => inM(c.createdAt)));
    rows.push({
      month: k,
      registrations: reg,
      bookings: bk.length,
      bookingsPaid: paid.length,
      serviceRevenueCents: paid.reduce((s, b) => s + b.amountCents, 0),
      mappenSubmitted: profiles.filter((p) => inM(p.submittedAt)).length,
      conversionPct: reg ? Math.round((bk.length / reg) * 1000) / 10 : null,
      selfChecks: sc.total, selfGreen: sc.green, selfYellow: sc.yellow, selfRed: sc.red, selfGreenPct: sc.greenPct,
      stornos: cancelled.filter((b) => istStorno(b) && inM(b.updatedAt)).length,
      mappenApproved: profiles.filter((p) => inM(p.approvedAt)).length,
    });
  }
  return rows.reverse();
}

export const SERVICE_PRICE = SERVICES.startpaket.priceCents;

export type PilotReport = {
  start: Date; bezahltAb: Date; ende: Date; stichtag: Date; laeuft: boolean;
  selbstchecks: AmpelZahlen; selbstchecksHochrechnung: number | null;
  nachLand: ({ key: string } & AmpelZahlen)[];
  nachGruppe: ({ key: string } & AmpelZahlen)[];
  balkanAnteilPct: number | null;
  buchungenBezahlt: number; buchungenHochrechnung: number | null;
  bezahltNachLand: { key: string; bezahlt: number; storniert: number }[];
  storno: { bezahlt: number; storniert: number; pct: number | null };
  mappen: { basis: number; fertig: number; pct: number | null };
};

// Land aus der Mappe (Weg 1: Staatsangehörigkeit und Land stehen dort, das Kandidatenprofil ist oft leer)
function mappeLand(data: string | null | undefined): { nationality?: string; country?: string } {
  try { const d = data ? JSON.parse(data) : null; return { nationality: typeof d?.nationality === "string" ? d.nationality : undefined, country: typeof d?.country === "string" ? d.country : undefined }; } catch { return {}; }
}

// Pilot Westbalkan: alles ab PILOT.start bis PILOT.ende (bzw. bis heute, solange der Pilot läuft)
export async function pilotReport(now = new Date()): Promise<PilotReport> {
  const bis = now < PILOT.ende ? now : PILOT.ende;
  const [checks, bookings] = await Promise.all([
    prisma.selfCheckResult.findMany({ where: { createdAt: { gte: PILOT.start, lte: PILOT.ende } }, select: { country: true, balkan: true, gruppe: true, level: true } }),
    // Land der Kund:in: Staatsangehörigkeit, sonst Land der Adresse (Freitext in Mappe bzw. Profil, erkannt über die Länderliste des Selbstchecks)
    prisma.serviceBooking.findMany({
      where: { createdAt: { gte: PILOT.start, lte: PILOT.ende } },
      select: { status: true, createdAt: true, paidAt: true, profile: { select: { approvedAt: true, data: true } }, candidate: { select: { nationality: true, countryOfResidence: true } } },
    }),
  ]);
  const pb: (PilotBuchung & { land: string })[] = bookings.map((b) => ({
    status: b.status, createdAt: b.createdAt, paidAt: b.paidAt, approvedAt: b.profile?.approvedAt ?? null,
    land: (() => { const m = mappeLand(b.profile?.data); return landCode(m.nationality, b.candidate.nationality, m.country, b.candidate.countryOfResidence); })(),
  }));
  const bezahlt = pb.filter((b) => b.paidAt && b.paidAt <= PILOT.ende);
  const laender = new Map<string, { bezahlt: number; storniert: number }>();
  for (const b of bezahlt) {
    const x = laender.get(b.land) ?? { bezahlt: 0, storniert: 0 };
    x.bezahlt++; if (istStorno(b)) x.storniert++;
    laender.set(b.land, x);
  }
  const sc = ampelZahlen(checks);
  const balkan = checks.filter((c) => c.balkan);
  // Buchungen im Ziel = bezahlt und nicht storniert
  const netto = bezahlt.filter((b) => !istStorno(b)).length;
  return {
    start: PILOT.start, bezahltAb: PILOT.bezahltAb, ende: PILOT.ende, stichtag: unterlagenStichtag(), laeuft: now >= PILOT.start && now < PILOT.ende,
    selbstchecks: sc, selbstchecksHochrechnung: hochrechnung(sc.total, bis),
    nachLand: nachSchluessel(checks, (c) => c.country),
    nachGruppe: nachSchluessel(balkan, (c) => c.gruppe ?? "ohne"),
    balkanAnteilPct: pct1(balkan.length, checks.length),
    buchungenBezahlt: netto, buchungenHochrechnung: hochrechnung(netto, bis, PILOT.bezahltAb),
    bezahltNachLand: [...laender.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.bezahlt - a.bezahlt),
    storno: stornoQuote(bezahlt),
    mappen: mappenBis(pb),
  };
}
