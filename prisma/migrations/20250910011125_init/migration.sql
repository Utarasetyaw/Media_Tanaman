-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'JOURNALIST', 'USER');

-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AdminEditRequestStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "public"."CareLevel" AS ENUM ('Mudah', 'Sedang', 'Sulit');

-- CreateEnum
CREATE TYPE "public"."PlantSize" AS ENUM ('Kecil', 'Sedang', 'Besar');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlantType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PlantType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "excerpt" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "feedback" TEXT,
    "seo" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "adminEditRequest" "public"."AdminEditRequestStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "plantTypeId" INTEGER,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plant" (
    "id" SERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "scientificName" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "careLevel" "public"."CareLevel" NOT NULL,
    "size" "public"."PlantSize" NOT NULL,
    "stores" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "familyId" INTEGER NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "eventType" "public"."EventType" NOT NULL,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventSubmission" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "submissionUrl" TEXT NOT NULL,
    "submissionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EventSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "businessDescription" JSONB,
    "contactInfo" JSONB,
    "faqs" JSONB,
    "companyValues" JSONB,
    "privacyPolicy" JSONB,
    "seo" JSONB,
    "googleAnalyticsId" TEXT,
    "googleAdsId" TEXT,
    "metaPixelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "tagline" JSONB,
    "siteSettingsId" INTEGER NOT NULL,

    CONSTRAINT "BannerImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlantType_name_key" ON "public"."PlantType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_plantTypeId_fkey" FOREIGN KEY ("plantTypeId") REFERENCES "public"."PlantType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plant" ADD CONSTRAINT "Plant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plant" ADD CONSTRAINT "Plant_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."PlantType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSubmission" ADD CONSTRAINT "EventSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSubmission" ADD CONSTRAINT "EventSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerImage" ADD CONSTRAINT "BannerImage_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "public"."SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
