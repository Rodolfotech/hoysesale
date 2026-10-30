-- Texto que acompaña a la dirección en el micro-sitio, por ejemplo "Ubicación". Vacío se muestra como "Dirección".
ALTER TABLE "users" ADD COLUMN "addressLabel" TEXT;
