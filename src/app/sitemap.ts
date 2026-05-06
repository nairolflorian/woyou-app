import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/bewerber",
    "/arbeitgeber",
    "/registrierung",
    "/registrierung/telegram",
    "/anmelden",
    "/sprachtest",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/demo",
  ];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));
}
