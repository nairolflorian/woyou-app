import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { aliasDomain } from "@/lib/alias";
import { sendMail, layout } from "@/lib/mail";

// Eingang für Antworten an persönliche WoYou-Adressen (z. B. fatima.benali@bewerbung.woyou.de).
// Der Mail-Dienst (z. B. Brevo „Inbound Parsing“) ruft diese URL auf:
//   POST https://<domain>/api/mail/inbound?token=<MAIL_INBOUND_TOKEN>
// Die Mail wird an die echte Adresse der Kund:in weitergeleitet und bei der passenden Stelle vermerkt.
type Item = { to: string[]; from: string; fromName?: string; subject: string; text: string; html?: string };

function normalize(body: unknown): Item[] {
  const b = body as Record<string, unknown>;
  const items = Array.isArray(b?.items) ? (b.items as Record<string, unknown>[]) : [b];
  return items.map((x) => {
    const rec = (x.Recipients as string[] | undefined) ?? ((x.To as { Address: string }[] | undefined)?.map((t) => t.Address)) ?? [String(x.to ?? "")];
    const from = x.From as { Address?: string; Name?: string } | string | undefined;
    return {
      to: rec.filter(Boolean).map((r) => r.toLowerCase()),
      from: typeof from === "string" ? from : from?.Address ?? String(x.from ?? ""),
      fromName: typeof from === "object" ? from?.Name : undefined,
      subject: String(x.Subject ?? x.subject ?? "(ohne Betreff)"),
      text: String(x.ExtractedMarkdownMessage ?? x.RawTextBody ?? x.text ?? ""),
      html: (x.RawHtmlBody ?? x.html) as string | undefined,
    };
  });
}

export async function POST(req: Request) {
  const want = process.env.MAIL_INBOUND_TOKEN || "";
  const got = new URL(req.url).searchParams.get("token") || "";
  if (!want || !aliasDomain()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const a = crypto.createHash("sha256").update(got).digest(), b = crypto.createHash("sha256").update(want).digest();
  if (!crypto.timingSafeEqual(a, b)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const items = normalize(await req.json().catch(() => ({})));
  let forwarded = 0;
  for (const m of items) {
    const local = m.to.map((t) => t.match(new RegExp(`^([^@]+)@${aliasDomain().replace(/\./g, "\\.")}$`, "i"))?.[1]).find(Boolean);
    if (!local) continue;
    const booking = await prisma.serviceBooking.findUnique({ where: { aliasLocal: local }, include: { candidate: { include: { user: true } }, leads: true } });
    const to = booking?.candidate.user.email;
    if (!booking || !to) continue;
    // Antwort der passenden Stelle zuordnen (Absender-Domain = Domain der Bewerbungs-E-Mail)
    const dom = m.from.split("@")[1]?.toLowerCase();
    const lead = booking.leads.find((l) => l.email && dom && l.email.toLowerCase().endsWith(`@${dom}`));
    if (lead) await prisma.jobLead.update({ where: { id: lead.id }, data: { response: `${new Date().toLocaleDateString("de-DE")}: ${m.subject}\n${m.text.slice(0, 1500)}`, respondedAt: new Date() } });

    const paras = [`Hallo ${booking.candidate.firstName ?? ""},`.trim(), `du hast eine Antwort auf deine Bewerbung bekommen${lead ? ` (${lead.company})` : ""}. Antworte direkt auf diese Mail, dann geht deine Antwort an ${m.from}.`, `Betreff: ${m.subject}`, m.text.slice(0, 8000)];
    await sendMail({ to, replyTo: m.from, subject: `Antwort von ${m.fromName || m.from}: ${m.subject}`, text: paras.join("\n\n"), html: layout("Antwort auf deine Bewerbung", paras), template: "inbound_forward", bookingId: booking.id });
    forwarded++;
  }
  return NextResponse.json({ ok: true, forwarded });
}
