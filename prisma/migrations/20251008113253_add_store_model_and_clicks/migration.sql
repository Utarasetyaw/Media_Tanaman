/*
  Warnings:

  - You are about to drop the column `stores` on the `Plant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plant" DROP COLUMN "stores";

-- CreateTable
CREATE TABLE "public"."Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "plantId" INTEGER NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Store" ADD CONSTRAINT "Store_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
