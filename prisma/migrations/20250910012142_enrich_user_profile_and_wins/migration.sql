-- AlterTable
ALTER TABLE "public"."EventSubmission" ADD COLUMN     "placement" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "socialMedia" JSONB;
