-- Hasta 3 fotos del negocio para la sección "Nosotros".
ALTER TABLE "users" ADD COLUMN "aboutImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
