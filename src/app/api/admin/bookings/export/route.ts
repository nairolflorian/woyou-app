import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { toolAccess } from "@/lib/werkzeug";

// Kund:innen und Buchungen als CSV (Semikolon, Excel-tauglich) – Grundlage für den späteren CRM-Import
export async function GET() {
  const deny = await requireAdmin(); if (deny) return deny;
  const bookings = await prisma.serviceBooking.findMany({ orderBy: { createdAt: "desc" }, include: { candidate: { include: { user: true } } } });
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");
  const rows = [["Vorname", "Nachname", "E-Mail", "Telefon", "Sprache", "Herkunft", "Registriert", "Gebucht", "Bezahlt", "Status", "Betrag (€)", "Wunschberufe", "Regionen", "Paket", "Werkzeug bis", "Abo"]];
  for (const b of bookings) {
    const u = b.candidate.user, ta = await toolAccess(b.candidateId);
    rows.push([b.candidate.firstName, b.candidate.lastName, u.email, b.contactPhone ?? u.phone, u.locale, u.signupSource, d(u.createdAt), d(b.createdAt), d(b.paidAt), b.status, (b.amountCents / 100).toFixed(2).replace(".", ","), b.targetJobs, b.targetRegions, b.packageKey, d(ta.until), ta.subscription ? (ta.subscription.status === "CANCELLING" ? "gekündigt" : "aktiv") : ""].map(q) as string[]);
  }
  const csv = "﻿" + rows.map((r) => r.join(";")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="woyou-kunden-buchungen-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
