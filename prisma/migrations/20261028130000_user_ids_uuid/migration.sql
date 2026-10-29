-- Alinea los ids de usuario con producción (Supabase), donde users.id y sus referencias son UUID.
-- Los datos existentes son cadenas UUID válidas, así que el cast es seguro.

-- 1) Soltar llaves foráneas que apuntan a users.id o a una columna de usuario
ALTER TABLE "events" DROP CONSTRAINT "events_ownerId_fkey";
ALTER TABLE "attendees" DROP CONSTRAINT "attendees_userId_fkey";
ALTER TABLE "instagram_clicks" DROP CONSTRAINT "instagram_clicks_userId_fkey";
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_adminId_fkey";
ALTER TABLE "business_products" DROP CONSTRAINT "business_products_ownerId_fkey";
ALTER TABLE "business_services" DROP CONSTRAINT "business_services_ownerId_fkey";
ALTER TABLE "business_highlights" DROP CONSTRAINT "business_highlights_ownerId_fkey";
ALTER TABLE "business_reviews" DROP CONSTRAINT "business_reviews_ownerId_fkey";
ALTER TABLE "business_reviews" DROP CONSTRAINT "business_reviews_authorId_fkey";

-- 2) Cambiar el tipo de las columnas
ALTER TABLE "users" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "events" ALTER COLUMN "ownerId" TYPE UUID USING "ownerId"::uuid;
ALTER TABLE "attendees" ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;
ALTER TABLE "instagram_clicks" ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;
ALTER TABLE "admin_audit_logs" ALTER COLUMN "adminId" TYPE UUID USING "adminId"::uuid;
ALTER TABLE "business_products" ALTER COLUMN "ownerId" TYPE UUID USING "ownerId"::uuid;
ALTER TABLE "business_services" ALTER COLUMN "ownerId" TYPE UUID USING "ownerId"::uuid;
ALTER TABLE "business_highlights" ALTER COLUMN "ownerId" TYPE UUID USING "ownerId"::uuid;
ALTER TABLE "business_reviews" ALTER COLUMN "ownerId" TYPE UUID USING "ownerId"::uuid;
ALTER TABLE "business_reviews" ALTER COLUMN "authorId" TYPE UUID USING "authorId"::uuid;

-- 3) Volver a crear las llaves foráneas con las mismas reglas que las migraciones originales
ALTER TABLE "events" ADD CONSTRAINT "events_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "instagram_clicks" ADD CONSTRAINT "instagram_clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "business_products" ADD CONSTRAINT "business_products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_highlights" ADD CONSTRAINT "business_highlights_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
