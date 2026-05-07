-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "attachmentFilename" TEXT,
ADD COLUMN     "attachmentMime" TEXT,
ADD COLUMN     "attachmentOriginalName" TEXT,
ADD COLUMN     "attachmentSize" INTEGER;
