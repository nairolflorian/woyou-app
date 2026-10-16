-- Karriereseiten-Feeds einzelner Arbeitgeber
CREATE TABLE "CareerFeed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastCount" INTEGER,
    "lastError" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerFeed_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CareerFeed_kind_slug_key" ON "CareerFeed"("kind", "slug");
