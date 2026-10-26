import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /al (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("al");

export default function Page() {
  return <LandSeite slug="al" />;
}
