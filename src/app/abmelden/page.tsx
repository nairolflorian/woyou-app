import crypto from "node:crypto";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { unsubToken } from "@/lib/marketing";

export const metadata = { title: "Abmelden", robots: { index: false } };
export const dynamic = "force-dynamic";

// Abmeldung von Hinweis-Mails per Link (ohne Anmeldung, mit Prüfschlüssel)
export default async function Abmelden(props: { searchParams: Promise<{ u?: string; t?: string }> }) {
  const { u, t } = await props.searchParams;
  let ok = false;
  if (u && t) {
    const a = Buffer.from(unsubToken(u)), b = Buffer.from(String(t));
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) ok = (await prisma.user.updateMany({ where: { id: u }, data: { marketingOptOut: true } })).count > 0;
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">{ok ? "Du bist abgemeldet" : "Link ungültig"}</h1>
          <p className="mt-3 text-[color:var(--color-ink-soft)]">
            {ok ? "Du bekommst keine Hinweis-Mails mehr von uns. Mails zu deinen Bewerbungen (z. B. Kopien und Bestätigungen) schicken wir weiterhin." : `Der Abmeldelink ist nicht gültig. Schreib uns gern an ${COMPANY.email}, dann tragen wir dich aus.`}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
