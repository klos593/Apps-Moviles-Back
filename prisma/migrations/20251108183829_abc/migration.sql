/*
  Warnings:

  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,street,number,postalCode,country,province,floor]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `floor` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Address_userId_street_number_postalCode_country_state_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "state",
ADD COLUMN     "floor" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthDate";

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_street_number_postalCode_country_province_fl_key" ON "Address"("userId", "street", "number", "postalCode", "country", "province", "floor");
