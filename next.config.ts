import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // react-pdf muss als normales Node-Paket geladen werden (nicht im React-Server-Bundle)
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
