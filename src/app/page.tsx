import type { Metadata } from "next";
import { ServiceLanding } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: { absolute: "WoYou · Bewerbungsunterlagen und Bewerbungswerkzeug" },
  description: "Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Du entscheidest, wo du dich bewirbst, und bekommst alle Antworten direkt.",
};

export default function HomePage() {
  return <ServiceLanding />;
}
