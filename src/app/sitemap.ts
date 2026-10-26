import type { MetadataRoute } from "next";
import { LAENDER, LAND_SLUGS } from "@/lib/laender";

// Zur Laufzeit erzeugen: Staging und Produktion bauen denselben Code, DEMO_MODE und Adresse kommen erst beim Start.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const now = new Date();
  // Länderseiten nur im Pilot (vorbereitete Länder sind noindex), Kampagne kanonisch unter /januar
  const laender = LAND_SLUGS.filter((s) => LAENDER[s].pilot).map((s) => `/${s}`);
  const routes = ["", "/bewerbungsservice", "/selbstcheck", ...laender, "/januar", "/registrierung", "/anmelden", "/impressum", "/datenschutz", "/agb"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));
}
