-- Pestañas del micro-sitio ocultas a los visitantes. Reemplaza a contactTabHidden.
ALTER TABLE "users" ADD COLUMN "hiddenTabs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "users" SET "hiddenTabs" = ARRAY['contactanos'] WHERE "contactTabHidden";
ALTER TABLE "users" DROP COLUMN "contactTabHidden";
