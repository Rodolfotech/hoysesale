-- Visibilidad de los datos de contacto en el micro-sitio.
ALTER TABLE "users" ADD COLUMN "contactTabHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "contactInAllTabs" BOOLEAN NOT NULL DEFAULT false;
