"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  channel: string;
  isMine: boolean;
  senderEmail: string;
  createdAt: string;
};

const CHANNEL_BADGE: Record<string, string> = {
  PLATFORM: "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]",
  EMAIL: "bg-amber-100 text-amber-800",
  TELEGRAM: "bg-[#229ED9]/15 text-[#1d8cc1]",
  WHATSAPP: "bg-emerald-100 text-emerald-800",
};

export function ChatBox({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("PLATFORM");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function refresh() {
    const r = await fetch(`/api/chat/${conversationId}/messages`);
    const d = await r.json();
    if (d.ok) {
      setMessages(
        d.messages.map((m: {
          id: string; body: string; channel: string;
          senderId: string; createdAt: string;
          sender: { email?: string; phone?: string };
        }) => ({
          id: m.id,
          body: m.body,
          channel: m.channel,
          isMine: m.senderId === currentUserId,
          senderEmail: m.sender.email ?? m.sender.phone ?? "User",
          createdAt: m.createdAt,
        }))
      );
    }
  }

  useEffect(() => {
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, channel }),
    });
    setBusy(false);
    if (res.ok) {
      setBody("");
      await refresh();
    }
  }

  return (
    <div className="mt-4">
      <div className="space-y-3 max-h-[55vh] overflow-y-auto p-3 bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[color:var(--color-ink-soft)] py-8">
            Noch keine Nachrichten. Schick die erste 👋
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.isMine ? "items-end text-right" : ""}`}>
              <div className="text-[10px] text-[color:var(--color-ink-soft)] mb-1">
                {!m.isMine && <span>{m.senderEmail} · </span>}
                <span className={`badge ${CHANNEL_BADGE[m.channel] ?? ""}`}>{m.channel}</span>
                <span className="ml-1">{new Date(m.createdAt).toLocaleString("de-DE")}</span>
              </div>
              <div
                className={`inline-block rounded-2xl px-4 py-2 text-sm ${
                  m.isMine
                    ? "bg-[color:var(--color-brand)] text-white"
                    : "bg-white border border-[color:var(--color-border)]"
                }`}
              >
                {m.body}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <select className="select max-w-[140px]" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="PLATFORM">Plattform</option>
          <option value="EMAIL">E-Mail</option>
          <option value="TELEGRAM">Telegram</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
        <input
          className="input flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Nachricht…"
        />
        <button className="btn-primary" disabled={busy || !body.trim()}>
          Senden
        </button>
      </form>
      <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
        Wählt der Empfänger einen anderen Kanal in seinen Einstellungen, wird
        die Nachricht dort zugestellt — du musst dich um nichts kümmern.
      </p>
    </div>
  );
}
