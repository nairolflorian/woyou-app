import type { Metadata } from "next";
import "./globals.css";
import { getDictForClient } from "@/lib/i18n";
import { DemoModeBar } from "@/components/DemoModeBar";
import { StagingBanner } from "@/components/StagingBanner";
import { CookieBanner } from "@/components/CookieBanner";
import { TranslationProvider } from "@/components/TranslationProvider";
import { UtmCapture } from "@/components/UtmCapture";
import { TrackingConsent } from "@/components/TrackingConsent";
import { trackingIds } from "@/lib/tracking";
import { trackingAn } from "@/lib/tracking-core";
import { consentText } from "@/lib/consent-text";
import { headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "WoYou · Bewerbungsunterlagen und Bewerbungswerkzeug",
    template: "%s · WoYou",
  },
  description:
    "Wir erstellen deine Bewerbungsunterlagen nach deutschem Standard und geben dir ein Werkzeug, mit dem du passende Stellen findest und dich selbst bewirbst. Du entscheidest, wo du dich bewirbst, und bekommst alle Antworten direkt.",
  keywords: [
    "Arbeit Deutschland",
    "Ausbildung",
    "internationale Fachkräfte",
    "Bewerbungsunterlagen",
    "Stellensuche",
    "Lebenslauf deutsch",
    "Bewerbungsservice",
  ],
  openGraph: {
    type: "website",
    siteName: "WoYou",
    locale: "de_DE",
    url: BASE_URL,
    title: "WoYou · Bewerbungsunterlagen und Bewerbungswerkzeug",
    description:
      "Bewerbungsunterlagen nach deutschem Standard und ein Werkzeug, mit dem du dich selbst bewirbst.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WoYou · Bewerbungsunterlagen und Bewerbungswerkzeug",
    description:
      "Bewerbungsunterlagen nach deutschem Standard und ein Werkzeug, mit dem du dich selbst bewirbst.",
  },
  robots: {
    index: process.env.DEMO_MODE === "false",
    follow: process.env.DEMO_MODE === "false",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { dict, locale, isRTL } = await getDictForClient();
  // Tracking nur mit gültiger META_PIXEL_ID oder GOOGLE_TAG_ID; sonst der bisherige Hinweis und keine externen Skripte
  const ids = trackingIds();
  const nonce = trackingAn(ids) ? (await headers()).get("x-nonce") ?? undefined : undefined;
  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink)]">
        <TranslationProvider dict={dict} locale={locale} isRTL={isRTL}>
          <UtmCapture />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-[color:var(--color-brand)] focus:text-white focus:px-4 focus:py-2 focus:shadow-lg"
          >
            {dict["a11y.skip"] ?? "Zum Inhalt springen"}
          </a>
          <StagingBanner />
          {children}
          {trackingAn(ids) ? <TrackingConsent ids={ids} nonce={nonce} text={consentText(locale)} /> : <CookieBanner />}
          <DemoModeBar />
        </TranslationProvider>
      </body>
    </html>
  );
}
