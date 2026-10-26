import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /rs (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("rs");

export default function Page() {
  return <LandSeite slug="rs" />;
}
