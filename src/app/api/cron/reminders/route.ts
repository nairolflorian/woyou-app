// Daily reminder pass. Bearer-token protected via CRON_SECRET.
//
// Creates Notification rows for:
//   1. Candidates with INCOMPLETE profile, registered > 3 days ago,
//      no reminder yet today.
//   2. Matches AWAITING_CANDIDATE_CONSENT older than 24h.
//   3. Matches SHARED_WITH_COMPANY older than 48h with no company response.
//   4. Admin tasks past dueDate, status OPEN/IN_PROGRESS — notify the
//      assigned admin or all admins if unassigned.
//
// Notifications are deduplicated within the last 20h so a daily cron
// doesn't spam.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS, ROLE } from "@/lib/enums";
import { audit } from "@/lib/audit";
import { sendMail, layout } from "@/lib/mail";
import { mappeText } from "@/lib/mappe-i18n";
import { WEG1 } from "@/lib/weg1";

const DEDUP_WINDOW_MS = 20 * 60 * 60 * 1000;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function notifyOnce(
  userId: string,
  type: string,
  data: { title: string; body?: string; link?: string }
): Promise<boolean> {
  const recent = await prisma.notification.findFirst({
    where: { userId, type, createdAt: { gt: new Date(Date.now() - DEDUP_WINDOW_MS) } },
  });
  if (recent) return false;
  await prisma.notification.create({
    data: { userId, type, title: data.title, body: data.body, link: data.link },
  });
  return true;
}

async function run() {
  let counts = { incomplete: 0, candidateConsent: 0, companyStale: 0, overdueTasks: 0, mappeReminders: 0 };

  // 1. Profil-Erinnerung (Vermittlung) entfällt: WoYou bietet nur noch den Bewerbungs-Service an.

  // 2. Matches awaiting candidate consent for >24h
  const consentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // Weg 1: Matching ist abgeschaltet, keine Erinnerungen zu Vorschlägen an Kund:innen oder Firmen
  const consentPending = !WEG1.arbeitgeberUndMatching ? [] : await prisma.match.findMany({
    where: {
      status: MATCH_STATUS.AWAITING_CANDIDATE_CONSENT,
      createdAt: { lt: consentThreshold },
    },
    include: { candidate: true, company: true },
  });
  for (const m of consentPending) {
    if (
      await notifyOnce(m.candidate.userId, `CONSENT_REMINDER:${m.id}`, {
        title: "Erinnerung: Zustimmung benötigt",
        body: `${m.company.companyName} möchte dein Profil ansehen — du hast noch nicht entschieden.`,
        link: "/profil",
      })
    ) {
      counts.candidateConsent++;
    }
  }

  // 3. Matches shared with company but no response in 48h
  const companyThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const companyStale = !WEG1.arbeitgeberUndMatching ? [] : await prisma.match.findMany({
    where: {
      status: MATCH_STATUS.SHARED_WITH_COMPANY,
      updatedAt: { lt: companyThreshold },
    },
    include: { company: true, candidate: true },
  });
  for (const m of companyStale) {
    if (
      await notifyOnce(m.company.userId, `COMPANY_REMINDER:${m.id}`, {
        title: "Erinnerung: Kandidaten-Vorschlag wartet",
        body: `Sie haben noch nicht entschieden — bitte gehen Sie ins Dashboard.`,
        link: "/firmen/dashboard",
      })
    ) {
      counts.companyStale++;
    }
  }

  // 4. Admin tasks past due
  const overdue = await prisma.adminTask.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      dueDate: { lt: new Date(), not: null },
    },
  });
  for (const t of overdue) {
    if (t.assignedToId) {
      if (
        await notifyOnce(t.assignedToId, `TASK_OVERDUE:${t.id}`, {
          title: `Aufgabe überfällig: ${t.title}`,
          body: t.description ?? undefined,
          link: "/admin/aufgaben",
        })
      ) {
        counts.overdueTasks++;
      }
    } else {
      // Unassigned — notify all admins
      const admins = await prisma.user.findMany({
        where: { role: { in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] } },
        select: { id: true },
      });
      for (const a of admins) {
        if (
          await notifyOnce(a.id, `TASK_OVERDUE:${t.id}`, {
            title: `Aufgabe überfällig: ${t.title}`,
            body: t.description ?? undefined,
            link: "/admin/aufgaben",
          })
        ) {
          counts.overdueTasks++;
        }
      }
    }
  }

  // 5. Startpaket gebucht, Mappe nach 3 Tagen noch nicht abgeschickt → Hinweis + Mail (max. alle 3 Tage)
  const mappeThreshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const openBookings = await prisma.serviceBooking.findMany({
    where: { status: { in: ["REQUESTED", "PAID"] }, createdAt: { lt: mappeThreshold }, OR: [{ profile: null }, { profile: { status: "DRAFT" } }] },
    include: { candidate: { include: { user: true } } },
  });
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  for (const b of openBookings) {
    const u = b.candidate.user;
    const tx = mappeText(u.locale || "de");
    await notifyOnce(u.id, `MAPPE_REMINDER:${b.id}`, { title: tx.title, body: tx.intro, link: "/bewerbungsmappe" });
    const recentMail = await prisma.emailLog.findFirst({ where: { bookingId: b.id, template: "mappe_reminder", createdAt: { gt: mappeThreshold } } });
    if (!recentMail && u.email) {
      const name = b.candidate.firstName ?? "";
      const paras = [`Hallo ${name},`.replace(" ,", ","), "für dein Startpaket fehlt uns noch deine Bewerbungsmappe. Sobald du sie abgeschickt hast, prüfen wir deine Angaben und machen deinen Lebenslauf und deine Anschreiben-Vorlage fertig.", "Du kannst auch einfach deinen vorhandenen Lebenslauf als PDF hochladen.", "Viele Grüße", "Dein WoYou-Team"];
      await sendMail({ to: u.email, subject: "WoYou: Deine Bewerbungsmappe wartet", template: "mappe_reminder", bookingId: b.id, text: paras.join("\n\n"), html: layout("Deine Bewerbungsmappe wartet", paras, { label: "Zur Bewerbungsmappe", href: `${base}/bewerbungsmappe` }) });
    }
    counts.mappeReminders++;
  }

  return counts;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const counts = await run();
  await audit(null, "CRON_REMINDERS_RUN", {}, counts);
  return NextResponse.json({ ok: true, ...counts });
}

export async function GET(req: Request) {
  return POST(req);
}
