-- AlterTable
ALTER TABLE "users" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "businessDescription" TEXT,
ADD COLUMN     "hours" JSONB,
ADD COLUMN     "amenities" JSONB,
ADD COLUMN     "whatsappReservations" TEXT,
ADD COLUMN     "mapUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");
