-- Weg 1, Selbstversand (23.10.2026): nur Ergänzungen, keine Änderung an bestehenden Daten.

-- eigene E-Mail-Adresse für Bewerbungen (leer = Login-Mail)
ALTER TABLE "Candidate" ADD COLUMN "applicationEmail" TEXT;

-- E-Mail-Entwurf je gemerkter Stelle und eigene Erinnerung zum Nachfassen
ALTER TABLE "SavedJob" ADD COLUMN "mailTo" TEXT;
ALTER TABLE "SavedJob" ADD COLUMN "mailSubject" TEXT;
ALTER TABLE "SavedJob" ADD COLUMN "mailBody" TEXT;
ALTER TABLE "SavedJob" ADD COLUMN "followUpAt" TIMESTAMP(3);
