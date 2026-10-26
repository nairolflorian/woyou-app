import { LandSeite, landMetadata } from "@/components/LandSeite";

// Länderseite /xk (Texte und Sprache: src/lib/laender.ts, src/lib/kampagne-text.ts)
export const generateMetadata = () => landMetadata("xk");

export default function Page() {
  return <LandSeite slug="xk" />;
}
