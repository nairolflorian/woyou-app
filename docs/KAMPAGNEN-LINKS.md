# Kampagnen-Links Pilot Westbalkan

Stand 26.10.2026. Kampagne „Spremi se za januar“ (Bereit für Januar), Konzept v4.

## Seiten

| Adresse | Inhalt | Sprache beim ersten Besuch |
|---|---|---|
| `/rs`, `/ba`, `/me` | Startseite mit Block zum Land (Westbalkanregelung, Kontingent, bei Serbien Führerschein-Umschreibung), Link zum Selbstcheck mit vorbelegtem Land | Serbisch (lateinisch) |
| `/xk`, `/al`, `/mk` | vorbereitet, gleiche Seite, noindex, nicht in der Sitemap | Englisch (Albanisch und Mazedonisch gibt es nicht) |
| `/in` | vorbereitet, Startseite mit Hinweis Anerkennung und Deutsch, Knöpfe für Englisch, Hindi, Telugu | Englisch |
| `/januar` (auch `/spremi-se-za-januar`) | Kampagnenseite: Kalender, warum Januar mit offiziellen Quellen, ehrliche Grenzen, Selbstcheck und Buchung | Serbisch mit `?land=RS`, `BA`, `ME` oder Quelle `..._rs`, `..._ba`, `..._me`; sonst die aktuelle Sprache |
| `/selbstcheck?land=RS` | Selbstcheck mit vorbelegtem Land (auch `BA`, `ME`, `XK`, `AL`, `MK`, `IN`), optional `&gruppe=ce` (`c`, `bus`, `lager`, `stapler`, `dispo`) | aktuelle Sprache |

Die Sprache wird nur gesetzt, wenn noch keine gewählt ist (Cookie `woyou_locale`). Wer selbst umstellt, behält seine Wahl, auch auf den Länderseiten.

## Links je Land und Kanal

Schema: `https://woyou.de/<land>?utm_source=<kanal>_<land>&utm_campaign=januar`

Kanäle immer klein und gleich schreiben: `fb` (Facebook-Anzeige), `ig` (Instagram), `google` (Google-Anzeige), `viber` (Viber-Kanal oder -Gruppe), `fbgroup` (Beitrag in einer Facebook-Gruppe). Neue Kanäle nach demselben Muster (`tiktok_rs`, `partner-name_rs`).

### Serbien

```
https://woyou.de/rs?utm_source=fb_rs&utm_campaign=januar
https://woyou.de/rs?utm_source=ig_rs&utm_campaign=januar
https://woyou.de/rs?utm_source=google_rs&utm_campaign=januar
https://woyou.de/rs?utm_source=viber_rs&utm_campaign=januar
https://woyou.de/rs?utm_source=fbgroup_rs&utm_campaign=januar
```

### Bosnien und Herzegowina

```
https://woyou.de/ba?utm_source=fb_ba&utm_campaign=januar
https://woyou.de/ba?utm_source=ig_ba&utm_campaign=januar
https://woyou.de/ba?utm_source=google_ba&utm_campaign=januar
https://woyou.de/ba?utm_source=viber_ba&utm_campaign=januar
https://woyou.de/ba?utm_source=fbgroup_ba&utm_campaign=januar
```

### Montenegro

```
https://woyou.de/me?utm_source=fb_me&utm_campaign=januar
https://woyou.de/me?utm_source=ig_me&utm_campaign=januar
https://woyou.de/me?utm_source=google_me&utm_campaign=januar
https://woyou.de/me?utm_source=viber_me&utm_campaign=januar
https://woyou.de/me?utm_source=fbgroup_me&utm_campaign=januar
```

### Direkt auf die Kampagnenseite

Wenn eine Anzeige direkt den Kalender zeigen soll:

```
https://woyou.de/spremi-se-za-januar?land=RS&utm_source=fb_rs&utm_campaign=januar
https://woyou.de/spremi-se-za-januar?land=BA&utm_source=fb_ba&utm_campaign=januar
https://woyou.de/spremi-se-za-januar?land=ME&utm_source=fb_me&utm_campaign=januar
```

### Später (vorbereitet)

Kosovo `xk`, Albanien `al`, Nordmazedonien `mk`, Indien `in` nach demselben Schema, z. B. `https://woyou.de/xk?utm_source=fb_xk&utm_campaign=januar`. Für Indien eine eigene Kampagne statt `januar` (die Westbalkan-Frist gilt dort nicht), z. B. `utm_campaign=start-in`.

## So erscheint es in der Auswertung

- Beim ersten Aufruf merkt sich der Browser die Herkunft für diese Sitzung (sessionStorage `woyou_src`, kein Cookie) als `quelle/kampagne`, z. B. `fb_rs/januar`. Bei der Registrierung wird sie im Konto gespeichert (`signupSource`).
- Länderseite ohne Werbelink (z. B. jemand tippt `woyou.de/rs`): Quelle `land_rs`.
- Länderseite mit Quelle ohne Länderkürzel (`/rs?utm_source=facebook`): das Kürzel wird angehängt, `facebook_rs`.
- Admin, **Marketing**, Kasten „Herkunft der Kund:innen“: drei Tabellen mit Registrierungen, Buchungen, Quote und Umsatz
  - **Land** (aus dem Kürzel am Ende der Quelle: Serbien, Bosnien und Herzegowina, Montenegro ...; alles andere „ohne Land“),
  - **Kanal** (Quelle ohne Land: `fb`, `ig`, `google`, `viber`, `fbgroup`, `land` = direkt auf der Länderseite),
  - **Quelle / Kampagne** (der volle Wert, z. B. `fb_rs/januar`).
- Selbstchecks: Das Ergebnis wird anonym mit der Quelle gespeichert (`fb_rs`), Auswertung je Land und Berufsgruppe im Admin unter **Auswertung**.

## Regeln für Anzeigentexte

Druck nur über offizielle Quellen (Bundesagentur für Arbeit, Deutsche Botschaft). Erlaubt: „Das Kontingent ist begrenzt.“ Nicht erlaubt: „nur noch wenige Plätze“, Countdown, Rabatt, Versprechen, dass es im Januar klappt. Immer nennen: Vorrangprüfung, der Arbeitgeber beantragt und entscheidet. Ab März wechselt das Thema, dann `/januar` aus den Anzeigen nehmen.
