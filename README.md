# WoYou — klickbarer Demo-Prototyp

Eine vollständige Vermittlungsplattform für internationale Fachkräfte (Marokko → Deutschland) im Look von [woyou.de](https://woyou.de).

Dreiseitig:
- **Kandidat:innen** → Onboarding, Sprachtest, Stripe-Bezahlung, Profil-Status, Match-Zustimmung, Chat.
- **Vermittler / Betreiber (Admin)** → Übersicht, Kandidaten- & Firmenverwaltung, Status-Steuerung, Matching-Engine, Aufgaben (Visum etc.), Team-Mitglieder.
- **Unternehmen** → Registrierung mit Stellenanfrage (auch Sonderwunsch), Vorschläge sehen, Feedback geben, Chat.

Multi-Channel-Kommunikation: Plattform-Chat, E-Mail, Telegram (mit echtem Bot), WhatsApp (im Schema vorbereitet).

---

## Schnellstart (lokal)

```bash
cd demo
npm install
npm run db:up           # startet lokales Postgres in Docker (Port 5444)
npm run db:migrate      # legt Tabellen an
npm run db:seed         # füllt 7 Demo-Accounts
npm run dev             # http://localhost:3000
```

Dann öffne **http://localhost:3000/demo** — eine Test-Seite, auf der du mit einem Klick zwischen allen Rollen wechseln kannst.

➡ **Online stellen?** Siehe [DEPLOY.md](./DEPLOY.md) — Vercel + Neon Postgres in 3 Schritten, kostenlos.

Demo-Logins (Passwort für alle: **`woyou1234`**):

| Rolle | E-Mail |
|---|---|
| Super-Admin | `admin@woyou.demo` |
| Vermittler | `vermittler@woyou.demo` |
| Firma A (Klinik) | `hr@klinik-berlin.demo` |
| Firma B (Hotel) | `jobs@hotel-alpenhof.demo` |
| Kandidatin (vermittelbar) | `fatima@example.com` |
| Kandidat (Einzel-Consent) | `youssef@example.com` |
| Kandidatin (Profil unvollständig) | `aicha@example.com` |

---

## End-to-End-Flow zum Klicken

Für einen geführten Durchlauf nutze **`/demo`** (Test-Seite mit Rollen-Switcher) oder die schwebende Demo-Leiste unten rechts auf jeder Seite.

1. **Landing** öffnen, Sprache wechseln (DE/EN/FR/AR mit RTL).
2. **Registrierung** → E-Mail/Telefon → mehrstufiger Profil-Wizard.
3. **Sprachtest** machen → Niveau wird automatisch ins Profil übernommen.
4. **Profil freischalten** → Stripe-Checkout (oder Demo-Bypass — siehe „Stripe").
5. Als **Admin** einloggen → Matching → einen Top-Kandidaten der Klinik vorschlagen.
6. Als **Kandidat** einloggen → unter „Deine Zustimmung wird gebraucht" annehmen.
7. Als **Firma** einloggen → „Interesse zeigen" → Chat öffnet automatisch.
8. Im Chat Nachrichten austauschen (Kanal wählen: Plattform / E-Mail / Telegram / WhatsApp).
9. Firma → „Eingestellt markieren" → Kandidat-Status springt auf `PLACED`, Visum-Aufgabe wird im Admin-Dashboard erzeugt.

---

## Status-Modell des Kandidaten

`REGISTERED` (nur Kontaktweg da) → `INCOMPLETE` (Profil teilweise) → `COMPLETE` (Profil zu 100 %) → `PAID_PLACEABLE` (Gebühr bezahlt = vermittelbar) → `PROPOSED` (mind. einmal vorgeschlagen) → `PLACED`.

Der Status wird automatisch hergeleitet (`src/lib/candidate.ts`), kann aber im Admin manuell überschrieben werden.

---

## Stripe (Testmodus)

Die Profil-Freischaltung kostet **49 €** (in `src/lib/config.ts` jederzeit änderbar — woyou.de selbst gibt für Bewerber „kostenlos" an, daher ist das ein Demo-Default).

Drei Optionen:

| Modus | Ergebnis |
|---|---|
| `STRIPE_SECRET_KEY` leer (Default) | „Demo-Bypass" — Klick aufs Freischalten → Status sofort `PAID_PLACEABLE`. Kein echter Geldfluss. |
| Stripe **Test-Key** in `.env` | Echte Stripe-Checkout-Seite. Karte `4242 4242 4242 4242`, beliebiges Datum/CVC. Webhook braucht es nicht — die Erfolgsseite ruft `/api/payments/verify` und prüft die Session. |
| Stripe **Live-Key** | Bitte erst klären (rechtlich, Domain, Webhook). |

```env
STRIPE_SECRET_KEY=sk_test_…
STRIPE_PUBLISHABLE_KEY=pk_test_…
```

---

## Telegram-Bot

Der Bot ist **echt und kostenfrei**. So aktivierst du ihn in 3 Minuten:

1. In Telegram **@BotFather** öffnen → `/newbot` → Anzeigename → Username (muss auf `Bot` enden).
2. BotFather gibt dir einen **Token**. Kopiere ihn.
3. In `demo/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC-…
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=DeinWoYouBot
   ```
4. Lokal entwickeln (Long-Polling, kein öffentlicher Server nötig):
   ```bash
   npm run telegram:dev
   ```
   Dann im Telegram dem Bot `/start` senden → Du läufst durch den Mini-Wizard und ein Account wird angelegt.
5. In Produktion (Webhook):
   ```bash
   npm run telegram:set-webhook -- https://deine-domain.de/api/telegram/webhook
   ```

Bot-Befehle: `/start`, `/status`, `/profil`, `/hilfe`.

WhatsApp ist im Datenmodell vorgesehen, aber nicht aktiv (WhatsApp Business API ist kostenpflichtig). Für Phase 2.

---

## Sprachen

Aktuell vier Sprachen mit eigener Übersetzung: **Deutsch, Englisch, Französisch, Arabisch** (mit RTL). Wechsel über das Sprachmenü oben rechts. Fehlende Strings fallen auf Deutsch zurück. Weitere Sprachen aus woyou.de (ES, RU, UK) lassen sich durch eine zusätzliche Datei in `src/i18n/` ergänzen.

---

## Architektur

- **Next.js 16** (App Router, Server Components, Turbopack)
- **TailwindCSS 4** + woyou-Farbpalette (`#6F9EAB` Petrol als Primärfarbe, Segoe UI)
- **Prisma 6 + SQLite** — kein Setup nötig, alles lokal
- **iron-session** für Cookie-basierte Auth (Mehrfach-Rollen: Kandidat, Firma, Admin, Super-Admin)
- **Stripe** im Testmodus (oder Demo-Bypass)
- **grammy** als Telegram-Bot-Framework
- **Zod** für API-Validierung

Wichtige Pfade:
- `src/app/page.tsx` — Landing
- `src/app/registrierung/profil` — Profil-Wizard (6 Schritte)
- `src/app/sprachtest` — Sprachtest A1–B2
- `src/app/profil` — Kandidaten-Dashboard mit Pay-to-Unlock
- `src/app/firmen/dashboard` — Unternehmens-Dashboard
- `src/app/admin/*` — Admin-Backend (Übersicht / Kandidaten / Firmen / Anfragen / Matching / Aufgaben / Team)
- `src/app/chat/[matchId]` — Plattform-Chat
- `src/lib/matching.ts` — Erklärbares Scoring (0–100, Begründung sichtbar)
- `src/lib/telegram-bot.ts` — Bot-Logik

---

## Was fehlt vs. „nicht-Demo"

Bewusst nicht in der Demo:
- Echte OAuth (Google/Facebook/Telegram-Login) — Buttons sind sichtbar, aber inaktiv (Phase 2 = Provider-Setup).
- WhatsApp-Versand (kostenpflichtige API).
- Echte E-Mail-Zustellung — Modell ist da, Versand kann mit Resend (kostenlos bis 3000/Monat) in 10 Minuten ergänzt werden.
- Datei-Upload (Lebenslauf/Pass) — Schema-Feld `documents` ist vorbereitet.
- Verschlüsselung der Chat-Nachrichten — UI tut so, als ob, im Backend ist es noch Klartext.
- Stripe-Webhooks (würde ich in Produktion hinzufügen).

Diese sind alle additiv — niemand muss am Schema schrauben, um sie nachzurüsten.

---

## Tipps zum Entwickeln

```bash
npm run db:studio    # Prisma-Studio für die DB im Browser
npm run telegram:dev # Bot lokal mit Long-Polling testen
npm run build        # Produktions-Build (für Vercel etc.)
```

Bei Schema-Änderungen:
```bash
npm run db:migrate -- --name kurz_beschreibung
```
