import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function TelegramRegistration() {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "WoYouDemoBot";
  const link = `https://t.me/${botName}`;
  const enabled = !!process.env.TELEGRAM_BOT_TOKEN;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="card">
            <div className="text-5xl">✈️</div>
            <h1 className="mt-3 text-2xl font-bold">Registrierung per Telegram</h1>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              Du kannst dein WoYou-Profil komplett über Telegram anlegen — ohne
              dich auf der Website registrieren zu müssen.
            </p>
            {enabled ? (
              <div className="mt-6 space-y-4">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] text-white font-semibold px-6 py-3 hover:bg-[#1d8cc1]"
                >
                  ✈️ Bot @{botName} öffnen
                </a>
                <ol className="list-decimal ml-5 text-sm text-[color:var(--color-ink-soft)] space-y-1">
                  <li>Klick oben auf den Button — Telegram öffnet sich.</li>
                  <li>Schreib dem Bot <code className="bg-[color:var(--color-surface)] px-1.5 py-0.5 rounded">/start</code>.</li>
                  <li>Beantworte die Fragen — er legt dein Profil an.</li>
                  <li>Anschließend kannst du auf der Website weiter ausfüllen.</li>
                </ol>
              </div>
            ) : (
              <div className="mt-6 card bg-amber-50 border-amber-300">
                <h3 className="font-semibold">Bot ist noch nicht konfiguriert</h3>
                <p className="mt-2 text-sm">
                  Der Telegram-Bot funktioniert bereits — du musst ihn nur einmal
                  einrichten:
                </p>
                <ol className="list-decimal ml-5 text-sm mt-3 space-y-1.5">
                  <li>Öffne in Telegram <a className="text-[color:var(--color-brand)] underline" href="https://t.me/BotFather">@BotFather</a>.</li>
                  <li>Schreib <code className="bg-white px-1 rounded">/newbot</code>, gib einen Anzeigenamen und einen Username (endet auf <code>Bot</code>).</li>
                  <li>Kopiere den Token den BotFather dir gibt.</li>
                  <li>In <code>demo/.env</code> setzen:<br/>
                    <code className="block bg-white p-2 rounded mt-1">TELEGRAM_BOT_TOKEN=&lt;dein-token&gt;<br/>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=&lt;dein-bot-username&gt;</code>
                  </li>
                  <li>Server neu starten — und im README sind 2 Befehle für lokales Polling bzw. Webhook für Produktion.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
