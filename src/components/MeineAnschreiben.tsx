import type { werkzeugText } from "@/lib/werkzeug-text";
import type { TrackerItem } from "@/lib/tracker";

// Nach Ablauf des Werkzeugs: Tracker ist gesperrt, aber die Anschreiben je Stelle (und der Lebenslauf)
// bleiben herunterladbar. Die Unterlagen gehören der Person.
export function MeineAnschreiben({ t, items }: { t: ReturnType<typeof werkzeugText>; items: TrackerItem[] }) {
  const letters = items.filter((x) => x.coverLetter !== null);
  return (
    <section className="card">
      <h2 className="font-semibold">{t.lettersTitle}</h2>
      {letters.length === 0 ? <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{t.noLetters}</p> : (
        <>
          <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{t.lettersLead}</p>
          <ul className="mt-3 divide-y divide-[color:var(--color-border)]">
            {letters.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span><strong>{x.title}</strong> · {x.company}{x.city ? ` · ${x.city}` : ""}</span>
                <span className="flex flex-wrap gap-2">
                  <a className="btn-outline py-1" href={`/api/stellen/${x.id}/dokument?format=pdf`}>{t.pdf}</a>
                  <a className="btn-ghost py-1" href={`/api/stellen/${x.id}/dokument?format=docx`}>{t.word}</a>
                  <a className="btn-ghost py-1" href={`/api/stellen/${x.id}/dokument?format=cv`}>{t.cv}</a>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
