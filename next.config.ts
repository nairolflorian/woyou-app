import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // react-pdf muss als normales Node-Paket geladen werden (nicht im React-Server-Bundle)
  serverExternalPackages: ["@react-pdf/renderer"],
  // WoYou bietet nur noch den Bewerbungs-Service an: frühere Bereiche und die alten .html-Adressen
  // der statischen Seite leiten dauerhaft auf die passende Stelle weiter.
  async redirects() {
    const to = (source: string, destination: string) => ({ source, destination, permanent: true });
    return [
      to("/index.html", "/"),
      to("/leistungen.html", "/#angebot"),
      to("/so-funktioniert.html", "/#ablauf"),
      to("/faq.html", "/#faq"),
      to("/ueber-uns.html", "/#ueber-uns"),
      to("/kontakt.html", "/#kontakt"),
      to("/impressum.html", "/impressum"),
      to("/datenschutz.html", "/datenschutz"),
      to("/bewerber.html", "/"),
      to("/berufe.html", "/"),
      to("/arbeitgeber.html", "/"),
      to("/kontakt", "/#kontakt"),
      to("/ueber-uns", "/#ueber-uns"),
      to("/bewerber", "/"),
      to("/arbeitgeber", "/"),
      to("/arbeitgeber/:path*", "/"),
      to("/firmen/:path*", "/"),
      to("/sprachtest", "/"),
      to("/registrierung/telegram", "/registrierung"),
      to("/registrierung/profil", "/bewerbungsmappe"),
      to("/chat/:path*", "/profil"),
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
