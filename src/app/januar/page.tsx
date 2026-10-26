import { KampagneSeite, kampagneMetadata } from "@/components/KampagneSeite";

// Kampagne „Spremi se za januar“ (/januar und /spremi-se-za-januar zeigen dieselbe Seite, kanonisch /januar)
export const generateMetadata = () => kampagneMetadata();

export default function Page({ searchParams }: { searchParams: Promise<{ land?: string | string[] }> }) {
  return <KampagneSeite searchParams={searchParams} />;
}
