/*
  Warnings:

  - You are about to drop the column `decription` on the `Profession` table. All the data in the column will be lost.
  - You are about to alter the column `rating` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `picture` to the `Profession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Profession" DROP COLUMN "decription",
ADD COLUMN     "picture" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" ALTER COLUMN "rating" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "rating" DECIMAL(65,30);
