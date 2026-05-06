import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ROLE,
  MATCH_STATUS,
  MATCH_STATUS_LABEL,
  CANDIDATE_STATUS_LABEL,
} from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";
import { CompanyMatchActions } from "@/components/CompanyMatchActions";
import { MatchTimeline } from "@/components/MatchTimeline";
import { parseDocs, findAvatar } from "@/lib/uploads";
import { AvatarBubble } from "@/components/AvatarUpload";

export default async function CompanyDashboardPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.COMPANY) {
    redirect("/anmelden");
  }
  const company = await prisma.company.findUnique({
    where: { userId: session.userId! },
    include: {
      jobRequests: { orderBy: { createdAt: "desc" } },
      matches: {
        include: { candidate: true, jobRequest: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!company) redirect("/arbeitgeber/registrierung");

  const visibleStatuses: string[] = [
    MATCH_STATUS.SHARED_WITH_COMPANY,
    MATCH_STATUS.COMPANY_INTERESTED,
    MATCH_STATUS.COMPANY_DECLINED,
    MATCH_STATUS.IN_CONVERSATION,
    MATCH_STATUS.HIRED,
  ];
  const proposals = company.matches.filter((m) =>
    visibleStatuses.includes(m.status)
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <p className="text-sm text-[color:var(--color-ink-soft)]">
                {company.industry ?? "—"} · {company.city ?? "—"}
              </p>
            </div>
            <Link href="/firmen/anfrage-neu" className="btn-primary">
              + Neue Stellenanfrage
            </Link>
          </div>

          <h2 className="mt-10 text-xl font-bold">Ihre Stellenanfragen</h2>
          <div className="mt-3 grid gap-3">
            {company.jobRequests.map((jr) => (
              <div key={jr.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {jr.customJobTitle ?? jobLabel(jr.jobCategory)}
                  </div>
                  <div className="text-xs text-[color:var(--color-ink-soft)]">
                    {jr.location ?? "—"} · ab {jr.minYearsExperience ?? 0} Jahren Erfahrung · DE {jr.requiredGermanLevel ?? "—"}
                    {jr.isCustomRequest && (
                      <span className="ml-2 inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        SONDERWUNSCH — Vermittler informiert
                      </span>
                    )}
                  </div>
                </div>
                <span className="badge bg-emerald-100 text-emerald-800">{jr.status}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-bold">
            Kandidaten-Vorschläge
            <span className="ml-2 text-sm font-normal text-[color:var(--color-ink-soft)]">
              (nur sichtbar nach Zustimmung des Kandidaten)
            </span>
          </h2>
          {proposals.length === 0 ? (
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              Noch keine freigegebenen Vorschläge. Sobald die Vermittlung
              passende Kandidaten gefunden hat und diese zustimmen, erscheinen
              sie hier.
            </p>
          ) : (
            <div className="mt-3 grid gap-3">
              {proposals.map((m) => {
                const ms = MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL];
                const cs = CANDIDATE_STATUS_LABEL[m.candidate.status as keyof typeof CANDIDATE_STATUS_LABEL];
                return (
                  <div key={m.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <AvatarBubble
                          candidateId={m.candidate.id}
                          filename={findAvatar(parseDocs(m.candidate.documents))?.filename ?? null}
                          initials={`${m.candidate.firstName?.[0] ?? ""}${m.candidate.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
                          size={48}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">
                            {m.candidate.firstName} {m.candidate.lastName?.[0]}.
                            <span className={`badge ml-2 ${cs.color}`}>{cs.de}</span>
                          </div>
                          <div className="text-sm text-[color:var(--color-ink-soft)]">
                            {jobLabel(m.candidate.desiredJobCategory ?? "")} · {m.candidate.yearsExperience ?? 0} J. Erfahrung · DE {m.candidate.germanLevel ?? "—"}
                            {m.candidate.languageTestScore != null && (
                              <> · Test {m.candidate.languageTestScore}/12</>
                            )}
                          </div>
                          <div className="mt-2 text-sm">{m.candidate.aboutMe}</div>
                          {m.jobRequest && (
                            <div className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
                              Vorgeschlagen für: <strong>{m.jobRequest.customJobTitle ?? jobLabel(m.jobRequest.jobCategory)}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${ms?.color ?? ""}`}>{ms?.de ?? m.status}</span>
                    </div>
                    <div className="mt-4">
                      <MatchTimeline status={m.status} />
                    </div>
                    <div className="mt-4">
                      <CompanyMatchActions matchId={m.id} status={m.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
