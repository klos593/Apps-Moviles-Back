-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "addressId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
