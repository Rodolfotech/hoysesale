-- YA APLICADO en PRODUCCIÓN (Supabase) el 30-10-2026. Se conserva como registro; no queda nada pendiente.
-- Lo demás ya existe en producción: tablas de negocio y medios, event_interactions y rate_limits.
-- Son las columnas que faltaban según la revisión de information_schema del 30-10-2026.

BEGIN;

ALTER TABLE "business_services"
    ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "aboutImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "logoShape" TEXT NOT NULL DEFAULT 'round',
    ADD COLUMN IF NOT EXISTS "phoneLabel" TEXT,
    ADD COLUMN IF NOT EXISTS "addressLabel" TEXT,
    ADD COLUMN IF NOT EXISTS "instagramLabel" TEXT,
    ADD COLUMN IF NOT EXISTS "websiteLabel" TEXT,
    ADD COLUMN IF NOT EXISTS "hiddenTabs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "contactInAllTabs" BOOLEAN NOT NULL DEFAULT false;

COMMIT;
