import { DEMO_MODE_ENABLED } from "@/lib/demo-accounts";

// Schmale Leiste oben auf jeder Seite, nur in Staging (DEMO_MODE an). In der Produktion (woyou.de) unsichtbar.
export function StagingBanner() {
  if (!DEMO_MODE_ENABLED) return null;
  return (
    <div data-umgebung="staging" className="w-full bg-amber-400 text-amber-950 text-xs sm:text-sm text-center px-4 py-1.5 font-medium">
      <strong className="tracking-widest mr-2">STAGING</strong>
      Testumgebung mit Beispieldaten. Zahlungen nur im Stripe-Testmodus, es fließt kein echtes Geld.{" "}
      <a href="https://woyou.de" className="underline font-semibold">Zur echten Seite: woyou.de</a>
    </div>
  );
}
