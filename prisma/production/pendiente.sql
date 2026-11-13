-- PENDIENTE en PRODUCCIÓN (Supabase). Aplicar ANTES de desplegar el commit con la casilla "Lo nuevo en la región":
-- sin esta columna fallan la creación y el listado de eventos.
-- Ya aplicado el 13-11-2026: "yearRound", "hoySeSale" y "featured"; y el 30-10-2026, las columnas de negocio.

BEGIN;

ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "news" BOOLEAN NOT NULL DEFAULT false;

COMMIT;
