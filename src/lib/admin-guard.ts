import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, isStaff } from "@/lib/auth";

// Gibt eine 401-Antwort zurück, wenn kein Admin angemeldet ist – sonst null
export async function requireAdmin() {
  const s = await getSession();
  return s.userId && isAdmin(s.role) ? null : NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

// Admin oder Bewerbungsteam
export async function requireStaff() {
  const s = await getSession();
  return s.userId && isStaff(s.role) ? null : NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}
