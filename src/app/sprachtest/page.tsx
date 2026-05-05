import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LanguageTest } from "@/components/LanguageTest";
import { LANGUAGE_TEST } from "@/lib/language-test";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";

export default async function LanguageTestPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    redirect("/anmelden");
  }
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <LanguageTest questions={LANGUAGE_TEST} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
