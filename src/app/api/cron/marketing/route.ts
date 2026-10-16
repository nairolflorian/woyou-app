import { NextResponse } from "next/server";
import { runMarketing } from "@/lib/marketing";

// Täglicher Lauf der Marketingstrecke (Bearer CRON_SECRET), siehe deploy/cron-einrichten.sh
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json(await runMarketing());
}
