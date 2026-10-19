# Bildwelt Woyou: Vertrauen durch Ehrlichkeit

Grundlage: Konzept „Website neu gedacht: Ehrlichkeit als Verkaufsargument“ (Entwurf v2, 18.10.2026).
Ziel: Wer die Seite sieht, soll denken „die sind seriös und sagen mir die Wahrheit“ – nicht „die versprechen mir einen Traumjob“.

## Die fünf Regeln

1. **Echte Arbeit statt Erfolgspose.** Menschen bei der Arbeit, die sie wirklich machen könnten: Pflege, Gastronomie, Handwerk, Büro, Technik. Kein Jubel, keine Sektgläser, kein „angekommen am Flughafen“.
2. **Fünf Berufe im Wechsel, keiner dominiert.** Auf der Startseite wechseln die Bilder alle 5 Sekunden (bei „Bewegung reduzieren“ steht nur das erste).
3. **Gesichter, Blickkontakt, natürliches Licht.** Vielfältige Menschen, ruhige Farben, keine grellen Filter, keine Montagen.
4. **Das Produkt zeigen, nicht nur Stimmung.** Muster-Lebenslauf und Muster-Anschreiben werden mit genau der Vorlage erzeugt, die Kunden bekommen (erfundene Person, gekennzeichnet als „Muster“). Neu erzeugen: `npx tsx scripts/muster/render.tsx public/muster`, danach PNG mit `sips -s format png -Z 1000 …`.
5. **Nichts vortäuschen.** Keine erfundenen Bewertungen, keine Zahlen ohne Beleg („500 Vermittlungen“), keine Siegel, die wir nicht haben, keine Fotos, die als „unsere Kunden“ ausgegeben werden. Stockfotos zeigen Berufe, nicht Kunden.

## Vertrauenselemente auf der Seite

- Faktenleiste unter dem Hero: KarriereKind GmbH Düsseldorf · Server in Deutschland · Zahlung über Stripe · persönliche Ansprechperson
- Grüne Zeile unter dem Knopf: Keine Vermittlung · Keine Garantie · Keine versteckten Kosten
- „Bitte beachte“ in Gelb, gleich groß wie die Preiskarte
- „Das machen wir“ (grün) neben „Das machen wir nicht“ (grau), gleich groß
- Impressum mit Handelsregister im Kontaktblock

## Farben

| Zweck | Wert |
|---|---|
| Petrol dunkel (Knöpfe, Zahlen, Überschriften) | `#3e6f7e` |
| Petrol hell (Marke, Flächen) | `#6F9EAB` |
| Bitte beachte (Rahmen/Fläche) | `#b58a1b` / `#fbf3e1` |
| Das machen wir | Grün `emerald` |
| Das machen wir nicht | Grau `slate` |

## Fotos (Unsplash-Lizenz: kostenlos, auch kommerziell, ohne Namensnennung)

| Einsatz | Motiv | Bild-ID |
|---|---|---|
| Hero 1 | Pflegekraft mit älterer Dame | photo-1765896387387-0538bc9f997e |
| Hero 2 | Koch in der Küche | photo-1577219491135-ce391730fb2c |
| Hero 3 | Handwerker mit Bohrmaschine | photo-1646640381839-02748ae8ddf0 |
| Hero 4 | Kollegin im Büro | photo-1758876202618-7197443c717f |
| Hero 5 | Elektriker mit Helm | photo-1621905251189-08b45d6a269e |
| Realistisch bekommst | Logistik: zwei Kolleginnen im Lager | photo-1664382953403-fc1ac77073a0 |
| Selbstcheck | Gesprächssituation | photo-1573497620053-ea5300f94f21 |

Ansehen: `https://images.unsplash.com/<Bild-ID>?w=1200`. Austausch zentral in `src/lib/landing-copy.ts` (IMAGES).

## Nächster Schritt mit der größten Wirkung

**Echte Fotos vom Woyou-Team** (Rachid und die Ansprechpersonen, am Arbeitsplatz, freundlich, kein Studio-Look) für „Über WoYou“ und das Erstgespräch. Ein echtes Gesicht mit Namen schafft mehr Vertrauen als jedes Stockfoto.
