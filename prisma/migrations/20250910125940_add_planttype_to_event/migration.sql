-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "plantTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_plantTypeId_fkey" FOREIGN KEY ("plantTypeId") REFERENCES "public"."PlantType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
