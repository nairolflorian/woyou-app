import { NextResponse } from "next/server";

// Früher: Monatsabo kündigen. Seit 23.10.2026 gibt es kein Abo mehr (es wurde nie eines abgeschlossen;
// Stand Server 23.10.: keine Werkzeug-Käufe in der Datenbank). Die Route antwortet nur noch mit 410.
// Sollte doch ein Altabo auftauchen: in Stripe kündigen, der Webhook (customer.subscription.deleted) beendet es hier.
export function POST() {
  return NextResponse.json({ error: "Es gibt kein Abo mehr, das gekündigt werden müsste." }, { status: 410 });
}
