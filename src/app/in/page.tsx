import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /in (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("in");

export default function Page() {
  return <LandSeite slug="in" />;
}
