import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const DEMO = process.env.DEMO_MODE !== "false";

export default function robots(): MetadataRoute.Robots {
  // In DEMO_MODE the site is a sandbox — we don't want it indexed.
  return DEMO
    ? {
        rules: { userAgent: "*", disallow: "/" },
        host: BASE,
      }
    : {
        rules: [
          { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/profil", "/firmen", "/druck"] },
        ],
        sitemap: `${BASE}/sitemap.xml`,
        host: BASE,
      };
}
