-- Englische Fassung der Bewerbungsunterlagen (optional)
ALTER TABLE "ApplicationProfile" ADD COLUMN "dataEn" TEXT;
ALTER TABLE "JobLead" ADD COLUMN "lang" TEXT NOT NULL DEFAULT 'de';
