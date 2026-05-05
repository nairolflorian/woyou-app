import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VerifyPayment } from "@/components/VerifyPayment";

export default async function ActivatedPage(props: {
  searchParams: Promise<{ session_id?: string; demo?: string }>;
}) {
  const sp = await props.searchParams;
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-3xl font-bold">Profil freigeschaltet!</h1>
          <p className="mt-3 text-[color:var(--color-ink-soft)]">
            {sp.demo
              ? "Demo-Modus: Zahlung wurde simuliert. Dein Profil ist jetzt vermittelbar."
              : "Vielen Dank! Wir prüfen deine Zahlung kurz und schalten dein Profil frei."}
          </p>
          {sp.session_id && <VerifyPayment sessionId={sp.session_id} />}
          <Link href="/profil" className="btn-primary mt-8 inline-flex">
            Zum Dashboard
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
