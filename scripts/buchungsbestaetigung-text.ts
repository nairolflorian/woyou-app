/**
 * Schreibt den vollständigen Text der Buchungsbestätigung (deutsch) nach docs/Buchungsbestaetigung_Text.md,
 * damit die Anwältin ihn prüfen kann. Quelle sind dieselben Bausteine wie in der echten Mail (src/lib/bookings.ts).
 *   npx tsx scripts/buchungsbestaetigung-text.ts
 */
import { writeFileSync } from "node:fs";
import { buchungsbestaetigungText, buchungsNummer, datumUhrzeit } from "../src/lib/recht/vertrag";
import { bookingMail } from "../src/lib/werkzeug-text";
import { formatPrice, addMonths } from "../src/lib/angebot";

const t = bookingMail("de");
const gebucht = new Date(2026, 9, 26, 10, 0), bezahlt = new Date(2026, 9, 26, 10, 4);
const b = { id: "beispiel0001a2b3c4d", name: "Fatima Benali", email: "fatima@example.com", amountCents: 19900, toolMonths: 3, createdAt: gebucht, paidAt: bezahlt, waiverAcceptedAt: gebucht, toolBis: addMonths(bezahlt, 3) };
const preis = formatPrice(b.amountCents);
const sign = t.sign;
const paid = buchungsbestaetigungText(b, "paid", [`Betreff: WoYou: ${t.paidSubject}`, t.hello("Fatima"), ...t.paid(preis, 3), `Buchungsnummer: ${buchungsNummer(b.id)}`, sign]);
const requested = buchungsbestaetigungText({ ...b, paidAt: null, toolBis: null }, "requested", [`Betreff: WoYou: ${t.requestedSubject}`, t.hello("Fatima"), ...t.requested(preis), `Buchungsnummer: ${buchungsNummer(b.id)}`, sign]);

const md = `# Buchungsbestätigung WoYou (Text zur Prüfung)

Stand: 26.10.2026. Dieser Text wird automatisch aus denselben Bausteinen erzeugt wie die echte E-Mail
(\`src/lib/bookings.ts\`, \`src/lib/recht/vertrag.ts\`, \`src/lib/recht/agb-text.ts\`, \`src/lib/recht/widerruf-text.ts\`).
Neu erzeugen: \`npx tsx scripts/buchungsbestaetigung-text.ts\`.

Beispieldaten: Fatima Benali, gebucht am ${datumUhrzeit(gebucht)}, bezahlt am ${datumUhrzeit(bezahlt)}.
Bei Kund:innen mit anderer Sprache ist nur der Anfang (Begrüßung bis Gruß) übersetzt, davor steht ein Hinweis in ihrer Sprache,
dass Vertrag, AGB und Widerrufsbelehrung auf Deutsch (Vertragssprache) folgen. Der rechtliche Teil ist immer Deutsch.

Die E-Mail geht in zwei Fällen raus:

1. nach der Zahlung über Stripe (Fall A),
2. bei einer verbindlichen Anfrage, solange noch keine Zahlung über Stripe möglich ist (Fall B).

## Fall A: nach der Zahlung

\`\`\`text
${paid}
\`\`\`

## Fall B: Buchung ohne sofortige Zahlung

\`\`\`text
${requested}
\`\`\`
`;
writeFileSync(new URL("../docs/Buchungsbestaetigung_Text.md", import.meta.url), md);
console.log("docs/Buchungsbestaetigung_Text.md geschrieben");
