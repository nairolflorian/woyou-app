import type { Metadata } from "next";
import "./globals.css";
import { getT } from "@/lib/i18n";
import { DemoModeBar } from "@/components/DemoModeBar";

export const metadata: Metadata = {
  title: "WoYou — Deine Zukunft in Deutschland",
  description:
    "WoYou verbindet internationales Talent mit deutschen Unternehmen. Demo-Plattform.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, isRTL } = await getT();
  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink)]">
        {children}
        <DemoModeBar />
      </body>
    </html>
  );
}
