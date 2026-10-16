import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { monthlyReport } from "@/lib/report";

// CSV-Export des Monatsreports (Semikolon, Excel-tauglich)
export async function GET() {
  const deny = await requireAdmin(); if (deny) return deny;
  const rows = await monthlyReport(12);
  const eur = (c: number) => (c / 100).toFixed(2).replace(".", ",");
  const head = ["Monat", "Registrierungen", "Profil-Freischaltungen", "Umsatz Freischaltung (€)", "Buchungen Bewerbungs-Service", "davon bezahlt", "Umsatz Bewerbungs-Service (€)", "Mappen eingereicht", "Bewerbungen verschickt", "Antworten", "Buchungsquote (%)"];
  const lines = [head, ...rows.map((r) => [r.month, r.registrations, r.profileUnlocks, eur(r.unlockRevenueCents), r.bookings, r.bookingsPaid, eur(r.serviceRevenueCents), r.mappenSubmitted, r.applicationsSent, r.replies, r.conversionPct ?? ""])];
  const csv = "﻿" + lines.map((l) => l.join(";")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="woyou-monatsreport-${new Date().toISOString().slice(0, 7)}.csv"` } });
}
