import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { runMarketing } from "@/lib/marketing";
import { audit } from "@/lib/audit";

// Marketingstrecke von Hand auslösen (sonst täglich per Zeitplan)
export async function POST(req: Request) {
  const deny = await requireAdmin(); if (deny) return deny;
  const r = await runMarketing();
  await audit(req, "BOOKING_UPDATE", {}, { action: "marketing_run", ...r });
  return NextResponse.json(r);
}
