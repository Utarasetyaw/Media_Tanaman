/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `plantTypeId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `careLevel` on the `Plant` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Plant` table. All the data in the column will be lost.
  - You are about to drop the column `familyId` on the `Plant` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Plant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_plantTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Plant" DROP CONSTRAINT "Plant_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Plant" DROP CONSTRAINT "Plant_familyId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "categoryId",
DROP COLUMN "plantTypeId";

-- AlterTable
ALTER TABLE "public"."Plant" DROP COLUMN "careLevel",
DROP COLUMN "categoryId",
DROP COLUMN "familyId",
DROP COLUMN "size",
ADD COLUMN     "plantTypeId" INTEGER;

-- DropEnum
DROP TYPE "public"."CareLevel";

-- DropEnum
DROP TYPE "public"."PlantSize";

-- CreateTable
CREATE TABLE "public"."JournalistMessage" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalistMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Plant" ADD CONSTRAINT "Plant_plantTypeId_fkey" FOREIGN KEY ("plantTypeId") REFERENCES "public"."PlantType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
