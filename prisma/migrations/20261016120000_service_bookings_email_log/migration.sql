-- CreateTable
CREATE TABLE "ServiceBooking" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "packageKey" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "contactPhone" TEXT,
    "targetJobs" TEXT,
    "targetRegions" TEXT,
    "notes" TEXT,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL,
    "waiverAcceptedAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "applicationsSent" INTEGER NOT NULL DEFAULT 0,
    "applicationsGoal" INTEGER NOT NULL DEFAULT 25,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_stripeSessionId_key" ON "ServiceBooking"("stripeSessionId");

-- CreateIndex
CREATE INDEX "ServiceBooking_status_createdAt_idx" ON "ServiceBooking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceBooking_candidateId_idx" ON "ServiceBooking"("candidateId");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

