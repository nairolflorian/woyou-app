import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEMO_ACCOUNTS, DEMO_MODE_ENABLED } from "@/lib/demo-accounts";

export const metadata = {
  title: "WoYou — Demo-Modus",
};

const ROLE_GROUPS: Record<string, string> = {
  SUPER_ADMIN: "Backoffice",
  ADMIN: "Backoffice",
  COMPANY: "Unternehmen",
  CANDIDATE: "Kandidat:innen",
};

export default function DemoPage() {
  if (!DEMO_MODE_ENABLED) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <h1 className="text-2xl font-bold">Demo-Modus deaktiviert</h1>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              Setze <code>DEMO_MODE=true</code> in deinen Umgebungsvariablen um
              den Rollen-Switcher zu aktivieren.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const grouped: Record<string, typeof DEMO_ACCOUNTS> = {};
  for (const acc of DEMO_ACCOUNTS) {
    const g = ROLE_GROUPS[acc.role];
    grouped[g] = grouped[g] ?? [];
    grouped[g].push(acc);
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <span className="section-tag">Demo-Modus</span>
            <h1 className="text-3xl md:text-4xl font-bold">
              Klick eine Rolle — und du bist drin.
            </h1>
            <p className="mt-3 text-[color:var(--color-ink-soft)] max-w-2xl mx-auto">
              Diese Seite ist nur in der Demo aktiv. Jeder Klick loggt dich
              automatisch als die jeweilige Person ein und springt direkt in
              ihren Bereich. Du kannst jederzeit über die Leiste unten rechts
              die Rolle wechseln.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {Object.entries(grouped).map(([group, accounts]) => (
              <div key={group}>
                <h2 className="text-xs font-bold tracking-widest uppercase text-[color:var(--color-ink-soft)] mb-4">
                  {group}
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {accounts.map((acc) => (
                    <a
                      key={acc.email}
                      href={`/api/auth/demo-login?email=${encodeURIComponent(acc.email)}`}
                      className="group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white p-5 hover:border-[color:var(--color-brand)] hover:shadow-lg transition"
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${acc.color}`} />
                      <div className="text-4xl">{acc.emoji}</div>
                      <h3 className="mt-3 text-lg font-bold">{acc.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-wider text-[color:var(--color-brand)] font-semibold">
                        {acc.role.replace("_", "-")}
                      </p>
                      <p className="mt-3 text-sm text-[color:var(--color-ink-soft)] leading-relaxed">
                        {acc.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-brand)] group-hover:translate-x-0.5 transition">
                        Als {acc.name} einloggen →
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 card bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900">💡 So testest du den Match-Flow</h3>
            <ol className="mt-3 list-decimal ml-5 space-y-1.5 text-sm text-amber-900">
              <li>Erst als <strong>Vermittler:in</strong> einloggen → Matching → Top-Kandidat:in für die Klinik vorschlagen.</li>
              <li>Danach als <strong>Fatima</strong> einloggen (Pauschal-Freigabe) — sie ist sofort im Firmen-Pool sichtbar.</li>
              <li>Oder als <strong>Youssef</strong> (Einzel-Freigabe) — er muss erst zustimmen, bevor die Firma sein Profil sieht.</li>
              <li>Als <strong>Klinik Berlin</strong> einloggen → „Interesse zeigen" → Chat öffnet sich → Nachricht senden.</li>
              <li>Zurück als <strong>Fatima</strong> → Antwort senden → schließlich als Klinik „Eingestellt markieren".</li>
              <li>Status-Wechsel und Visum-Aufgabe für die Vermittler:innen werden automatisch erzeugt.</li>
            </ol>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="btn-ghost">
              ← zur normalen Startseite
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
