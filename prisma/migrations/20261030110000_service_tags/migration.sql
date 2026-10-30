-- Etiquetas libres de cada servicio del micro-sitio.
ALTER TABLE "business_services" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
