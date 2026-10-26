# Buchungsbestätigung WoYou (Text zur Prüfung)

Stand: 26.10.2026. Dieser Text wird automatisch aus denselben Bausteinen erzeugt wie die echte E-Mail
(`src/lib/bookings.ts`, `src/lib/recht/vertrag.ts`, `src/lib/recht/agb-text.ts`, `src/lib/recht/widerruf-text.ts`).
Neu erzeugen: `npx tsx scripts/buchungsbestaetigung-text.ts`.

Beispieldaten: Fatima Benali, gebucht am 26.10.2026, 10:00 Uhr, bezahlt am 26.10.2026, 10:04 Uhr.
Bei Kund:innen mit anderer Sprache ist nur der Anfang (Begrüßung bis Gruß) übersetzt, davor steht ein Hinweis in ihrer Sprache,
dass Vertrag, AGB und Widerrufsbelehrung auf Deutsch (Vertragssprache) folgen. Der rechtliche Teil ist immer Deutsch.

Die E-Mail geht in zwei Fällen raus:

1. nach der Zahlung über Stripe (Fall A),
2. bei einer verbindlichen Anfrage, solange noch keine Zahlung über Stripe möglich ist (Fall B).

## Fall A: nach der Zahlung

```text
Betreff: WoYou: Deine Buchung ist bestätigt

Hallo Fatima,

vielen Dank! Deine Zahlung über 199 € für das Startpaket ist bei uns eingegangen.

Dein Bewerbungswerkzeug ist für 3 Monate freigeschaltet. Fang am besten mit deiner Bewerbungsmappe an: Lebenslauf hochladen oder Angaben ausfüllen. Wir prüfen alles und sagen dir Bescheid, wenn deine Unterlagen fertig sind.

Buchungsnummer: WY-1A2B3C4D

Viele Grüße
Dein WoYou-Team

DEINE BUCHUNG (VERTRAGSINHALT)

Mit dieser E-Mail bestätigen wir deine Buchung. Der Vertrag ist damit zustande gekommen.
Buchungsnummer: WY-1A2B3C4D
Vertragspartner: KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, vertreten durch den Geschäftsführer Rachid Debdoubi, Amtsgericht Düsseldorf, HRB 99139. Kontakt: service@karrierekind.de, Telefon +49 211 913 829 10.
Kund:in: Fatima Benali, fatima@example.com
Gebucht am: 26.10.2026, 10:00 Uhr. Bezahlt am: 26.10.2026, 10:04 Uhr
Paket: Startpaket: Bewerbungsunterlagen und 3 Monate Bewerbungswerkzeug
Preis: 199 € inkl. USt, einmalig. Keine weiteren Kosten, kein Abo, keine Verlängerung.
Enthalten: Lebenslauf und Anschreiben-Vorlage nach deutschem Standard. Unser Team prüft deine Bewerbungsmappe und gibt sie frei. Dazu 3 Monate Zugang zum Bewerbungswerkzeug (Stellensuche, Anschreiben je Stelle, eigene Übersicht deiner Bewerbungen). Du bewirbst dich selbst; wir vermitteln keine Stellen.
Lieferzeit: Deine Unterlagen sind fertig innerhalb von 5 Werktagen, nachdem du die vollständige Mappe eingereicht hast.
Laufzeit des Werkzeugs: 3 Monate ab Zahlungseingang, also bis 26.01.2027. Danach endet der Zugang automatisch, du musst nichts kündigen. Deine Unterlagen kannst du weiter herunterladen.
Vertragssprache: Deutsch. Den Vertragstext speichern wir. Diese E-Mail enthält den Vertragstext, unsere AGB und die Widerrufsbelehrung mit Muster-Widerrufsformular.

BESTÄTIGUNG: BEGINN VOR ABLAUF DER WIDERRUFSFRIST

Du hast bei der Buchung am 26.10.2026, 10:00 Uhr ausdrücklich verlangt, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen und das Bewerbungswerkzeug sofort freischalten. Du hast dabei bestätigt, dass dir bekannt ist, dass du bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahlst und dass dein Widerrufsrecht erlischt, sobald wir die Leistung vollständig erbracht haben.

WIDERRUF ONLINE

Du kannst innerhalb der Widerrufsfrist auch online widerrufen, ohne Anmeldung: https://woyou.de/vertrag-widerrufen (Knopf „Vertrag widerrufen“ unten auf jeder Seite).

ALLGEMEINE GESCHÄFTSBEDINGUNGEN

Allgemeine Geschäftsbedingungen

§ 1 Anbieter und Geltungsbereich
Anbieter ist die KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, vertreten durch den Geschäftsführer Rachid Debdoubi, eingetragen beim Amtsgericht Düsseldorf unter HRB 99139. Kontakt: service@karrierekind.de. Diese AGB gelten für das Angebot „Bewerbungsunterlagen plus Bewerbungswerkzeug“ von WoYou, das Verbraucher:innen über woyou.de buchen.

§ 2 Leistung
Wir erstellen mit dir Bewerbungsunterlagen nach deutschem Standard: einen Lebenslauf und eine Anschreiben-Vorlage, die wir prüfen und bei Bedarf korrigieren. Dazu bekommst du für die gebuchte Zeit Zugang zum Bewerbungswerkzeug: eine Stellensuche über öffentliche Stellenbörsen, ein Anschreiben für jede Stelle, die du dort selbst auswählst, und eine eigene Übersicht deiner Bewerbungen. Du suchst und wählst die Stellen selbst aus, verschickst deine Bewerbungen selbst und bekommst alle Antworten direkt. Wir vermitteln keine Arbeitsstellen, haben keinen Kontakt zu Arbeitgebern und verschicken keine Bewerbungen. Wir schulden die sorgfältige Erstellung der Unterlagen und die Bereitstellung des Werkzeugs, nicht eine Einladung oder einen Arbeitsvertrag.

§ 3 Ablauf und Mitwirkung
Mit dem Klick auf „Zahlungspflichtig buchen“ buchst du verbindlich. Der Vertrag kommt mit unserer Buchungsbestätigung per E-Mail zustande. Vor dem Klick kannst du deine Angaben auf der Bestellseite prüfen und ändern. Den Vertragstext speichern wir und schicken ihn dir mit AGB und Widerrufsbelehrung in der Buchungsbestätigung. Der Vertrag wird auf Deutsch geschlossen. Nach der Buchung füllst du deine Bewerbungsmappe aus oder lädst deinen eigenen Lebenslauf hoch. Wir prüfen die Mappe und geben sie frei, sobald deine Unterlagen fertig sind. Deine Angaben müssen wahr und vollständig sein. Anschreiben aus dem Werkzeug sind Vorschläge auf Grundlage deiner Angaben und der Stellenanzeige. Bitte prüfe jedes Anschreiben, bevor du es verwendest. Die Stellenanzeigen stammen von Dritten; für ihren Inhalt und ihre Aktualität sind die jeweiligen Anbieter verantwortlich.

§ 4 Laufzeit des Werkzeugs
Das Startpaket enthält 3 Monate Zugang zum Bewerbungswerkzeug ab Zahlungseingang. Danach endet der Zugang automatisch, ohne dass du kündigen musst. Eine Verlängerung oder ein Abo bieten wir nicht an. Nach Ablauf sind Stellensuche und deine Übersicht „Meine Bewerbungen“ gesperrt. Deine Unterlagen (Lebenslauf, Anschreiben-Vorlage) und die Anschreiben, die du zu deinen Stellen erstellt hast, kannst du auch danach als PDF herunterladen.

§ 5 Preis und Zahlung
Das Startpaket kostet einmalig 199 € inklusive Umsatzsteuer. Weitere Kosten entstehen nicht, es gibt keine wiederkehrenden Zahlungen. Die Zahlung erfolgt online über Stripe.

§ 6 Widerrufsrecht
Als Verbraucher:in hast du ein Widerrufsrecht von 14 Tagen ab Vertragsschluss. Verlangst du ausdrücklich, dass wir vor Ablauf der Frist beginnen, musst du im Fall des Widerrufs einen anteiligen Betrag für die bis dahin erbrachten Leistungen zahlen. Das Widerrufsrecht erlischt, wenn wir die Leistung vollständig erbracht haben. Die ausführliche Widerrufsbelehrung erhältst du mit der Buchungsbestätigung.

§ 7 Haftung
Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten, also von Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst, und begrenzt auf den vorhersehbaren, typischen Schaden. Die Haftung nach dem Produkthaftungsgesetz und deine gesetzlichen Gewährleistungsrechte bleiben unberührt.

§ 8 Datenschutz
Es gilt unsere Datenschutzerklärung. Dort steht auch, welche Angaben wir zur Kundenbetreuung und Abrechnung an das interne CRM der EuBiA-Gruppe übermitteln (Abschnitt 5).

§ 9 Schlussbestimmungen
Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates bleiben unberührt.

WIDERRUFSBELEHRUNG UND MUSTER-WIDERRUFSFORMULAR

Widerrufsbelehrung

Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, Telefon: +49 211 913 829 10, E-Mail: info@karrierekind.de) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
Sie können das Muster-Widerrufsformular oder eine andere eindeutige Erklärung auch auf unserer Webseite (https://woyou.de/vertrag-widerrufen) elektronisch ausfüllen und übermitteln. Machen Sie von dieser Möglichkeit Gebrauch, so werden wir Ihnen unverzüglich (z. B. per E-Mail) eine Bestätigung über den Eingang eines solchen Widerrufs übermitteln.
Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.

Ende der Widerrufsbelehrung

Muster-Widerrufsformular
(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)
- An KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, E-Mail: info@karrierekind.de:
- Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
- Bestellt am (*)/erhalten am (*)
- Name des/der Verbraucher(s)
- Anschrift des/der Verbraucher(s)
- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
- Datum
(*) Unzutreffendes streichen.
```

