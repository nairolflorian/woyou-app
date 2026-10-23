import type { MetadataRoute } from "next";

// Zur Laufzeit erzeugen: Staging und Produktion bauen denselben Code, DEMO_MODE und Adresse kommen erst beim Start.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const now = new Date();
  const routes = ["", "/bewerbungsservice", "/registrierung", "/anmelden", "/impressum", "/datenschutz", "/agb"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));
}
