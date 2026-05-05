import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEMO_ACCOUNTS, DEMO_MODE_ENABLED } from "@/lib/demo-accounts";
import { DemoModeBarClient } from "@/components/DemoModeBarClient";

export async function DemoModeBar() {
  if (!DEMO_MODE_ENABLED) return null;
  const session = await getSession();
  let currentEmail: string | null = null;
  if (session.userId) {
    const u = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });
    currentEmail = u?.email ?? null;
  }
  return (
    <DemoModeBarClient
      accounts={DEMO_ACCOUNTS}
      currentEmail={currentEmail}
    />
  );
}
