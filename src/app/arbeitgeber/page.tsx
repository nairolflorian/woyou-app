import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JOB_GROUPS } from "@/lib/jobs";

export default function EmployerLanding() {
  return (
    <>
      <SiteHeader />
      <section className="bg-gradient-to-br from-[#6F9EAB] to-[#3f6f7d] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-widest">
            FÜR ARBEITGEBER
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">
            Internationale Talente, vorqualifiziert für Deutschland
          </h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Wir bringen Ihnen Fachkräfte und Auszubildende aus dem Ausland mit
            geprüftem Sprachniveau, Visum-Vorbereitung und persönlicher Begleitung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/arbeitgeber/registrierung"
              className="inline-flex items-center justify-center rounded-full bg-white text-[color:var(--color-brand)] font-semibold px-8 py-3"
            >
              Stellenanfrage starten
            </Link>
            <Link
              href="/anmelden"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/80 text-white font-semibold px-8 py-3"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { i: "🎯", t: "Vorgefiltert", d: "Sprachtest-Score, Berufserfahrung und Verfügbarkeit auf einen Blick." },
              { i: "🤝", t: "Mit Zustimmung", d: "Kandidaten geben aktiv frei — keine kalten Lebensläufe." },
              { i: "🛂", t: "End-to-End-Support", d: "Wir kümmern uns um Visum, Anerkennung und Integration." },
            ].map((b) => (
              <div key={b.t} className="card">
                <div className="text-3xl">{b.i}</div>
                <h3 className="mt-3 font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-bold">Aus diesen Berufsgruppen vermitteln wir</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Object.entries(JOB_GROUPS).map(([slug, g]) => (
              <div key={slug} className="card flex items-center gap-4">
                <div className="text-3xl">{g.icon}</div>
                <div className="font-semibold">{g.de}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[color:var(--color-ink-soft)]">
            Sie suchen einen Beruf, der nicht in der Liste steht? Bei der
            Anfrage können Sie eine <strong>Sonderanfrage</strong> stellen — sie
            landet direkt bei unseren Vermittlern.
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
