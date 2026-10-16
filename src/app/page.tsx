import type { Metadata } from "next";
import { ServiceLanding } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: { absolute: "WoYou · 25 Bewerbungen für 199 €" },
  description: "Wir erstellen deinen Lebenslauf nach deutschem Standard und verschicken 25 passende Bewerbungen in deinem Namen. Einmalig 199 €, kein Abo.",
};

export default function HomePage() {
  return <ServiceLanding />;
}
