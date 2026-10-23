// Fotos der Startseite (siehe BILDWELT.md). Alle von Unsplash, freie Unsplash-Lizenz (Namensnennung nicht
// verpflichtend, wir nennen die Fotograf:innen trotzdem im Impressum). Die Dateien liegen unter public/bilder
// und werden selbst ausgeliefert: Besucher laden nichts von Unsplash. Neu erzeugen: npx tsx scripts/bilder.ts fotos
// (lädt den Ausschnitt w x h mit Fokuspunkt fx/fy in hoher Qualität und speichert ihn als JPEG).
export type Foto = {
  datei: string; // public/bilder/<datei>.jpg
  id: string; // Unsplash-Bild-ID (images.unsplash.com/<id>)
  seite: string; // Unsplash-Seite des Fotos
  von: string; // Fotograf:in laut Unsplash
  motiv: string;
  w: number; h: number; fx: number; fy: number;
};

export const FOTOS = {
  pflege: { datei: "pflege", id: "photo-1765896387398-1e1ae8d2eb85", seite: "https://unsplash.com/de/fotos/qW3DLnehg9w", von: "Age Cymru", motiv: "Pflegekraft im Gespräch mit einer Bewohnerin", w: 1200, h: 1500, fx: 0.6, fy: 0.5 },
  gastro: { datei: "gastronomie", id: "photo-1566554273541-37a9ca77b91f", seite: "https://unsplash.com/de/fotos/z-IxdGQ7lPU", von: "Jeff Siepman", motiv: "Köchin in der Restaurantküche", w: 1200, h: 1500, fx: 0.45, fy: 0.45 },
  handwerk: { datei: "handwerk", id: "photo-1687422810663-c316494f725a", seite: "https://unsplash.com/de/fotos/PxlKOcj0a3Q", von: "Ali Mkumbwa", motiv: "Tischler in seiner Werkstatt", w: 1200, h: 1500, fx: 0.55, fy: 0.5 },
  buero: { datei: "buero", id: "photo-1606877096964-c306a05f4d6f", seite: "https://unsplash.com/de/fotos/NAsmdV6dbao", von: "IvanBE pratama", motiv: "Kollegin liest Unterlagen am Schreibtisch", w: 1200, h: 1500, fx: 0.5, fy: 0.7 },
  technik: { datei: "technik", id: "photo-1621905251189-08b45d6a269e", seite: "https://unsplash.com/de/fotos/_2AlIm-F6pw", von: "Emmanuel Ikwuegbu", motiv: "Elektriker mit Helm am Verteiler", w: 1200, h: 1500, fx: 0.4, fy: 0.45 },
  lager: { datei: "logistik", id: "photo-1664382953403-fc1ac77073a0", seite: "https://unsplash.com/de/fotos/ZlOlRnWk8zU", von: "Centre for Ageing Better", motiv: "Zwei Kolleginnen im Lager", w: 1000, h: 1150, fx: 0.4, fy: 0.55 },
  gespraech: { datei: "gespraech", id: "photo-1573497620053-ea5300f94f21", seite: "https://unsplash.com/de/fotos/eF7HN40WbAQ", von: "Christina @ wocintechchat.com", motiv: "Gesprächssituation am Tisch", w: 1000, h: 750, fx: 0.45, fy: 0.5 },
} satisfies Record<string, Foto>;

export const fotoSrc = (f: Foto) => `/bilder/${f.datei}.jpg`;
