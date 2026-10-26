import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /me (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("me");

export default function Page() {
  return <LandSeite slug="me" />;
}
