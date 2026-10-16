-- Automatische Stellenvorschläge mit Bewertung
ALTER TABLE "JobLead" ADD COLUMN "score" INTEGER;
ALTER TABLE "JobLead" ADD COLUMN "matchNotes" TEXT;
ALTER TABLE "JobLead" ADD COLUMN "aiNote" TEXT;
ALTER TABLE "JobLead" ADD COLUMN "meta" TEXT;
