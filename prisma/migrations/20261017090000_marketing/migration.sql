-- Marketingstrecke: Abmeldung, Herkunft, versendete Schritte
ALTER TABLE "User" ADD COLUMN "marketingOptOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "signupSource" TEXT;
CREATE TABLE "MarketingSend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketingSend_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MarketingSend_userId_step_key" ON "MarketingSend"("userId", "step");
ALTER TABLE "MarketingSend" ADD CONSTRAINT "MarketingSend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
