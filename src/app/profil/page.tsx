import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  CANDIDATE_STATUS,
  CANDIDATE_STATUS_LABEL,
  MATCH_STATUS,
  MATCH_STATUS_LABEL,
  ROLE,
} from "@/lib/enums";
import { APP_CONFIG, formatFee } from "@/lib/config";
import { jobLabel } from "@/lib/jobs";
import { UnlockButton } from "@/components/UnlockButton";
import { ConsentButtons } from "@/components/ConsentButtons";

export default async function CandidateDashboardPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    redirect("/anmelden");
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId! },
    include: {
      user: true,
      matches: {
        include: { company: true, jobRequest: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!candidate) redirect("/anmelden");

  const status = candidate.status as keyof typeof CANDIDATE_STATUS_LABEL;
  const labelInfo = CANDIDATE_STATUS_LABEL[status];

  const fee = formatFee("de");

  const consentRequired = candidate.matches.filter(
    (m) => m.status === MATCH_STATUS.AWAITING_CANDIDATE_CONSENT
  );
  const otherMatches = candidate.matches.filter(
    (m) => m.status !== MATCH_STATUS.AWAITING_CANDIDATE_CONSENT
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">
                Hallo {candidate.firstName ?? "👋"}
              </h1>
              <p className="text-sm text-[color:var(--color-ink-soft)]">
                {candidate.user.email ?? candidate.user.phone}
              </p>
            </div>
            <span className={`badge ${labelInfo.color}`}>{labelInfo.de}</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <div className="card md:col-span-2">
              <h2 className="font-semibold">Profil-Vollständigkeit</h2>
              <div className="mt-3 h-3 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-brand)]"
                  style={{ width: `${candidate.profileCompleteness}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                {candidate.profileCompleteness}% ausgefüllt
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/registrierung/profil" className="btn-outline">
                  Profil bearbeiten
                </Link>
                <Link href="/sprachtest" className="btn-outline">
                  {candidate.languageTestPassed
                    ? `Sprachtest erneut machen (Score ${candidate.languageTestScore})`
                    : "Sprachtest durchführen"}
                </Link>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold">Aktivität</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Profilaufrufe</span>
                  <strong>{candidate.timesViewed}</strong>
                </li>
                <li className="flex justify-between">
                  <span>An Unternehmen vorgeschlagen</span>
                  <strong>{candidate.timesProposed}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Gebühr bezahlt</span>
                  <strong>{candidate.paidAt ? "Ja ✓" : "Noch nicht"}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* PAYMENT BANNER */}
          {!candidate.paidAt &&
            (status === CANDIDATE_STATUS.COMPLETE ||
              candidate.profileCompleteness >= 80) && (
              <div className="mt-8 card bg-gradient-to-br from-[color:var(--color-brand)] to-[#3f6f7d] text-white border-transparent">
                <h2 className="text-xl font-bold">Letzter Schritt: Profil freischalten</h2>
                <p className="mt-2 text-white/90 text-sm">
                  Mit der einmaligen Gebühr von <strong>{fee}</strong> wird dein
                  Profil für unsere Partnerunternehmen sichtbar — du wirst
                  „vermittelbar".
                </p>
                <UnlockButton fee={fee} />
              </div>
            )}

          {!candidate.paidAt &&
            status !== CANDIDATE_STATUS.COMPLETE &&
            candidate.profileCompleteness < 80 && (
              <div className="mt-8 card bg-amber-50 border-amber-200">
                <h2 className="font-semibold text-amber-900">
                  Vervollständige zuerst dein Profil
                </h2>
                <p className="mt-2 text-sm text-amber-800">
                  Sobald dein Profil zu mind. 80 % ausgefüllt ist, kannst du es
                  freischalten und wirst für Unternehmen sichtbar.
                </p>
              </div>
            )}

          {/* CONSENT REQUIRED */}
          {consentRequired.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-3">
                Deine Zustimmung wird gebraucht
              </h2>
              <div className="space-y-3">
                {consentRequired.map((m) => (
                  <div key={m.id} className="card border-amber-300 bg-amber-50">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                          Anfrage
                        </div>
                        <h3 className="mt-1 text-lg font-semibold">
                          {m.company.companyName}
                        </h3>
                        {m.jobRequest && (
                          <p className="text-sm text-[color:var(--color-ink-soft)]">
                            sucht{" "}
                            <strong>
                              {m.jobRequest.customJobTitle ??
                                jobLabel(m.jobRequest.jobCategory)}
                            </strong>
                            {m.jobRequest.location && ` in ${m.jobRequest.location}`}
                          </p>
                        )}
                        {m.company.description && (
                          <p className="mt-2 text-sm">{m.company.description}</p>
                        )}
                      </div>
                      <ConsentButtons matchId={m.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER MATCHES */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">Aktuelle Vorschläge & Status</h2>
            {otherMatches.length === 0 ? (
              <p className="text-[color:var(--color-ink-soft)]">
                Noch keine weiteren Vorschläge.
              </p>
            ) : (
              <div className="space-y-3">
                {otherMatches.map((m) => {
                  const ms =
                    MATCH_STATUS_LABEL[
                      m.status as keyof typeof MATCH_STATUS_LABEL
                    ];
                  return (
                    <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{m.company.companyName}</div>
                        {m.jobRequest && (
                          <div className="text-sm text-[color:var(--color-ink-soft)]">
                            {m.jobRequest.customJobTitle ??
                              jobLabel(m.jobRequest.jobCategory)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${ms?.color ?? ""}`}>
                          {ms?.de ?? m.status}
                        </span>
                        {m.status === MATCH_STATUS.IN_CONVERSATION ||
                        m.status === MATCH_STATUS.COMPANY_INTERESTED ? (
                          <Link
                            href={`/chat/${m.id}`}
                            className="btn-outline text-xs px-4 py-1.5"
                          >
                            Chat öffnen
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {APP_CONFIG.channels.telegramBotEnabled && (
            <div className="mt-10 card bg-[#229ED9]/5 border-[#229ED9]/30">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-2xl">✈️</span>
                WoYou-Bot auf Telegram nutzen
              </h3>
              <p className="text-sm mt-1 text-[color:var(--color-ink-soft)]">
                Verlinke deinen Telegram-Account, damit wir dich auch dort
                erreichen können — und Unternehmen direkt mit dir chatten können.
              </p>
              <Link
                href="/registrierung/telegram"
                className="btn-outline mt-3 inline-flex"
              >
                Bot öffnen
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
