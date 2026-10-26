-- Selbstcheck-Statistik (Pilot Westbalkan, 26.10.2026): nur neue Tabelle, keine Änderung an bestehenden Daten.
-- Gespeichert wird das Ergebnis ohne Personenbezug: Ländercode, Berufsgruppe, Deutschniveau, Ampel, Sprache, Werbequelle.

CREATE TABLE "SelfCheckResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT NOT NULL,
    "balkan" BOOLEAN NOT NULL,
    "gruppe" TEXT,
    "german" TEXT,
    "level" TEXT NOT NULL,
    "locale" TEXT,
    "source" TEXT,

    CONSTRAINT "SelfCheckResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SelfCheckResult_createdAt_idx" ON "SelfCheckResult"("createdAt");
