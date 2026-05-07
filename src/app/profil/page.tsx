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
  ROLE,
} from "@/lib/enums";
import { APP_CONFIG, formatFee } from "@/lib/config";
import { getT } from "@/lib/i18n";
import { jobLabel } from "@/lib/jobs";
import { UnlockButton } from "@/components/UnlockButton";
import { ConsentButtons } from "@/components/ConsentButtons";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AccountControls } from "@/components/AccountControls";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { parseDocs, findAvatar } from "@/lib/uploads";
import { AvatarUpload } from "@/components/AvatarUpload";
import { MatchTimeline } from "@/components/MatchTimeline";
import { scoreCandidate } from "@/lib/matching";
import { ProfileStrengthTips } from "@/components/ProfileStrengthTips";
import { profileStrengthTips } from "@/lib/candidate";
import { LoginEditForm } from "@/components/LoginEditForm";

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

  const { t, locale } = await getT();
  const status = candidate.status as keyof typeof CANDIDATE_STATUS_LABEL;
  const labelInfo = CANDIDATE_STATUS_LABEL[status];
  const statusLabel =
    (labelInfo as Record<string, string>)[locale] ?? labelInfo.de;
  const fee = formatFee(locale);

  const consentRequired = candidate.matches.filter(
    (m) => m.status === MATCH_STATUS.AWAITING_CANDIDATE_CONSENT
  );
  const otherMatches = candidate.matches.filter(
    (m) => m.status !== MATCH_STATUS.AWAITING_CANDIDATE_CONSENT
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {(() => {
            const docs = parseDocs(candidate.documents);
            const avatar = findAvatar(docs);
            const initials =
              `${candidate.firstName?.[0] ?? ""}${candidate.lastName?.[0] ?? ""}`.toUpperCase() || "👋";
            return (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <AvatarUpload
                      candidateId={candidate.id}
                      initialFilename={avatar?.filename ?? null}
                      initials={initials}
                    />
                    <div className="min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold truncate">
                        {t("dash.hello", { name: candidate.firstName ?? "👋" })}
                      </h1>
                      <p className="text-sm text-[color:var(--color-ink-soft)] truncate">
                        {candidate.user.email ?? candidate.user.phone}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${labelInfo.color} flex-shrink-0`}>{statusLabel}</span>
                </div>
              </>
            );
          })()}

          <div className="mt-8 grid gap-4 md:gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <OnboardingChecklist
                profileCompleteness={candidate.profileCompleteness}
                testTaken={candidate.languageTestPassed != null}
                hasDocuments={parseDocs(candidate.documents).length > 0}
                paid={Boolean(candidate.paidAt)}
              />
            </div>
            <ProfileStrengthTips tips={profileStrengthTips(candidate)} />
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-3 mt-6 md:mt-8">
            <div className="card md:col-span-2">
              <h2 className="font-semibold">{t("dash.completeness")}</h2>
              <div className="mt-3 h-3 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-brand)]"
                  style={{ width: `${candidate.profileCompleteness}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                {t("dash.percent_complete", { n: candidate.profileCompleteness })}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/registrierung/profil" className="btn-outline">
                  {t("dash.edit_profile")}
                </Link>
                <Link href="/sprachtest" className="btn-outline">
                  {candidate.languageTestPassed
                    ? t("dash.do_test_again", { score: candidate.languageTestScore ?? "" })
                    : t("dash.do_test_first")}
                </Link>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold">{t("dash.activity")}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>{t("dash.profile_views")}</span>
                  <strong>{candidate.timesViewed}</strong>
                </li>
                <li className="flex justify-between">
                  <span>{t("dash.proposed_to_companies")}</span>
                  <strong>{candidate.timesProposed}</strong>
                </li>
                <li className="flex justify-between">
                  <span>{t("dash.fee_paid")}</span>
                  <strong>{candidate.paidAt ? t("dash.fee_paid_yes") : t("dash.fee_paid_no")}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* PAYMENT BANNER */}
          {!candidate.paidAt &&
            (status === CANDIDATE_STATUS.COMPLETE ||
              candidate.profileCompleteness >= 80) && (
              <div className="mt-8 card bg-gradient-to-br from-[color:var(--color-brand)] to-[#3f6f7d] text-white border-transparent">
                <h2 className="text-xl font-bold">{t("dash.unlock_title")}</h2>
                <p className="mt-2 text-white/90 text-sm">
                  {t("dash.unlock_desc", { fee })}
                </p>
                <UnlockButton fee={fee} />
              </div>
            )}

          {!candidate.paidAt &&
            status !== CANDIDATE_STATUS.COMPLETE &&
            candidate.profileCompleteness < 80 && (
              <div className="mt-8 card bg-amber-50 border-amber-200">
                <h2 className="font-semibold text-amber-900">
                  {t("dash.fill_profile_first_title")}
                </h2>
                <p className="mt-2 text-sm text-amber-800">
                  {t("dash.fill_profile_first_desc")}
                </p>
              </div>
            )}

          {/* CONSENT REQUIRED */}
          {consentRequired.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-3">
                {t("dash.consent_required_h")}
              </h2>
              <div className="space-y-3">
                {consentRequired.map((m) => {
                  const scoreInfo =
                    m.jobRequest && m.matchScore != null
                      ? scoreCandidate(candidate, m.jobRequest)
                      : null;
                  return (
                    <div key={m.id} className="card border-amber-300 bg-amber-50">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                            {t("dash.consent_request")}
                          </div>
                          <h3 className="mt-1 text-lg font-semibold">
                            {m.company.companyName}
                          </h3>
                          {m.jobRequest && (
                            <p className="text-sm text-[color:var(--color-ink-soft)]">
                              {t("dash.searches_for")}{" "}
                              <strong>
                                {m.jobRequest.customJobTitle ??
                                  jobLabel(m.jobRequest.jobCategory, locale)}
                              </strong>
                              {m.jobRequest.location &&
                                " " + t("dash.in_city", { city: m.jobRequest.location })}
                            </p>
                          )}
                          {m.company.description && (
                            <p className="mt-2 text-sm">{m.company.description}</p>
                          )}
                          {scoreInfo && scoreInfo.reasons.length > 0 && (
                            <details className="mt-3 text-sm">
                              <summary className="cursor-pointer text-amber-900 font-semibold">
                                {t("dash.why_match")}
                                {m.matchScore != null && ` · ${m.matchScore}/100`}
                              </summary>
                              <ul className="mt-2 list-disc ml-5 text-amber-900 space-y-0.5">
                                {scoreInfo.reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                        <ConsentButtons matchId={m.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          <div id="dokumente" className="mt-10 card scroll-mt-20">
            <h2 className="text-xl font-bold">{t("dash.documents_h")}</h2>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">
              {t("dash.documents_desc")}
            </p>
            <div className="mt-4">
              <DocumentUpload candidateId={candidate.id} />
            </div>
          </div>

          {/* OTHER MATCHES */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">{t("dash.proposals_h")}</h2>
            {otherMatches.length === 0 ? (
              <p className="text-[color:var(--color-ink-soft)]">
                {t("dash.no_other_proposals")}
              </p>
            ) : (
              <div className="space-y-3">
                {otherMatches.map((m) => {
                  const scoreInfo =
                    m.jobRequest && m.matchScore != null
                      ? scoreCandidate(candidate, m.jobRequest)
                      : null;
                  return (
                    <div key={m.id} className="card">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{m.company.companyName}</div>
                          {m.jobRequest && (
                            <div className="text-sm text-[color:var(--color-ink-soft)]">
                              {m.jobRequest.customJobTitle ??
                                jobLabel(m.jobRequest.jobCategory, locale)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {m.matchScore != null && (
                            <span className="badge bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] font-semibold">
                              {t("dash.why_match_score", { score: m.matchScore })}
                            </span>
                          )}
                          <span className="badge bg-slate-100 text-slate-700">
                            {t(`matchstatus.${m.status}`)}
                          </span>
                          {m.status === MATCH_STATUS.IN_CONVERSATION ||
                          m.status === MATCH_STATUS.COMPANY_INTERESTED ? (
                            <Link
                              href={`/chat/${m.id}`}
                              className="btn-outline text-xs px-4 py-1.5"
                            >
                              {t("dash.open_chat")}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4">
                        <MatchTimeline status={m.status} />
                      </div>
                      {scoreInfo && scoreInfo.reasons.length > 0 && (
                        <details className="mt-3 text-sm">
                          <summary className="cursor-pointer text-[color:var(--color-brand)] font-semibold">
                            {t("dash.why_match")}
                          </summary>
                          <ul className="mt-2 list-disc ml-5 text-[color:var(--color-ink-soft)] space-y-0.5">
                            {scoreInfo.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-10 card">
            <h2 className="text-xl font-bold">{t("dash.account_h")}</h2>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1 mb-6">
              {t("dash.account_desc")}
            </p>
            <LoginEditForm
              initialEmail={candidate.user.email}
              initialPhone={candidate.user.phone}
            />
            <hr className="my-6 border-[color:var(--color-border)]" />
            <AccountControls />
          </div>

          {APP_CONFIG.channels.telegramBotEnabled && (
            <div className="mt-10 card bg-[#229ED9]/5 border-[#229ED9]/30">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-2xl">✈️</span>
                {t("dash.telegram_h")}
              </h3>
              <p className="text-sm mt-1 text-[color:var(--color-ink-soft)]">
                {t("dash.telegram_desc")}
              </p>
              <Link
                href="/registrierung/telegram"
                className="btn-outline mt-3 inline-flex"
              >
                {t("dash.telegram_open")}
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
