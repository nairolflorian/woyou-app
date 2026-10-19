// Muster-Unterlagen für die Startseite erzeugen (erfundene Person): npx tsx scripts/muster/render.tsx public/muster
import { writeFileSync, mkdirSync } from "node:fs";
import { cvPdf, letterPdf } from "./pdf";
import * as app from "../../src/lib/application";
const ProfileData = ((app as any).ProfileData ?? (app as any).default.ProfileData) as typeof import("../../src/lib/application").ProfileData;

const d = ProfileData.parse({
  firstName: "Yasmin", lastName: "Beispiel", street: "Musterstraße 1", zipCity: "40210 Düsseldorf", country: "Deutschland", phone: "+49 170 0000000", email: "yasmin.beispiel@example.com",
  birthDate: "", nationality: "", targetJob: "Köchin", showPhoto: false,
  summary: "Köchin mit sechs Jahren Erfahrung in Hotelküche und Restaurant. Sauber, schnell im Service und verlässlich im Team.",
  experience: [
    { from: "03/2021", to: "heute", title: "Köchin (Chef de Partie)", place: "Hotel Atlas", city: "Marrakesch, Marokko", details: "Verantwortung für den Posten Saucen und Fleisch\nAnleitung von zwei Auszubildenden\nEinhaltung der HACCP-Vorgaben" },
    { from: "08/2018", to: "02/2021", title: "Jungköchin", place: "Restaurant Le Jardin", city: "Casablanca, Marokko", details: "Vor- und Zubereitung im À-la-carte-Service\nWarenannahme und Lagerkontrolle" },
  ],
  education: [{ from: "09/2016", to: "07/2018", title: "Ausbildung zur Köchin", place: "Institut Spécialisé de Technologie Appliquée Hôtelière", city: "Casablanca, Marokko", details: "" }],
  languages: [{ name: "Deutsch", level: "B1" }, { name: "Französisch", level: "fließend" }, { name: "Arabisch", level: "Muttersprache" }],
  skills: "HACCP\nWarenwirtschaft\nMenüplanung", drivingLicense: "", availableFrom: "sofort",
});
const text = `Sehr geehrte Frau Muster,

hiermit bewerbe ich mich bei Gasthaus Beispiel als Köchin in Düsseldorf.

Zurzeit arbeite ich als Köchin (Chef de Partie) im Hotel Atlas in Marrakesch. Zu meinen Aufgaben gehören der Posten Saucen und Fleisch, die Anleitung von zwei Auszubildenden und die Einhaltung der HACCP-Vorgaben.

Meine Ausbildung habe ich 2018 in Casablanca abgeschlossen. Meine Deutschkenntnisse liegen auf Niveau B1, außerdem spreche ich fließend Französisch.

Ich kann kurzfristig bei Ihnen anfangen. Über eine Einladung zu einem Gespräch, gern auch per Video, freue ich mich.

Mit freundlichen Grüßen
Yasmin Beispiel`;
const out = process.argv[2] || "public/muster";
mkdirSync(out, { recursive: true });
(async () => {
  writeFileSync(`${out}/muster-lebenslauf.pdf`, await cvPdf(d));
  writeFileSync(`${out}/muster-anschreiben.pdf`, await letterPdf(d, ["Gasthaus Beispiel", "z. Hd. Frau Muster", "Beispielweg 5", "40213 Düsseldorf"], "Bewerbung als Köchin", text));
})();
