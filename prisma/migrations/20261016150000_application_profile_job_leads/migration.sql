-- AlterTable
ALTER TABLE "ServiceBooking" ADD COLUMN     "aliasLocal" TEXT,
ADD COLUMN     "consentSendAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ApplicationProfile" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "photoFile" TEXT,
    "ownCvFile" TEXT,
    "useOwnCv" BOOLEAN NOT NULL DEFAULT false,
    "baseLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLead" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'BA',
    "sourceRef" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "city" TEXT,
    "url" TEXT,
    "applyUrl" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "description" TEXT,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SELECTED',
    "sentAt" TIMESTAMP(3),
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationProfile_bookingId_key" ON "ApplicationProfile"("bookingId");

-- CreateIndex
CREATE INDEX "JobLead_bookingId_status_idx" ON "JobLead"("bookingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobLead_bookingId_source_sourceRef_key" ON "JobLead"("bookingId", "source", "sourceRef");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_aliasLocal_key" ON "ServiceBooking"("aliasLocal");

-- AddForeignKey
ALTER TABLE "ApplicationProfile" ADD CONSTRAINT "ApplicationProfile_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLead" ADD CONSTRAINT "JobLead_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

