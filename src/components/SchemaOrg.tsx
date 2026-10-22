// Drop-in JSON-LD blocks for the homepage. Renders <script type="application/ld+json">
// inline in the HTML so search engines and rich-result previews pick it up.

import { headers } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WoYou",
  url: BASE,
  logo: `${BASE}/Logo.png`,
  sameAs: ["https://woyou.de"],
  description:
    "WoYou erstellt Bewerbungsunterlagen nach deutschem Standard und gibt dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst.",
  areaServed: { "@type": "Country", name: "Germany" },
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "WoYou",
  url: BASE,
  inLanguage: ["de", "en", "fr", "ar"],
};

export async function SchemaOrg() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }}
      />
    </>
  );
}
