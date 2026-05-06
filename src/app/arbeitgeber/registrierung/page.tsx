import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompanyRegister } from "@/components/CompanyRegister";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { JOB_CATEGORIES, JOB_GROUPS } from "@/lib/jobs";

export default async function CompanyRegistrationPage() {
  const session = await getSession();

  if (session.userId && session.role === ROLE.COMPANY) {
    const exists = await prisma.company.findUnique({
      where: { userId: session.userId },
    });
    if (exists) redirect("/firmen/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="card">
            <span className="section-tag">Unternehmen</span>
            <h1 className="text-2xl font-bold">Unternehmenskonto anlegen</h1>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">
              In einem Schritt: Unternehmen registrieren + erste Stellenanfrage stellen.
            </p>
            <CompanyRegister
              jobCategories={JOB_CATEGORIES}
              jobGroups={JOB_GROUPS}
              isLoggedIn={Boolean(session.userId)}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
