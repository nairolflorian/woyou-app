import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /mk (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("mk");

export default function Page() {
  return <LandSeite slug="mk" />;
}
