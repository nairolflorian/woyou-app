// Audit-log helper. Every administrative action funnels through `audit()`.
// Failures are logged but never throw — auditing must not break the
// underlying operation.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { clientIp } from "@/lib/rate-limit";

export type AuditAction =
  | "CANDIDATE_STATUS_CHANGE"
  | "CANDIDATE_DELETE"
  | "CANDIDATE_BULK_NOTIFY"
  | "MATCH_PROPOSE_MANUAL"
  | "MATCH_PROPOSE_AUTO"
  | "MATCH_DECISION_INTERESTED"
  | "MATCH_DECISION_DECLINE"
  | "MATCH_DECISION_HIRE"
  | "TASK_CREATE"
  | "TASK_STATUS_CHANGE"
  | "TEAM_MEMBER_CREATE"
  | "ACCOUNT_SELF_DELETE"
  | "CRON_REMATCH_RUN"
  | "CRON_REMINDERS_RUN";

type Refs = {
  candidateId?: string | null;
  companyId?: string | null;
  matchId?: string | null;
  taskId?: string | null;
};

export async function audit(
  req: Request | null,
  action: AuditAction,
  refs: Refs = {},
  meta?: Record<string, unknown>
) {
  try {
    const session = req ? await getSession() : null;
    let actorEmail: string | null = null;
    if (session?.userId) {
      const u = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true },
      });
      actorEmail = u?.email ?? null;
    }
    await prisma.auditLog.create({
      data: {
        actorId: session?.userId ?? null,
        actorEmail,
        actorRole: session?.role ?? null,
        action,
        candidateId: refs.candidateId ?? null,
        companyId: refs.companyId ?? null,
        matchId: refs.matchId ?? null,
        taskId: refs.taskId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
        ip: req ? clientIp(req) : null,
        userAgent: req?.headers.get("user-agent") ?? null,
      },
    });
  } catch (err) {
    console.error("audit log write failed:", err);
  }
}

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  CANDIDATE_STATUS_CHANGE: "Status geändert",
  CANDIDATE_DELETE: "Kandidat:in gelöscht",
  CANDIDATE_BULK_NOTIFY: "Bulk-Benachrichtigung",
  MATCH_PROPOSE_MANUAL: "Manueller Match-Vorschlag",
  MATCH_PROPOSE_AUTO: "Auto-Match",
  MATCH_DECISION_INTERESTED: "Firma: Interesse",
  MATCH_DECISION_DECLINE: "Firma: Ablehnung",
  MATCH_DECISION_HIRE: "Firma: Eingestellt",
  TASK_CREATE: "Aufgabe angelegt",
  TASK_STATUS_CHANGE: "Aufgaben-Status geändert",
  TEAM_MEMBER_CREATE: "Admin-Account angelegt",
  ACCOUNT_SELF_DELETE: "Account-Selbstlöschung",
  CRON_REMATCH_RUN: "Cron: Re-Matching",
  CRON_REMINDERS_RUN: "Cron: Reminder-Lauf",
};
