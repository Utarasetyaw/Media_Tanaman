/*
  Warnings:

  - You are about to drop the column `seo` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `seo` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Article" DROP COLUMN "seo";

-- AlterTable
ALTER TABLE "public"."SiteSettings" DROP COLUMN "seo",
ADD COLUMN     "googleSiteVerificationId" TEXT,
ADD COLUMN     "metaDescription" JSONB,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "metaTitle" JSONB,
ADD COLUMN     "ogDefaultDescription" JSONB,
ADD COLUMN     "ogDefaultImageUrl" TEXT,
ADD COLUMN     "ogDefaultTitle" JSONB,
ADD COLUMN     "twitterSite" TEXT;

-- CreateTable
CREATE TABLE "public"."ArticleSeo" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "metaTitle" JSONB,
    "metaDescription" JSONB,
    "keywords" TEXT,
    "canonicalUrl" TEXT,
    "metaRobots" TEXT DEFAULT 'index, follow',
    "ogTitle" JSONB,
    "ogDescription" JSONB,
    "ogImageUrl" TEXT,
    "ogType" TEXT DEFAULT 'article',
    "ogUrl" TEXT,
    "ogSiteName" TEXT,
    "twitterCard" TEXT DEFAULT 'summary_large_image',
    "twitterTitle" JSONB,
    "twitterDescription" JSONB,
    "twitterImageUrl" TEXT,
    "twitterSite" TEXT,
    "twitterCreator" TEXT,
    "structuredData" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSeo_articleId_key" ON "public"."ArticleSeo"("articleId");

-- AddForeignKey
ALTER TABLE "public"."ArticleSeo" ADD CONSTRAINT "ArticleSeo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
