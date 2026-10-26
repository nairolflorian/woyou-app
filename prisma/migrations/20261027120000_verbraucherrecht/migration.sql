-- Verbraucherrecht (26.10.2026): Widerrufe und Kündigungen. Nur neue Tabellen, keine Änderung an bestehenden Daten.

CREATE TABLE "Widerruf" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "bookingId" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OFFEN',
    "refundCents" INTEGER,
    "refundedAt" TIMESTAMP(3),
    "stripeRefundId" TEXT,
    "adminNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widerruf_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Kuendigung" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "art" TEXT NOT NULL,
    "grund" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bookingRef" TEXT,
    "bookingId" TEXT,
    "vertrag" TEXT NOT NULL,
    "wirksam" TEXT NOT NULL,
    "wirksamZu" TIMESTAMP(3),
    "bestaetigungEmail" TEXT NOT NULL,
    "vertragsende" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OFFEN',
    "adminNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kuendigung_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Widerruf_createdAt_idx" ON "Widerruf"("createdAt");
CREATE INDEX "Widerruf_bookingId_idx" ON "Widerruf"("bookingId");
CREATE INDEX "Kuendigung_createdAt_idx" ON "Kuendigung"("createdAt");
