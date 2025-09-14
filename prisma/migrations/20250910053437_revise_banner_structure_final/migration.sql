/*
  Warnings:

  - You are about to drop the column `tagline` on the `BannerImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."BannerImage" DROP COLUMN "tagline";

-- AlterTable
ALTER TABLE "public"."SiteSettings" ADD COLUMN     "bannerTagline" JSONB;
