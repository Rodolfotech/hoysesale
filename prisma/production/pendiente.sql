-- Pendiente para PRODUCCIÓN (Supabase). NO ejecutar sin confirmación y respaldo.
-- Agrega lo que falta respecto de prisma/migrations (20261027120000 … 20261028120000).
-- Diferencia deliberada: ownerId/authorId de business_* son UUID porque users.id es uuid en producción.
-- Las tablas nuevas empiezan vacías: no hay datos que copiar desde local.

BEGIN;

-- 1) Medios de eventos
CREATE TYPE "MediaSource" AS ENUM ('UPLOAD', 'INSTAGRAM', 'LINK');
CREATE TABLE "event_media" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" "MediaSource" NOT NULL,
    "imageUrl" TEXT,
    "storagePath" TEXT,
    "caption" TEXT,
    "permalink" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_media_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "event_media_eventId_idx" ON "event_media"("eventId");
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2) Perfil de negocio en users (columnas nuevas, todas nulas; slug único admite varios NULL)
ALTER TABLE "users"
    ADD COLUMN "slug" TEXT,
    ADD COLUMN "category" TEXT,
    ADD COLUMN "logoUrl" TEXT,
    ADD COLUMN "coverUrl" TEXT,
    ADD COLUMN "businessDescription" TEXT,
    ADD COLUMN "hours" JSONB,
    ADD COLUMN "amenities" JSONB,
    ADD COLUMN "whatsappReservations" TEXT,
    ADD COLUMN "mapUrl" TEXT;
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- 3) Insignias y filtros en events (columnas nuevas, nulas)
ALTER TABLE "events"
    ADD COLUMN "entryType" TEXT,
    ADD COLUMN "audience" TEXT,
    ADD COLUMN "indoor" BOOLEAN,
    ADD COLUMN "amenities" JSONB;

-- 4) Métricas del organizador
CREATE TABLE "event_interactions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_interactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "event_interactions_eventId_type_idx" ON "event_interactions"("eventId", "type");
ALTER TABLE "event_interactions" ADD CONSTRAINT "event_interactions_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Contenido del micro-sitio (ownerId/authorId en UUID para coincidir con users.id)
CREATE TABLE "business_products" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "imageUrl" TEXT,
    "tag" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "business_services" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_services_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "business_highlights" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_highlights_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "business_reviews" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_reviews_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "business_products_ownerId_idx" ON "business_products"("ownerId");
CREATE INDEX "business_services_ownerId_idx" ON "business_services"("ownerId");
CREATE INDEX "business_highlights_ownerId_idx" ON "business_highlights"("ownerId");
CREATE UNIQUE INDEX "business_reviews_ownerId_authorId_key" ON "business_reviews"("ownerId", "authorId");
ALTER TABLE "business_products" ADD CONSTRAINT "business_products_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_highlights" ADD CONSTRAINT "business_highlights_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
