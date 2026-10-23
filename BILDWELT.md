# Bildwelt Woyou: Vertrauen durch Ehrlichkeit

Grundlage: Konzept „Website neu gedacht: Ehrlichkeit als Verkaufsargument“ (Entwurf v2, 18.10.2026).
Ziel: Wer die Seite sieht, soll denken „die sind seriös und sagen mir die Wahrheit“ – nicht „die versprechen mir einen Traumjob“.

## Die fünf Regeln

1. **Echte Arbeit statt Erfolgspose.** Menschen bei der Arbeit, die sie wirklich machen könnten: Pflege, Gastronomie, Handwerk, Büro, Technik. Kein Jubel, keine Sektgläser, kein „angekommen am Flughafen“.
2. **Fünf Berufe im Wechsel, keiner dominiert.** Auf der Startseite wechseln die Bilder alle 5 Sekunden (bei „Bewegung reduzieren“ steht nur das erste).
3. **Gesichter, Blickkontakt, natürliches Licht.** Vielfältige Menschen, ruhige Farben, keine grellen Filter, keine Montagen.
4. **Das Produkt zeigen, nicht nur Stimmung.** Muster-Lebenslauf und Muster-Anschreiben werden mit genau der Vorlage erzeugt, die Kunden bekommen (erfundene Person, gekennzeichnet als „Muster“). Neu erzeugen (PDFs, Vorschauen 1414x2000 und Design-Vorschauen 1272x1800 als verlustfreies WebP, dazu Social-Preview und Icons): `npx tsx scripts/bilder.ts` (macOS, nutzt Quick Look zum Rastern).
5. **Nichts vortäuschen.** Keine erfundenen Bewertungen, keine Zahlen ohne Beleg („500 Vermittlungen“), keine Siegel, die wir nicht haben, keine Fotos, die als „unsere Kunden“ ausgegeben werden. Stockfotos zeigen Berufe, nicht Kunden.

## Vertrauenselemente auf der Seite

- Faktenleiste unter dem Hero: KarriereKind GmbH Düsseldorf · Server in der EU · Zahlung über Stripe · persönliche Ansprechperson
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
| Hero 1 | Pflegekraft im Kittel im Gespräch mit einer Bewohnerin | photo-1765896387398-1e1ae8d2eb85 |
| Hero 2 | Köchin schneidet Gemüse in der Restaurantküche | photo-1566554273541-37a9ca77b91f |
| Hero 3 | Tischler hobelt in seiner Werkstatt | photo-1687422810663-c316494f725a |
| Hero 4 | Kollegin mit Kopftuch liest Unterlagen am Schreibtisch | photo-1606877096964-c306a05f4d6f |
| Hero 5 | Elektriker mit Helm am Verteiler | photo-1621905251189-08b45d6a269e |
| Realistisch bekommst | Logistik: zwei Kolleginnen im Lager | photo-1664382953403-fc1ac77073a0 |
| Selbstcheck | Gesprächssituation | photo-1573497620053-ea5300f94f21 |
| Social-Preview | Tischler (wie Hero 3) | photo-1687422810663-c316494f725a |

Bildqualität und Datenschutz: Die Fotos liegen selbst unter `public/bilder` (1200x1500 bzw. 1000 px breit, JPEG q85), erzeugt mit `npx tsx scripts/bilder.ts fotos` aus der Liste in `src/lib/fotos.ts` (Ausschnitt per `fit=crop` und Fokuspunkt). next/image verkleinert daraus je Gerät (`quality` 85, Dokumente 90). Besucher laden nichts von Unsplash, die CSP erlaubt keine externen Bilder. Bildnachweis steht im Impressum. Keine erkennbaren Marken oder Firmenlogos im Bild (deshalb 10/2026 Koch mit Logo-Schürze und Handwerker mit Markenbohrer ersetzt).

Ansehen: `https://images.unsplash.com/<Bild-ID>?w=1200`. Originalgröße prüfen: `https://images.unsplash.com/<Bild-ID>?fm=jpg&q=1` laden und Maße ansehen. Austausch zentral in `src/lib/fotos.ts` (danach `npx tsx scripts/bilder.ts fotos og`).

## Nächster Schritt mit der größten Wirkung

**Echte Fotos vom Woyou-Team** (Rachid und die Ansprechpersonen, am Arbeitsplatz, freundlich, kein Studio-Look) für „Über WoYou“ und das Erstgespräch. Ein echtes Gesicht mit Namen schafft mehr Vertrauen als jedes Stockfoto.
