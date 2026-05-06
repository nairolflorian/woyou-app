import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileWizard } from "@/components/ProfileWizard";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { JOB_CATEGORIES, JOB_GROUPS } from "@/lib/jobs";

export default async function ProfileWizardPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    redirect("/anmelden");
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId! },
  });
  if (!candidate) redirect("/anmelden");

  const initial = {
    firstName: candidate.firstName ?? "",
    lastName: candidate.lastName ?? "",
    dateOfBirth: candidate.dateOfBirth?.toISOString().slice(0, 10) ?? "",
    gender: candidate.gender ?? "",
    nationality: candidate.nationality ?? "",
    countryOfResidence: candidate.countryOfResidence ?? "",
    city: candidate.city ?? "",
    preferredChannel: candidate.preferredChannel ?? "EMAIL",
    telegramHandle: candidate.telegramHandle ?? "",
    whatsappNumber: candidate.whatsappNumber ?? "",
    desiredJobCategory: candidate.desiredJobCategory ?? "",
    desiredJobTitle: candidate.desiredJobTitle ?? "",
    alternativeJobs: candidate.alternativeJobs
      ? JSON.parse(candidate.alternativeJobs)
      : [],
    educationLevel: candidate.educationLevel ?? "",
    yearsExperience: candidate.yearsExperience ?? 0,
    currentJob: candidate.currentJob ?? "",
    currentEmployer: candidate.currentEmployer ?? "",
    drivingLicense: candidate.drivingLicense ?? false,
    willingnessToRelocate: candidate.willingnessToRelocate ?? true,
    preferredCities: candidate.preferredCities
      ? JSON.parse(candidate.preferredCities)
      : [],
    earliestStart: candidate.earliestStart?.toISOString().slice(0, 10) ?? "",
    expectedSalaryMin: candidate.expectedSalaryMin ?? undefined,
    expectedSalaryMax: candidate.expectedSalaryMax ?? undefined,
    germanLevel: candidate.germanLevel ?? "",
    englishLevel: candidate.englishLevel ?? "",
    otherLanguages: candidate.otherLanguages
      ? JSON.parse(candidate.otherLanguages)
      : [],
    aboutMe: candidate.aboutMe ?? "",
    motivation: candidate.motivation ?? "",
    familyStatus: candidate.familyStatus ?? "",
    dependents: candidate.dependents ?? 0,
    consentMode: (candidate.consentMode as "BLANKET" | "PER_COMPANY") ?? "PER_COMPANY",
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <ProfileWizard
            initial={initial}
            jobCategories={JOB_CATEGORIES}
            jobGroups={JOB_GROUPS}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
