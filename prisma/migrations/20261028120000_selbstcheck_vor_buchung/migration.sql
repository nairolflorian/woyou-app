-- Schalter „Selbstcheck vor der Buchung“ (standardmäßig aus): nur eine neue, leere Spalte, keine Änderung an bestehenden Daten.
-- Inhalt: letztes Selbstcheck-Ergebnis als JSON {level, datum, land?, gruppe?}, kein Freitext.

ALTER TABLE "Candidate" ADD COLUMN "selbstcheck" TEXT;
