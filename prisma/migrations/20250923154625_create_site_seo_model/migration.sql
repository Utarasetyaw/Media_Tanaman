/*
  Warnings:

  - The values [JOURNALIST_REVISING] on the enum `ArticleStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `googleSiteVerificationId` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaKeywords` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `ogDefaultDescription` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `ogDefaultImageUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `ogDefaultTitle` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `twitterSite` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ArticleStatus_new" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_REVISION', 'JOURNAIST_REVISING', 'REVISED', 'PUBLISHED', 'REJECTED');
ALTER TABLE "public"."Article" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Article" ALTER COLUMN "status" TYPE "public"."ArticleStatus_new" USING ("status"::text::"public"."ArticleStatus_new");
ALTER TYPE "public"."ArticleStatus" RENAME TO "ArticleStatus_old";
ALTER TYPE "public"."ArticleStatus_new" RENAME TO "ArticleStatus";
DROP TYPE "public"."ArticleStatus_old";
ALTER TABLE "public"."Article" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."SiteSettings" DROP COLUMN "googleSiteVerificationId",
DROP COLUMN "metaDescription",
DROP COLUMN "metaKeywords",
DROP COLUMN "metaTitle",
DROP COLUMN "ogDefaultDescription",
DROP COLUMN "ogDefaultImageUrl",
DROP COLUMN "ogDefaultTitle",
DROP COLUMN "twitterSite";

-- CreateTable
CREATE TABLE "public"."SiteSeo" (
    "id" SERIAL NOT NULL,
    "siteSettingsId" INTEGER NOT NULL,
    "metaTitle" JSONB,
    "metaDescription" JSONB,
    "metaKeywords" TEXT,
    "ogDefaultTitle" JSONB,
    "ogDefaultDescription" JSONB,
    "ogDefaultImageUrl" TEXT,
    "twitterSite" TEXT,
    "googleSiteVerificationId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSeo_siteSettingsId_key" ON "public"."SiteSeo"("siteSettingsId");

-- AddForeignKey
ALTER TABLE "public"."SiteSeo" ADD CONSTRAINT "SiteSeo_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "public"."SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
