import "server-only";

// Mailversand über SMTP (z. B. Hetzner, IONOS, Microsoft 365). Ohne SMTP_HOST wird nichts
// verschickt, aber jede Mail im EmailLog festgehalten – so ist alles vorbereitet und testbar.
//
// .env:  SMTP_HOST, SMTP_PORT (587), SMTP_SECURE ("true" bei Port 465), SMTP_USER, SMTP_PASS,
//        MAIL_FROM ("WoYou <service@woyou.de>"), MAIL_TEAM (Empfänger für interne Hinweise)

import nodemailer, { type Transporter } from "nodemailer";
import { prisma } from "@/lib/prisma";

let transport: Transporter | null | undefined;
function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;
  const host = process.env.SMTP_HOST;
  if (!host) return (transport = null);
  transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

export const mailEnabled = () => !!process.env.SMTP_HOST;
export const teamAddress = () => process.env.MAIL_TEAM || "";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Einfaches, markenkonformes HTML-Layout (Petrol #6F9EAB)
export function layout(title: string, paragraphs: string[], button?: { label: string; href: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.5">${esc(p)}</p>`).join("");
  const btn = button ? `<p style="margin:22px 0"><a href="${esc(button.href)}" style="background:#6F9EAB;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;display:inline-block">${esc(button.label)}</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f7f8;font-family:Segoe UI,Arial,sans-serif;color:#1f2a30">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px">
    <div style="font-size:22px;font-weight:700;color:#6F9EAB;margin-bottom:18px">Wo<span style="color:#1f2a30">You</span></div>
    <div style="background:#fff;border-radius:12px;padding:26px 24px">
      <h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>${body}${btn}
    </div>
    <p style="font-size:12px;color:#7a8a91;margin-top:16px">WoYou · Deine Zukunft in Deutschland</p>
  </div></body></html>`;
}

export type Attachment = { filename: string; content: Buffer; contentType?: string };

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; template: string; bookingId?: string; from?: string; replyTo?: string; bcc?: string; attachments?: Attachment[] }) {
  const t = getTransport();
  if (!opts.to) return { status: "SKIPPED" as const };
  if (!t) {
    console.log(`[mail] (kein SMTP) ${opts.template} → ${opts.to}: ${opts.subject}`);
    await prisma.emailLog.create({ data: { to: opts.to, subject: opts.subject, template: opts.template, status: "SKIPPED", bookingId: opts.bookingId } }).catch(() => {});
    return { status: "SKIPPED" as const };
  }
  try {
    await t.sendMail({ from: opts.from || process.env.MAIL_FROM || "WoYou <no-reply@woyou.de>", to: opts.to, replyTo: opts.replyTo, bcc: opts.bcc, subject: opts.subject, html: opts.html, text: opts.text, attachments: opts.attachments });
    await prisma.emailLog.create({ data: { to: opts.to, subject: opts.subject, template: opts.template, status: "SENT", bookingId: opts.bookingId } }).catch(() => {});
    return { status: "SENT" as const };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[mail] Fehler:", error);
    await prisma.emailLog.create({ data: { to: opts.to, subject: opts.subject, template: opts.template, status: "FAILED", error: error.slice(0, 500), bookingId: opts.bookingId } }).catch(() => {});
    return { status: "FAILED" as const, error };
  }
}
