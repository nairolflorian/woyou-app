-- Weg 1 (22.10.2026): Bewerbungsunterlagen plus Bewerbungswerkzeug statt Bewerbungen durch das Team.
-- Nur Ergänzungen. Alte Tabellen und Spalten (JobLead, CreditEntry, aliasLocal, consentSendAt,
-- subscriptionUntil, applicationsSent ...) bleiben unverändert, damit die Daten von main erhalten bleiben.

-- Werkzeug-Zugang je Kund:in
ALTER TABLE "Candidate" ADD COLUMN "toolAccessUntil" TIMESTAMP(3);

-- Monate Werkzeug, die mit einem Paket gebucht wurden
ALTER TABLE "ServiceBooking" ADD COLUMN "toolMonths" INTEGER NOT NULL DEFAULT 0;

-- Verlängerung/Abo: freigeschaltete Monate
ALTER TABLE "CreditPurchase" ADD COLUMN "months" INTEGER;

-- Bewerbungs-Tracker der Kund:innen
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRef" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "city" TEXT,
    "url" TEXT,
    "applyUrl" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "description" TEXT,
    "meta" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "appliedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "interviewAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "coverLetter" TEXT,
    "letterLang" TEXT NOT NULL DEFAULT 'de',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedJob_candidateId_source_sourceRef_key" ON "SavedJob"("candidateId", "source", "sourceRef");
CREATE INDEX "SavedJob_candidateId_status_idx" ON "SavedJob"("candidateId", "status");
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bestandskund:innen (bezahltes Paket vor Weg 1) werden hier bewusst NICHT automatisch freigeschaltet.
-- Wie lange sie das Werkzeug bekommen, entscheidet Rachid; dann einmalig z. B.:
--   UPDATE "Candidate" c SET "toolAccessUntil" = NOW() + INTERVAL '3 months'
--   WHERE c."toolAccessUntil" IS NULL AND EXISTS (SELECT 1 FROM "ServiceBooking" b WHERE b."candidateId" = c."id" AND b."paidAt" IS NOT NULL AND b."status" <> 'CANCELLED');
