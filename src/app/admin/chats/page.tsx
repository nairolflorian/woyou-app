import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MATCH_STATUS, MATCH_STATUS_LABEL } from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";

const FILTERS = {
  all: { label: "Alle" },
  active: { label: "Aktiv (offene Kandidaten- oder Firmen-Aktion)" },
  stale: { label: "Stale (>7 Tage keine Nachricht)" },
  awaiting_candidate: { label: "Wartet auf Kandidat:in" },
  awaiting_company: { label: "Wartet auf Firma" },
  in_conversation: { label: "Im Chat" },
} as const;

type FilterKey = keyof typeof FILTERS;

export default async function AdminChatsPage(props: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await props.searchParams;
  const filter: FilterKey = (Object.keys(FILTERS) as FilterKey[]).includes(
    sp.filter as FilterKey
  )
    ? (sp.filter as FilterKey)
    : "all";

  const conversations = await prisma.conversation.findMany({
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, status: true } },
      company: { select: { id: true, companyName: true } },
      match: { select: { id: true, status: true, jobRequest: { select: { jobCategory: true, customJobTitle: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, body: true, createdAt: true, senderId: true, channel: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  // Match-status filters
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const filtered = conversations.filter((c) => {
    if (filter === "all") return true;
    const last = c.messages[0]?.createdAt ?? c.createdAt;
    const isStale = Date.now() - last.getTime() > sevenDays;
    const ms = c.match?.status;
    if (filter === "stale") return isStale;
    if (filter === "in_conversation") return ms === MATCH_STATUS.IN_CONVERSATION;
    if (filter === "awaiting_candidate")
      return ms === MATCH_STATUS.AWAITING_CANDIDATE_CONSENT;
    if (filter === "awaiting_company")
      return ms === MATCH_STATUS.SHARED_WITH_COMPANY;
    if (filter === "active") {
      return (
        ms === MATCH_STATUS.AWAITING_CANDIDATE_CONSENT ||
        ms === MATCH_STATUS.SHARED_WITH_COMPANY ||
        ms === MATCH_STATUS.COMPANY_INTERESTED ||
        ms === MATCH_STATUS.IN_CONVERSATION
      );
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Conversations</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Alle Chats zwischen Kandidat:innen und Unternehmen. Klick auf einen
        Eintrag öffnet den Chat — als Admin kannst du mitlesen und eingreifen.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin/chats?filter=${k}`}
            className={`badge ${
              filter === k
                ? "bg-[color:var(--color-brand)] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {FILTERS[k].label}
          </Link>
        ))}
      </div>

      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left py-2">Kandidat:in</th>
              <th className="text-left">Unternehmen</th>
              <th className="text-left">Stelle</th>
              <th className="text-left">Status</th>
              <th className="text-left">Letzte Nachricht</th>
              <th className="text-right">Aktualisiert</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const last = c.messages[0];
              const ms = c.match?.status as keyof typeof MATCH_STATUS_LABEL | undefined;
              const lbl = ms ? MATCH_STATUS_LABEL[ms] : null;
              const stale =
                Date.now() - (last?.createdAt ?? c.updatedAt).getTime() >
                7 * 24 * 60 * 60 * 1000;
              return (
                <tr
                  key={c.id}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 align-top"
                >
                  <td className="py-2">
                    <Link
                      href={`/admin/kandidaten/${c.candidate.id}`}
                      className="font-semibold hover:text-[color:var(--color-brand)]"
                    >
                      {c.candidate.firstName} {c.candidate.lastName}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/firmen/${c.company.id}`}
                      className="hover:text-[color:var(--color-brand)]"
                    >
                      {c.company.companyName}
                    </Link>
                  </td>
                  <td className="text-xs text-[color:var(--color-ink-soft)]">
                    {c.match?.jobRequest
                      ? c.match.jobRequest.customJobTitle ??
                        jobLabel(c.match.jobRequest.jobCategory)
                      : "—"}
                  </td>
                  <td>
                    {lbl ? (
                      <span className={`badge ${lbl.color}`}>{lbl.de}</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-700">—</span>
                    )}
                  </td>
                  <td className="text-xs max-w-[260px] truncate">
                    {last ? (
                      <>
                        <span
                          className={`badge mr-1 ${
                            last.channel === "PLATFORM"
                              ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {last.channel}
                        </span>
                        {last.body.slice(0, 80)}
                      </>
                    ) : (
                      <span className="text-[color:var(--color-ink-soft)]">
                        Noch keine Nachrichten
                      </span>
                    )}
                  </td>
                  <td className="text-right text-xs whitespace-nowrap">
                    <div>{(last?.createdAt ?? c.updatedAt).toLocaleString("de-DE")}</div>
                    {stale && (
                      <div className="badge bg-amber-100 text-amber-800 mt-1">stale</div>
                    )}
                  </td>
                  <td className="text-right">
                    {c.matchId && (
                      <Link
                        href={`/chat/${c.matchId}`}
                        className="text-[color:var(--color-brand)] font-semibold text-xs"
                      >
                        Öffnen →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[color:var(--color-ink-soft)]">
                  Keine Chats unter diesem Filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[color:var(--color-ink-soft)]">
        Insgesamt {filtered.length} Chats sichtbar (max. 200). Stale =
        keine Nachricht in den letzten 7 Tagen.
      </p>
    </div>
  );
}
