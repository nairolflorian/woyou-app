-- Guthaben (Credits), Nachkauf und Abo
ALTER TABLE "Candidate" ADD COLUMN "subscriptionUntil" TIMESTAMP(3);

CREATE TABLE "CreditEntry" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "bookingId" TEXT,
    "leadId" TEXT,
    "purchaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CreditEntry_leadId_key" ON "CreditEntry"("leadId");
CREATE INDEX "CreditEntry_candidateId_idx" ON "CreditEntry"("candidateId");
ALTER TABLE "CreditEntry" ADD CONSTRAINT "CreditEntry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "stripeSessionId" TEXT,
    "stripeSubscriptionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CreditPurchase_stripeSubscriptionId_key" ON "CreditPurchase"("stripeSubscriptionId");
CREATE INDEX "CreditPurchase_candidateId_idx" ON "CreditPurchase"("candidateId");
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bestehende bezahlte Buchungen: Startguthaben gutschreiben und bereits verschickte Bewerbungen abziehen
INSERT INTO "CreditEntry" ("id", "candidateId", "delta", "reason", "note", "bookingId")
SELECT 'mig' || md5(b."id" || 'start'), b."candidateId", b."applicationsGoal", 'START', 'Startpaket (Übernahme)', b."id"
FROM "ServiceBooking" b WHERE b."paidAt" IS NOT NULL;
INSERT INTO "CreditEntry" ("id", "candidateId", "delta", "reason", "note", "bookingId", "leadId")
SELECT 'mig' || md5(l."id"), b."candidateId", -1, 'APPLICATION', l."company", b."id", l."id"
FROM "JobLead" l JOIN "ServiceBooking" b ON b."id" = l."bookingId"
WHERE b."paidAt" IS NOT NULL AND l."status" IN ('SENT', 'APPLIED_MANUALLY');
