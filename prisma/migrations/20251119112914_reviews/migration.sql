-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasPendingReviews" BOOLEAN NOT NULL DEFAULT false;
