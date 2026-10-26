import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AGB_TITEL, agbAbschnitte } from "@/lib/recht/agb-text";

export const metadata = { title: "AGB" };

// ANWALT PRÜFEN: Der Text steht in src/lib/recht/agb-text.ts (gleiche Quelle für die Buchungsbestätigung per E-Mail).
// Dort auch die Hinweise zu den Änderungen in §§ 3 und 7 (26.10.2026). Hinweise nur im Code, nicht sichtbar.
export default function AGB() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12" lang="de">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">{AGB_TITEL}</h1>
          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            {agbAbschnitte().map((a) => (
              <section key={a.titel}>
                <h2 className="font-semibold text-base">{a.titel}</h2>
                <p>{a.text}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
