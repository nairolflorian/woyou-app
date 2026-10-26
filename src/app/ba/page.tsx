import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /ba (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("ba");

export default function Page() {
  return <LandSeite slug="ba" />;
}
