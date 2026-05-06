import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LanguageTest } from "@/components/LanguageTest";
import { TESTS, TEST_LANG_LABEL } from "@/lib/language-test";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";

export default async function LanguageTestPage(props: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    redirect("/anmelden");
  }
  const sp = await props.searchParams;
  const langs = ["de", "fr", "ar"] as const;
  const selected = (langs as readonly string[]).includes(sp.lang ?? "")
    ? (sp.lang as "de" | "fr" | "ar")
    : null;

  if (!selected) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-2xl px-6 py-12">
            <div className="card">
              <span className="section-tag">Sprachtest</span>
              <h1 className="text-2xl font-bold">Welche Sprache möchtest du testen?</h1>
              <p className="mt-2 text-[color:var(--color-ink-soft)]">
                Du kannst alle drei machen — die Ergebnisse werden in deinem Profil
                gespeichert. Jeder Test hat 12 Multiple-Choice-Fragen (A1 bis B2),
                Dauer ca. 5 Minuten.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {langs.map((l) => (
                  <a
                    key={l}
                    href={`/sprachtest?lang=${l}`}
                    className="card flex flex-col items-center text-center hover:border-[color:var(--color-brand)] transition"
                  >
                    <div className="text-4xl">{TEST_LANG_LABEL[l].flag}</div>
                    <div className="mt-3 font-semibold">{TEST_LANG_LABEL[l].de}</div>
                    <div className="text-xs text-[color:var(--color-ink-soft)] mt-1">
                      {TESTS[l].length} Fragen
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const questions = TESTS[selected];
  const meta = TEST_LANG_LABEL[selected];
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <a href="/sprachtest" className="text-sm text-[color:var(--color-ink-soft)]">← andere Sprache</a>
          <LanguageTest questions={questions} language={selected} languageLabel={`${meta.flag} ${meta.de}`} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
