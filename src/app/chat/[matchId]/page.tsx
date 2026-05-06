import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatBox } from "@/components/ChatBox";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { isAdmin } from "@/lib/auth";

export default async function ChatPage(props: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await props.params;
  const session = await getSession();
  if (!session.userId) redirect("/anmelden");

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      candidate: { include: { user: true } },
      company: { include: { user: true } },
      conversation: { include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!match) notFound();

  const allowed =
    session.userId === match.candidate.userId ||
    session.userId === match.company.userId ||
    isAdmin(session.role);

  if (!allowed) notFound();

  const conv =
    match.conversation ??
    (await prisma.conversation.create({
      data: {
        matchId: match.id,
        candidateId: match.candidateId,
        companyId: match.companyId,
      },
      include: { messages: { include: { sender: true } } },
    }));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-3">
            <a href={isAdmin(session.role) ? "/admin/matching" : session.role === ROLE.COMPANY ? "/firmen/dashboard" : "/profil"} className="text-sm text-[color:var(--color-ink-soft)]">← zurück</a>
          </div>
          <div className="card">
            <div className="flex justify-between items-center pb-3 border-b border-[color:var(--color-border)]">
              <div>
                <div className="font-semibold">
                  {match.candidate.firstName} {match.candidate.lastName} ↔ {match.company.companyName}
                </div>
                <div className="text-xs text-[color:var(--color-ink-soft)]">
                  Verschlüsselte Demo-Konversation · alle Kanäle (E-Mail/Telegram/WhatsApp) sind über die Plattform verbunden
                </div>
              </div>
            </div>
            <ChatBox
              conversationId={conv.id}
              currentUserId={session.userId!}
              initialMessages={(conv.messages ?? []).map((m) => ({
                id: m.id,
                body: m.body,
                channel: m.channel,
                isMine: m.senderId === session.userId,
                senderEmail: m.sender.email ?? m.sender.phone ?? "User",
                createdAt: m.createdAt.toISOString(),
              }))}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
