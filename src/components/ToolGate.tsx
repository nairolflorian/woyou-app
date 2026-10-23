import Link from "next/link";
import type { werkzeugText } from "@/lib/werkzeug-text";

// Hinweis, wenn das Werkzeug nicht (mehr) freigeschaltet ist.
// Abgelaufen: keine Verlängerung (gibt es nicht mehr), sondern der Weg zu den eigenen Unterlagen.
export function ToolGate({ t, expired }: { t: ReturnType<typeof werkzeugText>; expired: boolean }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold">{expired ? t.expiredTitle : t.lockedTitle}</h2>
      <p className="mt-2 text-[color:var(--color-ink-soft)]">{expired ? t.expiredLead : t.lockedLead}</p>
      <Link href={expired ? "/profil#unterlagen" : "/#angebot"} className="btn-primary mt-4 inline-flex">{expired ? t.expiredCta : t.lockedCta}</Link>
    </div>
  );
}
