-- CreateEnum
CREATE TYPE "ServiceState" AS ENUM ('REJECTED', 'ACCEPTED', 'CANCELED', 'COMPLETED', 'PENDING');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "state" "ServiceState" NOT NULL DEFAULT 'PENDING';
