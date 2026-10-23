import { NextResponse } from "next/server";

// Früher: Werkzeug verlängern (ein Monat) oder Monatsabo starten (Stripe-Checkout).
// Seit 23.10.2026 gibt es nur noch das Startpaket (inkl. 3 Monate Werkzeug), keine Verlängerung und kein Abo.
// Die Route bleibt als 410, damit alte Aufrufe eine klare Antwort bekommen und nie ein Checkout startet.
export function POST() {
  return NextResponse.json({ error: "Verlängerung und Abo gibt es nicht mehr. Das Startpaket enthält 3 Monate Werkzeug." }, { status: 410 });
}
export const GET = POST;
