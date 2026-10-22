import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { monthlyReport } from "@/lib/report";

// CSV-Export des Monatsreports (Semikolon, Excel-tauglich)
export async function GET() {
  const deny = await requireAdmin(); if (deny) return deny;
  const rows = await monthlyReport(12);
  const eur = (c: number) => (c / 100).toFixed(2).replace(".", ",");
  const head = ["Monat", "Registrierungen", "Buchungen Startpaket", "davon bezahlt", "Umsatz Startpaket (€)", "Mappen eingereicht", "Verlängerungen/Abos bezahlt", "Umsatz Verlängerung/Abo (€)", "Buchungsquote (%)"];
  const lines = [head, ...rows.map((r) => [r.month, r.registrations, r.bookings, r.bookingsPaid, eur(r.serviceRevenueCents), r.mappenSubmitted, r.toolPurchases, eur(r.toolRevenueCents), r.conversionPct ?? ""])];
  const csv = "﻿" + lines.map((l) => l.join(";")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="woyou-monatsreport-${new Date().toISOString().slice(0, 7)}.csv"` } });
}
