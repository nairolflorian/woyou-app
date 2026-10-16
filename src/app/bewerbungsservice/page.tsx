import type { Metadata } from "next";
import { ServiceLanding } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Bewerbungs-Service: 25 Bewerbungen für 199 €",
  description: "Wir erstellen deinen Lebenslauf nach deutschem Standard und verschicken 25 passende Bewerbungen in deinem Namen. Einmalig 199 €.",
};

export default function ApplicationServicePage() {
  return <ServiceLanding />;
}
