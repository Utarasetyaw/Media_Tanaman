/*
  Warnings:

  - The values [JOURNAIST_REVISING] on the enum `ArticleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AdType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'BANNER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ArticleStatus_new" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED', 'PUBLISHED', 'REJECTED');
ALTER TABLE "public"."Article" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Article" ALTER COLUMN "status" TYPE "public"."ArticleStatus_new" USING ("status"::text::"public"."ArticleStatus_new");
ALTER TYPE "public"."ArticleStatus" RENAME TO "ArticleStatus_old";
ALTER TYPE "public"."ArticleStatus_new" RENAME TO "ArticleStatus";
DROP TYPE "public"."ArticleStatus_old";
ALTER TABLE "public"."Article" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- CreateTable
CREATE TABLE "public"."AdPlacement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AdType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdContent" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "placementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdPlacement_name_key" ON "public"."AdPlacement"("name");

-- AddForeignKey
ALTER TABLE "public"."AdContent" ADD CONSTRAINT "AdContent_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "public"."AdPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
