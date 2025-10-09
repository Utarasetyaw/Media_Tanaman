-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "journalistAnnouncement" JSONB,
    "userAnnouncement" JSONB,
    "journalistRules" JSONB,
    "userRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
