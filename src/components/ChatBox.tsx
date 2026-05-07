"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  channel: string;
  isMine: boolean;
  senderEmail: string;
  createdAt: string;
  attachmentFilename?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
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
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
          attachmentFilename?: string | null;
          attachmentOriginalName?: string | null;
          attachmentMime?: string | null;
          attachmentSize?: number | null;
        }) => ({
          id: m.id,
          body: m.body,
          channel: m.channel,
          isMine: m.senderId === currentUserId,
          senderEmail: m.sender.email ?? m.sender.phone ?? "User",
          createdAt: m.createdAt,
          attachmentFilename: m.attachmentFilename ?? null,
          attachmentOriginalName: m.attachmentOriginalName ?? null,
          attachmentMime: m.attachmentMime ?? null,
          attachmentSize: m.attachmentSize ?? null,
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
    if (!body.trim() && !file) return;
    setBusy(true);
    setErr(null);
    let res: Response;
    if (file) {
      const fd = new FormData();
      fd.append("body", body || "");
      fd.append("channel", channel);
      fd.append("file", file);
      res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        body: fd,
      });
    } else {
      res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, channel }),
      });
    }
    setBusy(false);
    if (res.ok) {
      setBody("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.message ?? d.error ?? "Fehler");
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
                {m.attachmentFilename && (
                  <a
                    href={`/api/chat/${conversationId}/attachment/${m.attachmentFilename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      m.isMine
                        ? "bg-white/20 hover:bg-white/30"
                        : "bg-[color:var(--color-surface)] hover:bg-[color:var(--color-brand-soft)]"
                    }`}
                  >
                    <span aria-hidden="true">📎</span>
                    <span className="truncate">{m.attachmentOriginalName ?? m.attachmentFilename}</span>
                    {m.attachmentSize != null && (
                      <span className="opacity-70 ml-auto">
                        {(m.attachmentSize / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex flex-wrap items-center gap-2">
        <select
          className="select w-[120px] flex-shrink-0"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="PLATFORM">Plattform</option>
          <option value="EMAIL">E-Mail</option>
          <option value="TELEGRAM">Telegram</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
        <input
          className="input flex-1 min-w-[120px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Nachricht…"
        />
        <label
          className="btn-ghost cursor-pointer flex-shrink-0"
          title="Datei anhängen (PDF/JPG/PNG, max. 5 MB)"
        >
          📎
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button className="btn-primary flex-shrink-0" disabled={busy || (!body.trim() && !file)}>
          Senden
        </button>
      </form>
      {file && (
        <div className="mt-2 inline-flex items-center gap-2 text-xs bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] rounded-full px-3 py-1">
          <span>📎 {file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            className="hover:underline"
          >
            ×
          </button>
        </div>
      )}
      {err && (
        <p className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
          {err}
        </p>
      )}
      <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
        Wählt der Empfänger einen anderen Kanal in seinen Einstellungen, wird
        die Nachricht dort zugestellt — du musst dich um nichts kümmern.
      </p>
    </div>
  );
}
