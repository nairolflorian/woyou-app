// Local-disk upload helpers. Files live in /app/uploads (Docker volume).
// We deliberately do NOT serve them from /public; the API route below
// streams them after a permission check.

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.env.UPLOAD_DIR ?? "/app/uploads";

// Whitelist by extension + mime to avoid ambiguity.
const ALLOWED = {
  pdf: { mime: "application/pdf", ext: "pdf" },
  jpg: { mime: "image/jpeg", ext: "jpg" },
  jpeg: { mime: "image/jpeg", ext: "jpg" },
  png: { mime: "image/png", ext: "png" },
} as const;
type Allowed = keyof typeof ALLOWED;

export const MAX_BYTES = 5 * 1024 * 1024;

export const DOC_KINDS = [
  "avatar",
  "cv",
  "passport",
  "diploma",
  "certificate",
  "other",
] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export const DOC_KIND_LABEL: Record<DocKind, { de: string; en: string }> = {
  avatar: { de: "Profilbild", en: "Avatar" },
  cv: { de: "Lebenslauf", en: "CV" },
  passport: { de: "Reisepass", en: "Passport" },
  diploma: { de: "Diplom / Abschluss", en: "Diploma" },
  certificate: { de: "Zertifikat", en: "Certificate" },
  other: { de: "Sonstiges", en: "Other" },
};

export type StoredDocument = {
  id: string;
  kind: DocKind;
  filename: string;       // safe stored name on disk
  originalName: string;
  size: number;
  mime: string;
  uploadedAt: string;
};

export function detectKind(file: File): { ok: false; error: string } | { ok: true; ext: string; mime: string } {
  const lower = file.name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return { ok: false, error: "Datei ohne Endung." };
  const rawExt = lower.slice(dot + 1);
  const entry = (ALLOWED as Record<string, { mime: string; ext: string }>)[rawExt];
  if (!entry) return { ok: false, error: `Dateityp .${rawExt} nicht erlaubt (PDF/JPG/PNG).` };
  // Loose mime check; some browsers send wrong mime, so we only flag clear mismatches.
  if (file.type && file.type !== entry.mime && !file.type.startsWith("application/octet-stream")) {
    return { ok: false, error: `Datei-MIME (${file.type}) passt nicht zur Endung.` };
  }
  return { ok: true, ext: entry.ext, mime: entry.mime };
}

export async function ensureCandidateDir(candidateId: string): Promise<string> {
  const dir = path.join(ROOT, "candidates", candidateId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function ensureChatDir(conversationId: string): Promise<string> {
  const dir = path.join(ROOT, "chats", conversationId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeChatAttachment(
  conversationId: string,
  file: File
): Promise<{ filename: string; mime: string; size: number; originalName: string }> {
  const det = detectKind(file);
  if (!det.ok) throw new Error(det.error);
  if (file.size > MAX_BYTES) {
    throw new Error(`Datei zu groß (max. ${Math.round(MAX_BYTES / 1024 / 1024)} MB).`);
  }
  const dir = await ensureChatDir(conversationId);
  const id = crypto.randomBytes(8).toString("hex");
  const safeName = `${id}.${det.ext}`;
  const target = path.join(dir, safeName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(target, buf, { mode: 0o600 });
  return { filename: safeName, mime: det.mime, size: file.size, originalName: file.name };
}

export async function readChatAttachment(
  conversationId: string,
  filename: string
): Promise<{ data: Buffer; mime: string } | null> {
  if (filename.includes("/") || filename.includes("..")) return null;
  const target = path.join(ROOT, "chats", conversationId, filename);
  try {
    const data = await fs.readFile(target);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mime =
      (ALLOWED as Record<string, { mime: string }>)[ext]?.mime ??
      "application/octet-stream";
    return { data, mime };
  } catch {
    return null;
  }
}

export async function writeUpload(
  candidateId: string,
  file: File,
  kind: DocKind
): Promise<StoredDocument> {
  const det = detectKind(file);
  if (!det.ok) throw new Error(det.error);
  if (file.size > MAX_BYTES) {
    throw new Error(`Datei zu groß (max. ${Math.round(MAX_BYTES / 1024 / 1024)} MB).`);
  }

  const dir = await ensureCandidateDir(candidateId);
  const id = crypto.randomBytes(8).toString("hex");
  const safeName = `${id}.${det.ext}`;
  const target = path.join(dir, safeName);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(target, buf, { mode: 0o600 });

  return {
    id,
    kind,
    filename: safeName,
    originalName: file.name,
    size: file.size,
    mime: det.mime,
    uploadedAt: new Date().toISOString(),
  };
}

export async function readUpload(
  candidateId: string,
  filename: string
): Promise<{ data: Buffer; mime: string } | null> {
  // Defense-in-depth: never follow ../
  if (filename.includes("/") || filename.includes("..")) return null;
  const target = path.join(ROOT, "candidates", candidateId, filename);
  try {
    const data = await fs.readFile(target);
    const ext = path.extname(filename).slice(1).toLowerCase() as Allowed;
    const mime = (ALLOWED as Record<string, { mime: string }>)[ext]?.mime ?? "application/octet-stream";
    return { data, mime };
  } catch {
    return null;
  }
}

export async function deleteUpload(
  candidateId: string,
  filename: string
): Promise<boolean> {
  if (filename.includes("/") || filename.includes("..")) return false;
  const target = path.join(ROOT, "candidates", candidateId, filename);
  try {
    await fs.unlink(target);
    return true;
  } catch {
    return false;
  }
}

export function parseDocs(json: string | null | undefined): StoredDocument[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Returns the first stored avatar (we keep only one per candidate by
// convention — the upload route replaces an existing one).
export function findAvatar(docs: StoredDocument[]): StoredDocument | null {
  return docs.find((d) => d.kind === "avatar") ?? null;
}
