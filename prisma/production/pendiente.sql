-- Último SQL manual para PRODUCCIÓN (Supabase). Estado: APLICADO el 17-11-2026 (verificado: news | boolean | false | NO).
-- Antes: "yearRound", "hoySeSale" y "featured" el 13-11-2026; las columnas de negocio el 30-10-2026.
-- Si se agrega otra columna, reemplaza este contenido y marca el estado como PENDIENTE.

BEGIN;

ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "news" BOOLEAN NOT NULL DEFAULT false;

COMMIT;
