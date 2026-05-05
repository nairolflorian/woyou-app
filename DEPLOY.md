# Online stellen — in 3 Schritten

Diese Anleitung deployt deine WoYou-Demo **kostenlos** auf [Vercel](https://vercel.com) mit einer kostenlosen [Neon](https://neon.tech)-Postgres-Datenbank.

Ergebnis: eine öffentliche URL wie `woyou-demo.vercel.app`, auf der du und andere die Test-Seite (`/demo`) klicken können.

> **Tipp:** Wenn du das Repo erstmal nur mir (oder einem Tester) zugänglich machen willst, kannst du es bei GitHub als „Private" anlegen — Vercel kann auch private Repos deployen.

---

## Voraussetzungen

- GitHub-Account ([github.com](https://github.com), kostenlos)
- Vercel-Account ([vercel.com](https://vercel.com), kostenlos — Login per GitHub)
- Neon-Account ([neon.tech](https://neon.tech), kostenlos — Login per GitHub)

Alle drei sind kostenfrei und brauchen keine Kreditkarte.

---

## Schritt 1 — Code zu GitHub pushen

Im Projekt-Root (also nicht im `demo/`-Ordner, sondern eine Ebene höher):

```bash
cd "/Users/florianhermann/Desktop/woyou App"
git init
git add .
git commit -m "WoYou demo — initial"
gh repo create woyou-demo --public --source . --push
```

Wenn du `gh` noch nicht installiert hast:

```bash
brew install gh
gh auth login    # einmalig durchklicken
```

Alternativ in der GitHub-Oberfläche: **New repository** → Name `woyou-demo` → erstellen → die angezeigten `git remote add` und `git push` Kommandos kopieren.

---

## Schritt 2 — Postgres auf Neon anlegen

1. [neon.tech](https://neon.tech) öffnen → **Sign up with GitHub**.
2. Im Dashboard → **New Project**.
3. Region: **Frankfurt** (am nächsten zu Marokko & Deutschland).
4. Project Name: `woyou-demo`.
5. Erstellen. Du landest auf einem Connection-String, der so aussieht:

   ```
   postgresql://woyou_owner:NPr3X…@ep-cool-meadow.eu-central-1.aws.neon.tech/woyou?sslmode=require
   ```

6. **Diesen String kopieren — du brauchst ihn gleich.**

---

## Schritt 3 — Auf Vercel deployen

1. [vercel.com/new](https://vercel.com/new) öffnen.
2. **Import Git Repository** → dein `woyou-demo` auswählen.
3. **Root Directory** → klick **Edit** → wähle `demo`.
4. **Environment Variables** ausklappen und ergänzen:

   | Name | Wert |
   |---|---|
   | `DATABASE_URL` | (Neon-String aus Schritt 2) |
   | `SESSION_PASSWORD` | irgendein 32+-Zeichen-Random — z.B. mit `openssl rand -hex 32` |
   | `DEMO_MODE` | `true` |
   | `NEXT_PUBLIC_BASE_URL` | wird gleich überschrieben — erstmal `https://woyou-demo.vercel.app` |

   Optional (Bot/Bezahlung): `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`. Leer lassen → Demo-Bypass aktiv.

5. **Deploy** klicken.

Beim ersten Build:
- Vercel installiert die Abhängigkeiten,
- führt `prisma migrate deploy` gegen Neon,
- füllt die Demo-Accounts ein,
- baut Next.js.

Nach ~2 Minuten bekommst du eine URL. **Schick sie mir oder dem Tester** — er kann sofort `/demo` aufrufen und mit einem Klick alle Rollen testen.

---

## Nach dem Deploy

- Die URL ist standardmäßig `<projektname>-<hash>.vercel.app`. Im Vercel-Dashboard kannst du eine eigene Subdomain (`woyou-demo.vercel.app`) oder eine Custom-Domain eintragen.
- Setze die finale URL als `NEXT_PUBLIC_BASE_URL` in den Vercel-Settings → Redeploy.
- Bei jedem Push auf `main` deployt Vercel automatisch neu.

### Demo-Accounts auf Production zurücksetzen

Jedes Deploy ruft `tsx scripts/seed.ts` auf und stellt die 7 Demo-Accounts wieder her. Wenn du das nicht willst (z.B. echte Pilot-Daten), setze `DEMO_MODE=false` in den Vercel-Env-Vars.

### Telegram-Bot scharfschalten

```bash
# einmalig nach erfolgreichem Deploy:
npm run telegram:set-webhook -- https://woyou-demo.vercel.app/api/telegram/webhook
```

(Vorher `TELEGRAM_BOT_TOKEN` in `.env` gesetzt haben — siehe README.)

---

## Andere Hosting-Optionen

Funktioniert genauso auf:
- **Railway** ($5 Probe-Guthaben, dann $5/Monat) — auch Postgres dabei
- **Render** (Web-Service kostenlos mit Sleep nach 15 Min Inaktivität, Postgres-Free-DB läuft 90 Tage)
- **Fly.io** (Pay-as-you-go ab $0)

Wichtig ist nur: Postgres erreichbar machen, `DATABASE_URL` setzen, `npm run vercel-build` als Build-Command nutzen.

---

## Probleme?

| Symptom | Lösung |
|---|---|
| Build bricht mit „Can't reach database" ab | DATABASE_URL fehlt oder Neon ist im „Sleep" — einmal in Neon-UI öffnen, dann redeploy. |
| Test-Seite zeigt „Demo-Modus deaktiviert" | `DEMO_MODE=true` setzen. |
| Login geht aber Session bleibt nicht | `SESSION_PASSWORD` mind. 32 Zeichen lang machen. |
| Stripe-Checkout schlägt fehl | Test-Key benutzen (`sk_test_…`) oder Key leer lassen → Demo-Bypass. |
