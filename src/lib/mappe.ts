import "server-only";

// Bewerbungsmappe laden/anlegen (Kund:in über Session, Bearbeiter über bookingId) + Foto-Ablage
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { ensureCandidateDir, detectKind, MAX_BYTES, parseDocs } from "@/lib/uploads";
import { prefillFromCandidate, parseProfile } from "@/lib/application";
import { BOOKING_STATUS } from "@/lib/services";

const ACTIVE = [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.DONE];

export async function withProfile(bookingId: string) {
  const booking = await prisma.serviceBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { profile: true, candidate: { include: { user: true } } } });
  if (booking.profile) return { booking, profile: booking.profile };
  const data = prefillFromCandidate(booking.candidate, booking);
  // Lebenslauf, der schon im WoYou-Profil liegt, direkt anbieten
  const existingCv = parseDocs(booking.candidate.documents).find((d) => d.kind === "cv");
  const profile = await prisma.applicationProfile.create({ data: { bookingId, data: JSON.stringify(data), ownCvFile: existingCv?.filename ?? null } });
  return { booking, profile };
}

// Für die eingeloggte Kund:in: aktuelle Buchung + Mappe (oder null, wenn nichts gebucht)
export async function mappeForSession() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return null;
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!candidate) return null;
  const b = await prisma.serviceBooking.findFirst({ where: { candidateId: candidate.id, status: { in: ACTIVE } }, orderBy: { createdAt: "desc" } });
  if (!b) return null;
  const r = await withProfile(b.id);
  return { ...r, data: parseProfile(r.profile.data) };
}

// Zugriff für Kund:in (eigene Buchung) oder Admin (beliebige Buchung)
export async function mappeForRequest(bookingId?: string | null) {
  const session = await getSession();
  if (bookingId && session.userId && isAdmin(session.role)) {
    const r = await withProfile(bookingId);
    return { ...r, data: parseProfile(r.profile.data), dataEn: r.profile.dataEn ? parseProfile(r.profile.dataEn) : null, admin: true };
  }
  const own = await mappeForSession();
  return own ? { ...own, dataEn: null, admin: false } : null;
}

export async function savePhoto(candidateId: string, file: File) {
  if (file.size > MAX_BYTES) throw new Error("Das Foto ist zu groß (max. 5 MB).");
  const k = detectKind(file);
  if (!k.ok || k.ext === "pdf") throw new Error("Bitte ein Foto als JPG oder PNG hochladen.");
  const dir = await ensureCandidateDir(candidateId);
  const name = `bewerbungsfoto-${crypto.randomBytes(6).toString("hex")}.${k.ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function readPhoto(candidateId: string, file: string | null) {
  if (!file || !/^bewerbungsfoto-[a-f0-9]+\.(jpg|png)$/.test(file)) return null;
  const dir = await ensureCandidateDir(candidateId);
  return fs.readFile(path.join(dir, file)).catch(() => null);
}

// Eigener Lebenslauf (PDF): neu hochgeladen oder aus den Profil-Dokumenten
export async function saveOwnCv(candidateId: string, file: File) {
  if (file.size > MAX_BYTES) throw new Error("Die Datei ist zu groß (max. 5 MB).");
  const k = detectKind(file);
  if (!k.ok || k.ext !== "pdf") throw new Error("Bitte den Lebenslauf als PDF hochladen.");
  const dir = await ensureCandidateDir(candidateId);
  const name = `lebenslauf-eigen-${crypto.randomBytes(6).toString("hex")}.pdf`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function readOwnCv(candidate: { id: string; documents: string | null }, file: string | null) {
  if (!file) return null;
  const allowed = /^lebenslauf-eigen-[a-f0-9]+\.pdf$/.test(file) || parseDocs(candidate.documents).some((d) => d.kind === "cv" && d.filename === file && d.mime === "application/pdf");
  if (!allowed) return null;
  const dir = await ensureCandidateDir(candidate.id);
  return fs.readFile(path.join(dir, file)).catch(() => null);
}