## Fall B: Buchung ohne sofortige Zahlung

```text
Betreff: WoYou: Wir haben deine Anfrage erhalten

Hallo Fatima,

danke für deine Anfrage zum Startpaket (199 €).

Wir melden uns in den nächsten 2 Werktagen und schicken dir den Link zur Zahlung. Mit deiner Bewerbungsmappe kannst du schon anfangen.

Buchungsnummer: WY-1A2B3C4D

Viele Grüße
Dein WoYou-Team

DEINE BUCHUNG (VERTRAGSINHALT)

Mit dieser E-Mail bestätigen wir deine Buchung. Der Vertrag ist damit zustande gekommen. Den Link zur Zahlung schicken wir dir gesondert; das Bewerbungswerkzeug schalten wir nach Zahlungseingang frei.
Buchungsnummer: WY-1A2B3C4D
Vertragspartner: KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, vertreten durch den Geschäftsführer Rachid Debdoubi, Amtsgericht Düsseldorf, HRB 99139. Kontakt: service@karrierekind.de, Telefon +49 211 913 829 10.
Kund:in: Fatima Benali, fatima@example.com
Gebucht am: 26.10.2026, 10:00 Uhr
Paket: Startpaket: Bewerbungsunterlagen und 3 Monate Bewerbungswerkzeug
Preis: 199 € inkl. USt, einmalig. Keine weiteren Kosten, kein Abo, keine Verlängerung.
Enthalten: Lebenslauf und Anschreiben-Vorlage nach deutschem Standard. Unser Team prüft deine Bewerbungsmappe und gibt sie frei. Dazu 3 Monate Zugang zum Bewerbungswerkzeug (Stellensuche, Anschreiben je Stelle, eigene Übersicht deiner Bewerbungen). Du bewirbst dich selbst; wir vermitteln keine Stellen.
Lieferzeit: Deine Unterlagen sind fertig innerhalb von 5 Werktagen, nachdem du die vollständige Mappe eingereicht hast.
Laufzeit des Werkzeugs: 3 Monate ab Zahlungseingang. Danach endet der Zugang automatisch, du musst nichts kündigen. Deine Unterlagen kannst du weiter herunterladen.
Vertragssprache: Deutsch. Den Vertragstext speichern wir. Diese E-Mail enthält den Vertragstext, unsere AGB und die Widerrufsbelehrung mit Muster-Widerrufsformular.

BESTÄTIGUNG: BEGINN VOR ABLAUF DER WIDERRUFSFRIST

Du hast bei der Buchung am 26.10.2026, 10:00 Uhr ausdrücklich verlangt, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen und das Bewerbungswerkzeug sofort freischalten. Du hast dabei bestätigt, dass dir bekannt ist, dass du bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahlst und dass dein Widerrufsrecht erlischt, sobald wir die Leistung vollständig erbracht haben.

WIDERRUF ONLINE

Du kannst innerhalb der Widerrufsfrist auch online widerrufen, ohne Anmeldung: https://woyou.de/vertrag-widerrufen (Knopf „Vertrag widerrufen“ unten auf jeder Seite).

ALLGEMEINE GESCHÄFTSBEDINGUNGEN

Allgemeine Geschäftsbedingungen

§ 1 Anbieter und Geltungsbereich
Anbieter ist die KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, vertreten durch den Geschäftsführer Rachid Debdoubi, eingetragen beim Amtsgericht Düsseldorf unter HRB 99139. Kontakt: service@karrierekind.de. Diese AGB gelten für das Angebot „Bewerbungsunterlagen plus Bewerbungswerkzeug“ von WoYou, das Verbraucher:innen über woyou.de buchen.

§ 2 Leistung
Wir erstellen mit dir Bewerbungsunterlagen nach deutschem Standard: einen Lebenslauf und eine Anschreiben-Vorlage, die wir prüfen und bei Bedarf korrigieren. Dazu bekommst du für die gebuchte Zeit Zugang zum Bewerbungswerkzeug: eine Stellensuche über öffentliche Stellenbörsen, ein Anschreiben für jede Stelle, die du dort selbst auswählst, und eine eigene Übersicht deiner Bewerbungen. Du suchst und wählst die Stellen selbst aus, verschickst deine Bewerbungen selbst und bekommst alle Antworten direkt. Wir vermitteln keine Arbeitsstellen, haben keinen Kontakt zu Arbeitgebern und verschicken keine Bewerbungen. Wir schulden die sorgfältige Erstellung der Unterlagen und die Bereitstellung des Werkzeugs, nicht eine Einladung oder einen Arbeitsvertrag.

§ 3 Ablauf und Mitwirkung
Mit dem Klick auf „Zahlungspflichtig buchen“ buchst du verbindlich. Der Vertrag kommt mit unserer Buchungsbestätigung per E-Mail zustande. Vor dem Klick kannst du deine Angaben auf der Bestellseite prüfen und ändern. Den Vertragstext speichern wir und schicken ihn dir mit AGB und Widerrufsbelehrung in der Buchungsbestätigung. Der Vertrag wird auf Deutsch geschlossen. Nach der Buchung füllst du deine Bewerbungsmappe aus oder lädst deinen eigenen Lebenslauf hoch. Wir prüfen die Mappe und geben sie frei, sobald deine Unterlagen fertig sind. Deine Angaben müssen wahr und vollständig sein. Anschreiben aus dem Werkzeug sind Vorschläge auf Grundlage deiner Angaben und der Stellenanzeige. Bitte prüfe jedes Anschreiben, bevor du es verwendest. Die Stellenanzeigen stammen von Dritten; für ihren Inhalt und ihre Aktualität sind die jeweiligen Anbieter verantwortlich.

§ 4 Laufzeit des Werkzeugs
Das Startpaket enthält 3 Monate Zugang zum Bewerbungswerkzeug ab Zahlungseingang. Danach endet der Zugang automatisch, ohne dass du kündigen musst. Eine Verlängerung oder ein Abo bieten wir nicht an. Nach Ablauf sind Stellensuche und deine Übersicht „Meine Bewerbungen“ gesperrt. Deine Unterlagen (Lebenslauf, Anschreiben-Vorlage) und die Anschreiben, die du zu deinen Stellen erstellt hast, kannst du auch danach als PDF herunterladen.

§ 5 Preis und Zahlung
Das Startpaket kostet einmalig 199 € inklusive Umsatzsteuer. Weitere Kosten entstehen nicht, es gibt keine wiederkehrenden Zahlungen. Die Zahlung erfolgt online über Stripe.

§ 6 Widerrufsrecht
Als Verbraucher:in hast du ein Widerrufsrecht von 14 Tagen ab Vertragsschluss. Verlangst du ausdrücklich, dass wir vor Ablauf der Frist beginnen, musst du im Fall des Widerrufs einen anteiligen Betrag für die bis dahin erbrachten Leistungen zahlen. Das Widerrufsrecht erlischt, wenn wir die Leistung vollständig erbracht haben. Die ausführliche Widerrufsbelehrung erhältst du mit der Buchungsbestätigung.

§ 7 Haftung
Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten, also von Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst, und begrenzt auf den vorhersehbaren, typischen Schaden. Die Haftung nach dem Produkthaftungsgesetz und deine gesetzlichen Gewährleistungsrechte bleiben unberührt.

§ 8 Datenschutz
Es gilt unsere Datenschutzerklärung. Dort steht auch, welche Angaben wir zur Kundenbetreuung und Abrechnung an das interne CRM der EuBiA-Gruppe übermitteln (Abschnitt 5).

§ 9 Schlussbestimmungen
Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates bleiben unberührt.

WIDERRUFSBELEHRUNG UND MUSTER-WIDERRUFSFORMULAR

Widerrufsbelehrung

Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, Telefon: +49 211 913 829 10, E-Mail: info@karrierekind.de) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
Sie können das Muster-Widerrufsformular oder eine andere eindeutige Erklärung auch auf unserer Webseite (https://woyou.de/vertrag-widerrufen) elektronisch ausfüllen und übermitteln. Machen Sie von dieser Möglichkeit Gebrauch, so werden wir Ihnen unverzüglich (z. B. per E-Mail) eine Bestätigung über den Eingang eines solchen Widerrufs übermitteln.
Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.

Ende der Widerrufsbelehrung

Muster-Widerrufsformular
(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)
- An KarriereKind GmbH, Berliner Allee 51, 40212 Düsseldorf, E-Mail: info@karrierekind.de:
- Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
- Bestellt am (*)/erhalten am (*)
- Name des/der Verbraucher(s)
- Anschrift des/der Verbraucher(s)
- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
- Datum
(*) Unzutreffendes streichen.
```
