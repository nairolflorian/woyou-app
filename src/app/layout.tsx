import type { Metadata } from "next";
import "./globals.css";
import { getDictForClient } from "@/lib/i18n";
import { DemoModeBar } from "@/components/DemoModeBar";
import { CookieBanner } from "@/components/CookieBanner";
import { TranslationProvider } from "@/components/TranslationProvider";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "WoYou — Deine Zukunft in Deutschland",
    template: "%s · WoYou",
  },
  description:
    "WoYou verbindet internationales Talent mit deutschen Unternehmen. Erstelle dein Profil, finde die passende Stelle und starte dein Abenteuer in Deutschland.",
  keywords: [
    "Arbeit Deutschland",
    "Ausbildung",
    "internationale Fachkräfte",
    "Marokko",
    "Vermittlung",
    "Karriere",
  ],
  openGraph: {
    type: "website",
    siteName: "WoYou",
    locale: "de_DE",
    url: BASE_URL,
    title: "WoYou — Deine Zukunft in Deutschland",
    description:
      "Vermittlung internationaler Fachkräfte nach Deutschland — mit Sprachtest, Visa-Unterstützung und persönlicher Begleitung.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WoYou — Deine Zukunft in Deutschland",
    description:
      "Vermittlung internationaler Fachkräfte nach Deutschland.",
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
  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink)]">
        <TranslationProvider dict={dict} locale={locale} isRTL={isRTL}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-[color:var(--color-brand)] focus:text-white focus:px-4 focus:py-2 focus:shadow-lg"
          >
            {dict["a11y.skip"] ?? "Zum Inhalt springen"}
          </a>
          {children}
          <CookieBanner />
          <DemoModeBar />
        </TranslationProvider>
      </body>
    </html>
  );
}
