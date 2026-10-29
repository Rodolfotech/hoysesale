-- AlterTable
ALTER TABLE "users" ADD COLUMN     "comuna" TEXT;

-- CreateTable
CREATE TABLE "instagram_clicks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_clicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "instagram_clicks" ADD CONSTRAINT "instagram_clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
