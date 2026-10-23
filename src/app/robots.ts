import type { MetadataRoute } from "next";

// Zur Laufzeit erzeugen: Staging und Produktion bauen denselben Code, DEMO_MODE und Adresse kommen erst beim Start.
export const dynamic = "force-dynamic";


export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const DEMO = process.env.DEMO_MODE !== "false";
  // In DEMO_MODE the site is a sandbox — we don't want it indexed.
  return DEMO
    ? {
        rules: { userAgent: "*", disallow: "/" },
        host: BASE,
      }
    : {
        rules: [
          { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/profil", "/druck", "/meine-bewerbungen", "/stellensuche", "/bewerbungsmappe"] },
        ],
        sitemap: `${BASE}/sitemap.xml`,
        host: BASE,
      };
}
